import React from 'react';
import './homepage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const regions = ["BR", "EUNE", "EUW", "JP", "KR", "LAN", "LAS", "NA", "OCE", "PH", "RU", "SG", "TH", "TR", "TW", "VN"];

const homePage = () => {
    return (
        <div className="container">
            <div className="search-container">
                <select className="region-select">
                    {regions.map(region => (
                        <option key={region} value={region}>{region}</option>
                    ))}
                </select>
                <input type="text" className="text-input" placeholder="Search..." />
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
            </div>
        </div>
    )
}

export default homePage