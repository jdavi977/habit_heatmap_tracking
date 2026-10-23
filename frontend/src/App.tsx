import { Routes, Route } from 'react-router'
import RootLayout from './layouts/RootLayout'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'



function App() {
  return (
    <>
      <Routes>
        {/* Pages that share header/footer */}
        {/* Make layout in /layouts */}
        <Route>
          <Route element={<RootLayout />}>
            {/* <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard/>} /> */}
          </Route>

        </Route>
        {/* Pages that don't share header/footer */}
        <Route path="/signup" element={<Signup />} />

      </Routes>
    </>
  )
}

export default App
