import React, {useState, useEffect } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Bar } from 'react-chartjs-2';
import './duPlayer.css';

function getRiotRegion(region) {
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

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const DoubleUpPage = () => {

  
  const navigate = useNavigate();

  const { region, username, tag, username2, tag2 } = useParams();

  const [matches, setMatches] = useState([]);

  const [playerPuuids, setPlayerPuuids] = useState([]);

  const [duoStats, setDuoStats] = useState();

  const playerRow = (puuid) => {
    return (
      <div>

      </div>
    );
  }

  //the [] executes the code whenever that variable changes so since there is no var inside
  // [] it only executes this code once
  //not adding the [] executes this code on every re-render
  useEffect(() => {
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
        console.log(data);
        setMatches(data[1]);
        setPlayerPuuids(data[0]);

        let gamesPlayed = 0;
        let avgPlacement = 0;
        let winRate = 0;
        let topFourRate = 0;
        let lpGained = 0;
        let player1Damage = 0;
        let player2Damage = 0;
        let avgRoundDead = 0;
        let player1AvgBoardCost = 0;
        let player2AvgBoardCost = 0;
        let totalAvgTeamDamage = 0;
        let player1AverageLevel = 0;
        let player2AverageLevel = 0;
        let placementArray = [];
        let damageArray = [[],[]];
        let teamCostArray = [[],[]];

        

        gamesPlayed = data[1].length;

        console.log("Games played: " + gamesPlayed);

        for(let i = 0; i < data[1].length; i++){
          let match = data[1][i];
          let player1 = match.info.participants.find(participant => participant.puuid === data[0][0]);
          let player2 = match.info.participants.find(participant => participant.puuid === data[0][1])
          const placement = Math.ceil(player1.placement/2);
          placementArray.push(placement);
          avgPlacement += placement;
          if(placement === 1){
            winRate++;
          }
          if(placement <= 2){
            topFourRate++;
          }

          damageArray[0].push(player1.total_damage_to_players);
          damageArray[1].push(player2.total_damage_to_players);


          player1Damage += player1.total_damage_to_players;

          player2Damage += player2.total_damage_to_players;

          avgRoundDead += player1.last_round;

          let boardCost = 0;

          for(let j = 0; j < player1.units.length; j++){
            let unitCost = player1.units[j].rarity;

            if(unitCost == 4){
              unitCost = 3;
            } else if(unitCost == 6){
              unitCost = 4;
            }
            unitCost++;
            unitCost = unitCost * (3 ** (player1.units[j].tier-1));
            boardCost += unitCost;
          }

          teamCostArray[0].push(boardCost);

          player1AvgBoardCost += boardCost;

          boardCost = 0;

          for(let j = 0; j < player2.units.length; j++){
            let unitCost = player2.units[j].rarity;

            if(unitCost == 4){
              unitCost = 3;
            } else if(unitCost == 6){
              unitCost = 4;
            }
            unitCost++;
            unitCost = unitCost * (3 ** (player2.units[j].tier-1));
            boardCost += unitCost;
          }

          player2AvgBoardCost += boardCost;
          teamCostArray[1].push(boardCost);

          player1AverageLevel += player1.level;
          player2AverageLevel += player2.level;


        }
        avgPlacement = (avgPlacement/gamesPlayed*100/100).toFixed(2);
        winRate = (winRate / gamesPlayed * 100).toFixed(0) + "%";
        topFourRate = (topFourRate / gamesPlayed * 100).toFixed(0) + "%";

        player1AverageLevel = (player1AverageLevel/gamesPlayed).toFixed(2);
        player2AverageLevel = (player2AverageLevel/gamesPlayed).toFixed(2);

        player1AvgBoardCost = (player1AvgBoardCost/gamesPlayed).toFixed(1);
        player2AvgBoardCost = (player2AvgBoardCost/gamesPlayed).toFixed(1);

        player1Damage = (player1Damage/gamesPlayed).toFixed(0);
        player2Damage = (player2Damage/gamesPlayed).toFixed(0);

        totalAvgTeamDamage = +player1Damage + +player2Damage;

        avgRoundDead = (avgRoundDead/gamesPlayed).toFixed(0);

        
        const stats = new Map([
          ["Games", gamesPlayed],
          ["Place", avgPlacement],
          ["Win", winRate],
          ["Top 4", topFourRate],
          ["Avg. Eliminated", avgRoundDead],
          [capitalizeFirstLetter(username + " Avg. Damage"), player1Damage],
          [capitalizeFirstLetter(username2 + " Avg. Damage"), player2Damage],
          ["Avg. Team Damage", totalAvgTeamDamage],
          [capitalizeFirstLetter(username + " Avg. lvl"), player1AverageLevel],
          [capitalizeFirstLetter(username2 + " Avg. lvl"), player2AverageLevel],
          [capitalizeFirstLetter(username + " Avg. Team Cost"), player1AvgBoardCost],
          [capitalizeFirstLetter(username2 + " Avg. Team Cost"), player2AvgBoardCost],
        ]);
        
        console.log(stats);

        setDuoStats(stats);

        console.log(duoStats);

      })
      .catch((error) => {
        console.error('Fetch error:', error);
        //navigate("/");
      });
      
  }, []);
  

  return (
    <div className="player-container">
      <h1>Match List</h1>
      {!duoStats ? (
        <p>Loading matches...</p>
      ) : (
        <div className="page-row">
          <div className="page-column page-left">
            <h2>Stats</h2>
            <div className="statistic-container">
              {[...duoStats.entries()].map(([key, value]) => (
                <div className="statistic-row">
                  <div className="statistic-label"> {key} </div>
                  <div className="statistic-value"> {value} </div>
                </div>
              ))}
            </div>
          </div>
          <div className="page-column page-right">
          <h1>Duo Stats</h1>
              <table>
              <tbody>
                
              {matches.map((match) => (
                <tr>
                  
                  <div>
                    <div>
                      {Math.ceil(match.info.participants.find(participant => participant.puuid === playerPuuids[0]).placement/2)}
                    </div>
                    <div>
                      <div>
                        {playerRow(playerPuuids[0])}
                      </div>
                      <div>
                        {playerRow(playerPuuids[1])}
                      </div>
                    </div>
                  </div>
                </tr>
                
              ))}

            </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
};

export default DoubleUpPage;
