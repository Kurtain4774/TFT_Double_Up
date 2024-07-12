import React, {useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
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

  const [sameGameIds, setSameGameIds] = useState([]);

  const findCommonIds = (data) => {
    // Assuming data is a 2D array with at least 2 columns
    
    const set1 = new Set(data[0]);
    const set2 = new Set(data[1]);
    
    console.log("set1: " + data[0].length);
    // Find intersection of IDs appearing in both sets
    const commonIds = [...set1].filter(id => set2.has(id));
  
    return commonIds;
  };

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
        
        if(!res.ok){
          //console.log("no summoner found")

          navigate("/");
        }
        return res.json();
        
      })
      .then((data) => {
        setUserInfo1(data[0]);
        setUserInfo2(data[1]);

        setSameGameIds(findCommonIds(data));
      });
      
  }, []);
  
  const maxLength = Math.max(userInfo1.length, userInfo2.length);


  return (
    <div>
      <h1>Double Up Page</h1>
      <p>
        {region}
      </p>
      <ul>
        {sameGameIds.map((item, index) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>Match ID Table</h2>
      <table>
      <thead>
        <tr>
          <th>Column 1</th>
          <th>Column 2</th>
        </tr>
      </thead>
      <tbody>
        {/* Loop through the arrays using the longest length */}
        {[...Array(maxLength)].map((_, index) => (
          <tr key={index}>
            <td>{userInfo1[index] || ''}</td>
            <td>{userInfo2[index] || ''}</td>
          </tr>
        ))}
      </tbody>
      </table>
    </div>
  );
};

export default DoubleUpPage;
