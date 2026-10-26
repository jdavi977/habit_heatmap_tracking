import React, { useContext, useMemo, useReducer, useRef, useState, createElement, useEffect, useLayoutEffect } from "react"
import { applyDelta, ReflexEvent, hydrateClientStorage, useEventLoop, refs } from "$/utils/state"
import { ColorModeContext, UploadFilesContext, DispatchContext, EventLoopContext, getStateContext, registerApp, eventLoop } from "$/utils/context-registry"
import { jsx } from "@emotion/react";

// Disable React dev-build owner-stack capture: the per-element Error()
// dominates dev-mode render CPU on large pages. Costs owner frames in
// `React.captureOwnerStack()`; set REFLEX_REACT_OWNER_STACKS=1 to restore.
// Full context: https://github.com/reflex-dev/reflex/pull/6905
if (typeof window !== "undefined") {
  try {
    const reactInternals =
      React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    const ownerStackCounterKey = "recentlyCreatedOwnerStacks";
    if (
      reactInternals &&
      typeof reactInternals[ownerStackCounterKey] === "number"
    ) {
      Object.defineProperty(reactInternals, ownerStackCounterKey, {
        get: () => 1e9,
        set: () => {},
        configurable: true,
      });
    }
  } catch {}
}

export { ColorModeContext, UploadFilesContext, DispatchContext, EventLoopContext };
export const initialState = {"reflex___state____state": {"is_hydrated_rx_state_": false, "rx_router_headers_rx_state_": {"host": "", "origin": "", "upgrade": "", "connection": "", "pragma": "", "cache_control": "", "user_agent": "", "sec_websocket_version": "", "sec_websocket_key": "", "sec_websocket_extensions": "", "accept_encoding": "", "accept_language": "", "raw_headers": {}}, "rx_router_page_rx_state_": {"host": "", "path": "", "raw_path": "", "full_path": "", "full_raw_path": "", "params": {}}, "rx_router_route_id_rx_state_": "", "rx_router_session_rx_state_": {"client_token": "", "client_ip": "", "session_id": ""}, "rx_router_url_rx_state_": {"scheme": "", "netloc": "", "origin": "://", "path": "", "query": "", "query_parameters": {}, "fragment": "", "href": ""}}, "reflex___state____state.heatmaps_app___pages___home____state": {}, "reflex___state____state.reflex___istate___shared____shared_state_base_internal": {}, "reflex___state____state.reflex___state____frontend_event_exception_state": {}, "reflex___state____state.reflex___state____on_load_internal_state": {}, "reflex___state____state.reflex___state____update_vars_internal_state": {}}
export const initialStateHashes = ["b505d70580216c94", "d029e8db883816fc", "bf21a9e8fbc5a384", "bf21a9e8fbc5a384", "bf21a9e8fbc5a384", "bf21a9e8fbc5a384", "bf21a9e8fbc5a384"]

export const defaultColorMode = "system"
export const StateContexts = {reflex___state____state: getStateContext("reflex___state____state"),reflex___state____state__heatmaps_app___pages___home____state: getStateContext("reflex___state____state.heatmaps_app___pages___home____state"),reflex___state____state__reflex___istate___shared____shared_state_base_internal: getStateContext("reflex___state____state.reflex___istate___shared____shared_state_base_internal"),reflex___state____state__reflex___state____frontend_event_exception_state: getStateContext("reflex___state____state.reflex___state____frontend_event_exception_state"),reflex___state____state__reflex___state____on_load_internal_state: getStateContext("reflex___state____state.reflex___state____on_load_internal_state"),reflex___state____state__reflex___state____update_vars_internal_state: getStateContext("reflex___state____state.reflex___state____update_vars_internal_state"),};
export const clientStorage = {"cookies": {}, "local_storage": {}, "session_storage": {}}


export const state_name = "reflex___state____state"

export const exception_state_name = "reflex___state____state.reflex___state____frontend_event_exception_state"

// Tracked cookie and local storage vars set in the browser, or undefined if none.
const clientStorageVars = () => {
    const client_storage_vars = hydrateClientStorage(clientStorage);
    if (client_storage_vars && Object.keys(client_storage_vars).length !== 0) {
        return client_storage_vars;
    }
    return undefined;
}

// These events are triggered on each client-side page navigation.
export const onLoadInternalEvent = () => {
    const internal_events = [];

    // Only send the client storage vars if any are actually set in the browser.
    const client_storage_vars = clientStorageVars();
    if (client_storage_vars !== undefined) {
        internal_events.push(
            ReflexEvent(
                'reflex___state____state.reflex___state____update_vars_internal_state.update_vars_internal',
                {vars: client_storage_vars},
            ),
        );
    }

    // `on_load_internal` triggers the correct on_load event(s) for the current page.
    // If the page does not define any on_load event, this will just set `is_hydrated = true`.
    internal_events.push(ReflexEvent('reflex___state____state.reflex___state____on_load_internal_state.on_load_internal'));

    return internal_events;
}

// The single event sent when the websocket connects or reconnects: it resets and
// applies client storage, sends the state, and queues the page's on_load events.
// On the first connect the frontend still holds the compiled defaults, so it
// sends their hashes and the backend only returns the vars that differ; any
// later (re)hydrate gets the full state.
export const initialEvents = (first = false) => {
    const client_storage_vars = clientStorageVars();
    const payload = {};
    if (client_storage_vars !== undefined) {
        payload["vars"] = client_storage_vars;
    }
    if (first) {
        payload["hashes"] = initialStateHashes;
    }
    return [ReflexEvent('reflex___state____state.hydrate_and_load', payload)];
}


export const isDevMode = true;

