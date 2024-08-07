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

const DoubleUpPage = () => {

  
  const navigate = useNavigate();

  const { region, username, tag, username2, tag2 } = useParams();

  const [matches, setMatches] = useState([]);


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
        
        setMatches(data);
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        //navigate("/");
      });
      
  }, []);
  

  return (
    <div>
      <h1>Match List</h1>
      {matches.length === 0 ? (
        <p>Loading matches...</p>
      ) : (
        <ul>
          {matches.map((match) => (
            <li key={match.metadata.match_id}>
              <h2>Match ID: {match.metadata.match_id}</h2>
              <p>Game Version: {match.info.game_version}</p>
              <p>Game Length: {match.info.game_length}</p>
              <p>Participants:</p>
              <ul>
                {match.info.participants.map((participant, index) => (
                  <li key={index}>
                    <p>PUUID: {participant.puuid}</p>
                    <p>Placement: {participant.placement}</p>
                    {/* Add more participant details as needed */}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DoubleUpPage;
