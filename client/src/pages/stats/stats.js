import React from "react";
import { NavLink } from "react-router-dom";
import "./stats.css";

const statsPage = () => {
  return (
    <div>
      <h1>Stats Page</h1>
      <ul>
        <li>
          <NavLink to="/">Augments</NavLink>
        </li>
        <li>
          <NavLink to="/">Units</NavLink>
        </li>
        <li>
          <NavLink to="/">Items</NavLink>
        </li>
        <li>
          <NavLink to="/">Traits</NavLink>
        </li>
      </ul>
    </div>
  );
};

export default statsPage;
