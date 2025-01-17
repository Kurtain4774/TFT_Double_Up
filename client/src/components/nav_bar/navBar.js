import React from "react";
import "./navBar.css";
import { NavLink } from "react-router-dom";

const TopNavigation = () => {
  return (
    <nav className="navbar">
      
      <ul className="navBar">
        <li>
          <NavLink to="/">Home</NavLink>
        </li>
        <li>
          <NavLink to="/comps">Comps</NavLink>
        </li>
        <li>
          <NavLink to="/stats">Stats</NavLink>
        </li>
        <li>
          <NavLink to="/leader_board">Leaderboard</NavLink>
        </li>
        <li>
          <NavLink to="/about">About</NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default TopNavigation;
