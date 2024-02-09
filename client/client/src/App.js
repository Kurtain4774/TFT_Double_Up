import React from 'react'
import { routes } from './routes';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NavBar from './components/nav_bar/navBar'
const App = () => (

<BrowserRouter>
  <NavBar/>
  <Routes>
    {routes.map(route => (
      <Route
        key={route.path}
        path={route.path}
        element={<route.component/>}
        exact={route.exact}
      />
    ))}
  </Routes>
</BrowserRouter>
)

export default App;