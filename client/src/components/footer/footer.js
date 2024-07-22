import React from "react";
import "./footer.css";
import { NavLink, useLocation } from "react-router-dom";

const Footer = () => {

  function removeAfterSecondSlash(str) {
    // Match everything before the second "/"
    const result = str.match(/(.*?\/.*?\/).*$/);
    
    // If there's a match, return the part before the second "/"
    // Otherwise, return the original string
    if (result) {
      // Extract the part before the second "/"
      const partBeforeSecondSlash = result[1];
      // Split the string by "/" to get individual parts
      const parts = partBeforeSecondSlash.split('/');
      // Return the first two parts joined back with "/"
      return parts.slice(0, 2).join('/');
    } else {
      return str;
    }
  }


  const location = useLocation();

  var path = removeAfterSecondSlash(location.pathname);

  const isLeaderboardRoute = path === '/leader_board' || path === '/player';
  return !isLeaderboardRoute && (
    <footer className="footer">
      <nav className="footer-nav">
        <div>
          <ul>
            <li className="footer-link">
              <NavLink to="/policies/privacy">Privacy Policy</NavLink>
            </li>
            <li className="footer-link">
              <NavLink to="/policies/terms-of-use">Terms of Use</NavLink>
            </li>
          </ul>
        </div>
      </nav>

      <p id="footer">
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
