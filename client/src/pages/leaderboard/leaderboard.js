import { React, useState, useEffect} from "react";
import "./leaderboard.css";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import Footer from "../../components/footer/footer.js";
import LeaguePointsComponent from './PointsToRank';

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
  const navigate = useNavigate();

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,      
    maximumFractionDigits: 2,
 });

  const { region = "NA" } = useParams();

  const [leaderboardInfo, setLeaderboardInfo] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/leaderboard?region=" + region + "1")
      .then((res) => {
        console.log(res.ok);
        
        if(!res.ok){
          console.log("no region data found")

          navigate("/");
        }
        return res.json();
        
      })
      .then((data) => {
        console.log(data);
        setLeaderboardInfo(data);
      });
  }, []);

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


        <table>
          <tbody>
            
        <tr>
          <th>Rank</th>
          <th>Name</th>
          <th>LP</th>
          <th>Games</th>
          <th>Top 4</th>
        </tr>
      {leaderboardInfo.map((item) => (
        <tr>
          <td></td>
          <td>{item.summonerName}</td>
          <LeaguePointsComponent leaguePoints={item.leaguePoints}></LeaguePointsComponent>
          <td>{item.wins + item.losses}</td>
          <td>{formatter.format(100 * item.wins / (item.wins + item.losses))}%</td>
        </tr>
      ))}
      
      </tbody>
    </table>
      
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
      </div>
    </div>
  );
};

export default LeaderBoardPage;
