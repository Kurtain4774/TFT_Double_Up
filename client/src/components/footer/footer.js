import React from "react";
import "./footer.css";
import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <footer>
      <nav>
        <div>
          <ul>
            <li>
              <NavLink to="/policies/privacy">Privacy Policy</NavLink>
            </li>
            <li>
              <NavLink to="/policies/terms-of-use">Terms of Use</NavLink>
            </li>
          </ul>
        </div>
      </nav>

      <p id="copyright">
        © 2023-2024 TFT Solutions. TFT Solutions isn't endorsed by Riot Games
        and doesn't reflect the views or opinions of Riot Games or anyone
        officially involved in producing or managing Riot Games properties. Riot
        Games, and all associated properties are trademarks or registered
        trademarks of Riot Games, Inc.
      </p>
    </footer>
  );
};

export default Footer;
