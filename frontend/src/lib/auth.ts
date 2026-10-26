/**
 * lib/auth.ts - the auth module (service layer).
 *
 * CONTRACT
 *   signUp({ email, password, name?, timezone, redirectTo? }) -> AuthResult
 *   logIn({ email, password })                                -> AuthResult
 *
 *   AuthResult is exactly one of:
 *     { status: 'signed_in' }              user is signed in (session exists)
 *     { status: 'confirm_email' }          account created or already exists, but
 *                                          there is no session yet; ask the user to
 *                                          check their email
 *     { status: 'error', message: string } friendly text, safe to show the user
 *
 * RULES
 *   - Never throws. Every failure comes back as { status: 'error' }.
 *   - Knows about Supabase only. No React, no routing, no browser APIs.
 *     The page decides where to navigate and supplies the timezone.
 *   - The database trigger (handle_new_user) creates the profiles row from the
 *     user metadata sent below. This module never writes to the database.
 *   - Validation here is a sanity check only. The real authority on password
 *     rules is the Supabase Auth settings. Keep MIN_PASSWORD_LENGTH in sync with
 *     the "Minimum password length" setting in the dashboard.
 *   - Uses the publishable key client only. Never import a secret key here.
 */
import type { AuthError } from '@supabase/supabase-js';
// ASSUMPTION: supabase.ts exports the client as a named export called `supabase`.
// If yours is a default export or has another name, change this one line.
import { supabase } from './supabase.ts';

export const MIN_PASSWORD_LENGTH = 8;

export type AuthResult =
  | { status: 'signed_in' }
  | { status: 'confirm_email' }
  | { status: 'error'; message: string };

export interface SignUpInput {
  email: string;
  password: string;
  /** Optional. The trigger falls back to the email prefix when missing. */
  name?: string;
  /** IANA name such as "Europe/Brussels". Supplied by the page. */
  timezone: string;
  /** Where the confirmation link sends the user. Must be an allowed redirect URL. */
  redirectTo?: string;
}

export interface LogInInput {
  email: string;
  password: string;
}

const GENERIC_ERROR = 'Something went wrong. Please try again.';

/** Turn a Supabase AuthError into text that is safe to show to a user. */
function friendlyMessage(error: AuthError): string {
  switch (error.code) {
    case 'weak_password':
      return `Please choose a stronger password (at least ${MIN_PASSWORD_LENGTH} characters).`;
    case 'user_already_exists':
      return 'An account with that email may already exist. Try logging in instead.';
    case 'invalid_credentials':
      // Deliberately vague: do not reveal whether the email exists.
      return 'Invalid email or password.';
    case 'email_not_confirmed':
      return 'Please confirm your email address before logging in.';
    case 'over_request_rate_limit':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return GENERIC_ERROR;
  }
}

function fail(message: string): AuthResult {
  return { status: 'error', message };
}

export async function signUp(input: SignUpInput): Promise<AuthResult> {
  const email = input.email.trim();
  if (!email) return fail('Please enter your email address.');
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return fail(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  const name = input.name?.trim();

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: {
        // These keys are read by the handle_new_user trigger. Keep them in sync.
        data: {
          ...(name ? { display_name: name } : {}),
          timezone: input.timezone,
        },
        emailRedirectTo: input.redirectTo,
      },
    });

    if (error) return fail(friendlyMessage(error));

    // With "Confirm email" on, a user comes back but session is null. For an
    // already-registered email Supabase returns an obfuscated user the same way,
    // so we show the same message and never reveal whether the account existed.
    return data.session ? { status: 'signed_in' } : { status: 'confirm_email' };
  } catch {
    return fail(GENERIC_ERROR);
  }
}

export async function logIn(input: LogInInput): Promise<AuthResult> {
  const email = input.email.trim();
  if (!email || !input.password) return fail('Please enter your email and password.');

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: input.password,
    });
    if (error) return fail(friendlyMessage(error));
    return { status: 'signed_in' };
  } catch {
    return fail(GENERIC_ERROR);
  }
}
