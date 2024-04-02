import React from "react";
import "./leaderboard.css";
import { NavLink } from "react-router-dom";
import { useParams } from "react-router-dom";

const regions = [
  "BR",
  "EUNE",
  "EUW",
  "JP",
  "KR",
  "LAN",
  "LAS",
  "NA",
  "OCE",
  "PH",
  "RU",
  "SG",
  "TH",
  "TR",
  "TW",
  "VN",
];

const LeaderBoardPage = () => {
  const { region = "NA" } = useParams();

  console.log(region);
  return (
    <div className="page">
      <h1>LeaderBoard</h1>
      <div className="leader-board-table">
        <nav className="navbar-leaderboard">
          <div className="menu-container">
            <ul className="navbar-leaderboard">
              {regions.map((r) => (
                <li key={r}>
                  <NavLink
                    to={`/leader_board/${r}`}
                    className={region === r ? "active" : "inactive"}
                  >
                    {r}
                  </NavLink>
                </li>
              ))}
            </ul>
            <hr></hr>
          </div>
        </nav>

        <p>Leaderboard table *TODO*</p>
      </div>
    </div>
  );
};

export default LeaderBoardPage;
