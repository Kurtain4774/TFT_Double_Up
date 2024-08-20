import React from "react";
import "./footer.css";
import { NavLink } from "react-router-dom";

const Footer = () => {

  return (
    <footer id="footer">
      <p id="footer-text">
        TFT Solutions isn't endorsed by Riot Games
        and doesn't reflect the views or opinions of Riot Games or anyone
        officially involved in producing or managing Riot Games properties. Riot
        Games, and all associated properties are trademarks or registered
        trademarks of Riot Games, Inc.
      </p>

      <nav id="footer-nav">
        <ul>
          <li className="footer-link">
            <NavLink to="/policies/privacy">Privacy Policy</NavLink>
          </li>
          <li className="footer-link">
            <NavLink to="/policies/terms-of-use">Terms of Use</NavLink>
          </li>
        </ul>
      </nav>
    </footer>
  );
};

export default Footer;
