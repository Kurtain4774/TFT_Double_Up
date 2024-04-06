import React from "react";
import { routes } from "./routes";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NavBar from "./components/nav_bar/navBar";
import Footer from "./components/footer/footer.js";
import './App.css';
const App = () => (
  <BrowserRouter>
    <div className="flex-container">
      <div className="row-header">
        <NavBar />
      </div>
      
      <div className="row-content">
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<route.component />}
              exact={route.exact}
            />
          ))}
        </Routes>
      </div>
      
      <div className="row-footer">
        <Footer />
      </div>
      
    </div>
  </BrowserRouter>
);

export default App;
