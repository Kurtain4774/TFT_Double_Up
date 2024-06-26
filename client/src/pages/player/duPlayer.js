import React, {useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';


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

  const { region, username, username2 } = useParams();

  const [userInfo, setUserInfo] = useState([]);

  //the [] executes the code whenever that variable changes so since there is no var inside
  // [] it only executes this code once
  //not adding the [] executes this code on every re-render
  useEffect(() => {
    fetch("http://localhost:3001/player?username=" + username + "&username2=" + username2 + "&region=" + getRiotRegion(region))
      .then((res) => {
        //console.log(res.ok);
        
        if(!res.ok){
          //console.log("no summoner found")

          navigate("/");
        }
        return res.json();
        
      })
      .then((data) => {
        console.log(data);
        setUserInfo(data);
        
      });
  }, []);

  return (
    <div>
      <h1>Double Up Page</h1>
      <p>
        {region} {username} {username2}
      </p>

      <ul>
        {userInfo.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </div>
  );
};

export default DoubleUpPage;
