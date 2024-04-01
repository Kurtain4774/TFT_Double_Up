import React from 'react';
import './leaderboard.css';

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

const leaderBoardPage = () => {
    return (
        <div className="page">
            <h1>LeaderBoard Page</h1>
            <ul>
                {regions.map((region) => (
                <li key={region}>
                    {region}
                </li>
                ))}
            </ul>

            <p>Leaderboard table *TODO*</p>
            

        </div>
    )
}

export default leaderBoardPage