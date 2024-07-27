import React, {useState, useEffect } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Bar } from 'react-chartjs-2';
import './duPlayer.css';

function getRiotRegion(region) {
  //console.log(region);
  switch (region) {
    case "BR":
      return "BR1";
    case "NA":
      return "NA1";
    case "LAN":
      return "LA1";
    case "LAS":
      return "LA2";
    case "EUNE":
      return "EUN1";
    case "EUW":
      return "EUW1";
    case "KR":
      return "KR";
    case "JP":
      return "JP1";
    case "TR":
      return "TR1";
    case "RU":
      return "RU";
    case "OCE":
      return "OC1";
    case "SG":
      return "SG2";
    case "TH":
      return "TH2";
    case "TW":
      return "TW2";
    case "VN":
      return "VN2";
    case "PH":
      return "PH2";
    default:
      return "";
  }
}

const DoubleUpPage = () => {

  
  const navigate = useNavigate();

  const { region, username, tag, username2, tag2 } = useParams();

  const [userInfo1, setUserInfo1] = useState([]);
  const [userInfo2, setUserInfo2] = useState([]);

  const [duoStats, setDuoStats] = useState([]);

  const [sameGameIds, setSameGameIds] = useState([]);

  const [placementCounter, setPlacementCounter] = useState([]);

  //the [] executes the code whenever that variable changes so since there is no var inside
  // [] it only executes this code once
  //not adding the [] executes this code on every re-render
  useEffect(() => {
    console.log("username: " + username);
    console.log("tag: " + tag);
    console.log("username: " + username2);
    console.log("tag: " + tag2);

    let t = tag;
    let t2 = tag2;
    if(t === undefined){
      t = "NA1";
    }

    if(t2 === undefined){
      t2 = "NA1";
    }
    
    fetch("http://localhost:3001/player?username=" + username + "&tag=" + t + "&username2=" + username2 + "&tag2=" + t2 + "&region=" + getRiotRegion(region))
      .then((res) => {
        //console.log(res.ok);
        
        if(res.status === 404){
          return res.json().then((data) => {
            // Access username and tag from the data object
            const { username, tag } = data;
            console.log("Summoner: " + username + " " + tag + " was not found. Make sure you have the correct username and tag.");
    
            // Navigate to another page
            navigate("/");

            return;
          });
          
        } else if(!res.ok){
          console.log("Error: ");

          navigate("/");
        } else {
          return res.json();
        }
      })
      .then((data) => {
        //setUserInfo1(data[0]);
        //setUserInfo2(data[1]);

        const totalGames = data.length-1;
    
        let totalPlacement = 0;
        let player1Damage = 0;
        let player2Damage = 0;
        let matchIDs = [];

        for(let i = 0; i < data.length - 1; i++){
          let stats = data[i];
          totalPlacement += stats[0];
          player1Damage += stats[1];
          player2Damage += stats[2];
          matchIDs.push(stats[3]);
        }

        totalPlacement /= totalGames;
        player1Damage /= totalGames;
        player2Damage /= totalGames;

        

        let duoStats = [];
        duoStats.push({label: "Total Games", value: totalGames});
        duoStats.push({label: "Avg Place", value: totalPlacement});
        duoStats.push({label: username + " Avg. Damage", value: player1Damage});
        duoStats.push({label: username2 + " Avg. Games", value: player2Damage});

        setDuoStats(duoStats);
        setPlacementCounter(data[data.length - 1]);


        setSameGameIds(matchIDs);
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        navigate("/");
      });
      
  }, []);
  

  return (
    <div>
      <h1>Double Up Page</h1>
      <div className="container">
        <div className="stats-box">
          {duoStats.map((stat, index) => (
            <div key={index} className="stat">
              <div className="label">{stat.label}</div>
              <div className="value">{stat.value}</div>
            </div>
          ))}
        </div>
        
        <div className="table-box">
          <table>
            <thead>
              <tr>
                <th>Index</th>
                <th>Match ID</th>
              </tr>
            </thead>
            <tbody>
              {sameGameIds.map((item) => (
                <tr key={item}>
                  <td></td>
                  <td>{item}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      
    </div>
  );
};

export default DoubleUpPage;
