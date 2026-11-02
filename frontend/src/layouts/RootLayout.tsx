import { useState } from 'react'
import { Outlet } from 'react-router'
import Header, { BottomNav } from '../components/Header'
import { AddActionDialog } from '../components/AddActionDialog'
import { useAuth } from '../auth/authcontext'
import type { LayoutContext } from './useLayout'

export default function RootLayout() {
    const [dialog, setDialog] = useState<{ open: boolean; pillarId?: string }>({ open: false })
    const context: LayoutContext = { openAddAction: (pillarId) => setDialog({ open: true, pillarId }) }
    const openBlank = () => context.openAddAction()

    // Signing out clears the session, and <RequireAuth /> then redirects to /signup.
    // No navigate() is needed here. signOut() resolves to an error message or null.
    const { signOut } = useAuth()
    const handleSignOut = async () => {
        const error = await signOut()
        if (error) window.alert(error) // placeholder: swap for your own message/toast UI
    }

    return (
        <>
            <Header onAdd={openBlank} onSignOut={handleSignOut} />
            <main>
                <Outlet context={context} />
            </main>
            <BottomNav onAdd={openBlank} />
            <AddActionDialog open={dialog.open} pillarId={dialog.pillarId} onClose={() => setDialog({ open: false })} />
        </>
    )
}
