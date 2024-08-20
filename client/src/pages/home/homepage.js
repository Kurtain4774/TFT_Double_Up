import React from "react";
import "./homepage.css";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const regions = [
  "BR","EUNE","EUW","JP","KR","LAN","LAS","NA","OCE","PH","RU","SG","TH","TR","TW","VN",
];

//const tables = ["Augments", "Reroll", "Double Up", "Golden Egg"];


const HomePage = () => {
  const navigate = useNavigate();

  const [region, setRegion] = useState(regions[7])
  const [username, setUsername] = useState("");
  const [username2, setUsername2] = useState("");
  const [errors, setErrors] = useState({});


  const handleClick = (e) => {
    e.preventDefault();
    nav();
  }

  function nav(){
    


    let path = "/player/" + region.toUpperCase() + "/";

    let name1 = username.split('#');

    if(name1.length === 1){
      path = path + username + "/NA1/";
    } else {
      path = path + name1[0] + "/" + name1[1] + "/";
    }

    let name2 = username2.split('#');

    if(name2.length === 1){
      path = path + username2 + "/NA1/";
    } else {
      path = path + name2[0] + "/" + name2[1] + "/";
    }

    const error = {};

    if(name1[0].length === 0){
      error.player1 = "Field cannot be left blank"
    }

    if(name2[0].length === 0){
      error.player2 = "Field cannot be left blank"
    } else if(name1[0].toLowerCase() === name2[0].toLowerCase() && name1[1].toLowerCase() === name2[1].toLowerCase()){
      error.player2 = "Players must be different"
    }

    setErrors(error);

    if(errors){
      navigate(path);
    }

  
  }

  const handleKeyPress = (event) => {
    if(event.keyCode === 13){
      setUsername(event.target.value);
      nav();
    }
  }

  const handleKeyPress2 = (event) => {
    if(event.keyCode === 13){
      setUsername2(event.target.value);
      nav();
    }
  }

  const regionChange = event => {
    setRegion(event.target.value)
  }

  const usernameChange = event => {
    setUsername(event.target.value);
  }

  const usernameChange2 = event => {
    setUsername2(event.target.value);
  }

  return (
    <div className="page">
      <div className="container">
        <div className="search-container">
          <form>
            <select onChange = {regionChange} value={region} className="region-select">
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            <div className="text-input-container">
              {errors.player1 && <p className="error">{errors.player1}</p>}
              <input type="text" className={errors.player1 ? "text-input error-input" : "text-input"} placeholder="Player 1 RiotID #Tagline" onKeyDown = {handleKeyPress} onChange={usernameChange} value={username}  />
            </div>
            <div className="text-input-container">
              {errors.player2 && <p className="error">{errors.player2}</p>}
              <input type="text" className={errors.player2 ? "text-input error-input" : "text-input"} placeholder="Player 2 RiotID #Tagline" onKeyDown = {handleKeyPress2} onChange={usernameChange2} value={username2}  />
            </div>
            <input type="submit" className="text-submit" onClick = {handleClick}/>
          </form>
          
        </div>
      </div>
          
      {/*
      <div className="table-div">
        Tables
        <select id="table-select-id" className="table-select">
          {tables.map((table) => (
            <option key={table} value={table}>
              {table}
            </option>
          ))}
        </select>
        { Add the Tables Here}
      </div>
      */}
      
    </div>
  );
};

export default HomePage;