// The static runtime reads these through the registry, so this module is the
// only one Vite re-executes when they change.
registerApp({
  initialState,
  clientStorage,
  state_name,
  exception_state_name,
  onLoadInternalEvent,
  initialEvents,
  isDevMode,
  defaultColorMode,
});

export function addEvents(events, args, event_actions) {
  return eventLoop.addEvents(events, args, event_actions);
}

export function getConnectErrors() {
  return eventLoop.connectErrors;
}

export function UploadFilesProvider({ children }) {
  const [filesById, setFilesById] = useState({})
  refs["__clear_selected_files"] = (id) => setFilesById(filesById => {
    const newFilesById = {...filesById}
    delete newFilesById[id]
    return newFilesById
  })
  return createElement(
    UploadFilesContext.Provider,
    { value: [filesById, setFilesById] },
    children
  );
}

// ``displayName`` is what React DevTools shows for the wrapper; without it
// every client-only component in the tree renders as ``Anonymous``.
export function ClientSide(component, name) {
  function ClientSideComponent({ children, ...props }) {
    const [Component, setComponent] = useState(null);
    useEffect(() => {
      async function load() {
        const comp = await component();
        setComponent(() => comp);
      }
      load();
    }, []);
    return Component ? jsx(Component, props, children) : null;
  }
  ClientSideComponent.displayName = name ? `ClientSide(${name})` : "ClientSide";
  return ClientSideComponent;
}

export function EventLoopProvider({ children }) {
  const dispatch = useContext(DispatchContext)
  const [addEventsLocal, connectErrors] = useEventLoop(
    dispatch,
    initialEvents,
    clientStorage,
  )
  // Publish the dispatchers so JSX literals constructed outside the
  // React-tree path (e.g. ``ErrorBoundary.onError``) can call ``addEvents``.
  eventLoop.addEvents = addEventsLocal;
  eventLoop.connectErrors = connectErrors;
  return useMemo(
    () =>
      createElement(
        EventLoopContext.Provider,
        { value: [addEventsLocal, connectErrors] },
        children
      ),
    [addEventsLocal, connectErrors, children],
  );
}

// ``useLayoutEffect`` warns when rendered on the server, where no effect runs
// at all, so fall back to ``useEffect`` there.
const useIsomorphicLayoutEffect =
  typeof document !== "undefined" ? useLayoutEffect : useEffect;

// Holds the mutable substate -> dispatch registry that ``SubstateProvider``
// writes into and ``EventLoopProvider`` reads. The registry object identity is
// stable for the lifetime of the tree, so neither adding a dispatcher nor
// updating a substate re-renders the consumers of ``DispatchContext``.
const DispatchProvider = ({ children }) => {
  const dispatchers = useRef({});
  return useMemo(
    () =>
      createElement(DispatchContext, { value: dispatchers.current }, children),
    [children],
  );
};

// One provider per substate: each owns its own reducer, so a delta for one
// substate only re-renders its provider instead of recreating every provider.
const SubstateProvider = ({ children, substateName, contextName }) => {
  const dispatchers = useContext(DispatchContext);
  const [state, dispatchSubstate] = useReducer(
    applyDelta,
    initialState[substateName],
  );
  // A layout effect, not a passive one: layout effects for the whole commit
  // run before any passive effect, so every dispatcher is registered before
  // ``EventLoopProvider`` (mounted below this provider) connects the socket.
  // A delta naming an unregistered substate is a fatal state mismatch.
  useIsomorphicLayoutEffect(() => {
    dispatchers[substateName] = dispatchSubstate;
    return () => {
      delete dispatchers[substateName];
    };
  }, [dispatchers, dispatchSubstate, substateName]);
  return useMemo(
    () => createElement(StateContexts[contextName], { value: state }, children),
    [children, state, contextName],
  );
};

// ``[substateName, contextName]`` for every substate, outermost first.
const SUBSTATES = [
  ['reflex___state____state', 'reflex___state____state'],
  ['reflex___state____state.heatmaps_app___pages___home____state', 'reflex___state____state__heatmaps_app___pages___home____state'],
  ['reflex___state____state.reflex___istate___shared____shared_state_base_internal', 'reflex___state____state__reflex___istate___shared____shared_state_base_internal'],
  ['reflex___state____state.reflex___state____frontend_event_exception_state', 'reflex___state____state__reflex___state____frontend_event_exception_state'],
  ['reflex___state____state.reflex___state____on_load_internal_state', 'reflex___state____state__reflex___state____on_load_internal_state'],
  ['reflex___state____state.reflex___state____update_vars_internal_state', 'reflex___state____state__reflex___state____update_vars_internal_state'],
];

function ClientStateProvider({ children }) {
  return useMemo(() => {
    let tree = children;
    for (let i = SUBSTATES.length - 1; i >= 0; i--) {
      const [substateName, contextName] = SUBSTATES[i];
      tree = createElement(SubstateProvider, { substateName, contextName }, tree);
    }
    return createElement(DispatchProvider, {}, tree);
  }, [children]);
}

// The server renders once and never applies a delta, so it provides the
// initial state through bare context providers. ``SubstateProvider`` would add
// a second render level per substate, and the server renderer recurses once per
// level, so with many substates rendering a page can exhaust the stack.
function ServerStateProvider({ children }) {
  let tree = children;
  for (let i = SUBSTATES.length - 1; i >= 0; i--) {
    const [substateName, contextName] = SUBSTATES[i];
    tree = createElement(
      StateContexts[contextName],
      { value: initialState[substateName] },
      tree,
    );
  }
  return createElement(DispatchContext, { value: {} }, tree);
}

export const StateProvider =
  typeof document === "undefined" ? ServerStateProvider : ClientStateProvider;
