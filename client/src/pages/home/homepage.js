import React from "react";
import "./homepage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const regions = [
  "BR","EUNE","EUW","JP","KR","LAN","LAS","NA","OCE","PH","RU","SG","TH","TR","TW","VN",
];

const tables = ["Augments", "Reroll", "Double Up", "Golden Egg"];


const HomePage = () => {
  const navigate = useNavigate();

  const [region, setRegion] = useState(regions[0])
  const [username, setUsername] = useState("");

  const handleClick = () => {
    navigate("/player/" + region.toLowerCase() + "/" + username.toLowerCase())
  }

  const handleKeyPress = (event) => {
    if(event.keyCode === 13){
      setUsername(event.target.value);
      navigate("/player/" + region.toLowerCase() + "/" + username.toLowerCase())
    }
  }

  const regionChange = event => {
    setRegion(event.target.value)
  }

  const usernameChange = event => {
    setUsername(event.target.value);
  }

  return (
    <div>
      <div className="container">
        <div className="search-container">
          <select onChange = {regionChange} value={region} className="region-select">
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          <form>
            <input type="text" className="text-input" placeholder="Search..." onKeyDown = {handleKeyPress} onChange={usernameChange} value={username}  />
            <FontAwesomeIcon onClick = {handleClick} icon={faSearch} className="search-icon" />
          </form>
          
        </div>
      </div>
      <div>
        Tables
        <select>
          {tables.map((table) => (
            <option key={table} value={table}>
              {table}
            </option>
          ))}
        </select>
        {/* Add the Tables Here*/}
      </div>
    </div>
  );
};

export default HomePage;
