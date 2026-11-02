import { Routes, Route } from 'react-router'
import RootLayout from './layouts/RootLayout'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import { PublicOnly, RequireAuth } from './auth/RouteGuards'

function App() {
  return (
    <>
      <Routes>
        {/* Only visible when signed OUT. Signed-in visitors are sent onward. */}
        {/* Pages that don't share header/footer */}
        <Route element={<PublicOnly />}>
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Only visible when signed IN. Signed-out visitors are sent to /signup. */}
        <Route element={<RequireAuth />}>
          {/* Pages that share header/footer */}
          {/* Make layout in /layouts */}
          <Route element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            {/* Catch-all for URLs that match nothing above. Kept inside RequireAuth so
                signed-out visitors are redirected instead of seeing a public 404. */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
