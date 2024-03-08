import React, {useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const PlayerPage = () => {
  const { region, username } = useParams();

  const [userInfo, setUserInfo] = useState("");

  //the [] executes the code whenever that variable changes so since there is no var inside
  // [] it only executes this code once
  //not adding the [] executes this code on every re-render
  useEffect(() => {
    fetch("http://localhost:3001/player?username=" + username + "&region=" + region)
      .then((res) => res.json())
      .then((data) => {
        setUserInfo(data.info);
        console.log(userInfo);
      });
  }, []);

  return (
    <div>
      <h1>Player Page</h1>
      <p>
        {region} {username}
      </p>

    </div>
  );
};

export default PlayerPage;
