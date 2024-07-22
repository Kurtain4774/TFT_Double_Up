const Bottleneck = require("bottleneck");
const { connectToMongoDB, insertPlayer, findPlayer } = require('../database/player-db');

const limiterPerSecond = new Bottleneck({
  maxConcurrent: 1,
  minTime: 50,
  reservoir: 20,
  reservoirRefreshInterval: 1000,
  reservoirRefreshAmount: 20
});

// Bottleneck for 100 requests per 2 minutes
const limiterPerTwoMinutes = new Bottleneck({
  maxConcurrent: 1,
  minTime: 50,
  reservoir: 100,
  reservoirRefreshInterval: 120000,
  reservoirRefreshAmount: 100
});

limiterPerSecond.chain(limiterPerTwoMinutes)


const getMatches = async (req, res) => {
    const username1 = req.query.username;
    const tag1 = req.query.tag;
    const username2 = req.query.username2;
    const tag2 = req.query.tag2;
    const region = req.query.region;

    //check to see if we already have this player in the database
    await connectToMongoDB();

    console.log("Parameters: " + username1 + "#" + tag1 + " " + username2 + "#" + tag2);

    const puuidArray = await Promise.all([
      limiterPerSecond.schedule(() => fetchPuuid(username1, tag1)),
      limiterPerSecond.schedule(() => fetchPuuid(username2, tag2))
    ]);
    
    console.log("PUUID 1: " + puuidArray[0]);
    console.log("PUUID 2: " + puuidArray[1]);
    
    const matchIDs = await fetchMatchIDs(puuidArray);
    
    console.log("DONE");
    console.log("Match IDs Size: " + matchIDs[0].size + " " + matchIDs[1].size);
    
    const commonIds = findCommonMatchIDs(matchIDs);
  
    console.log("Common Match IDs: " + commonIds.length);

    //array of stats containing [placement,player1damage,player2damage,matchID]
    const doubleUpMatchStats = await fetchDoubleUpMatchIDs(commonIds, puuidArray);

    console.log("Total Double Up Games: " + doubleUpMatchStats.length - 1);

    res.send([...matchIDs, ...doubleUpMatchStats]);

    return;
  };

  

  async function fetchPuuid(username, tag) {
    const response = await fetch(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${username}/${tag}?api_key=${process.env.RIOT_API_KEY}`);
    const json = await response.json();
    if (!response.ok) {
      throw new Error(`Error fetching PUUID for ${username}#${tag}: ${json.status ? json.status.message : 'Unknown error'}`);
    }
    return json.puuid;
  }

  

  async function fetchMatchIDs(puuidArray) {
    const matchIDs = [new Set(), new Set()];
    const startTime = 1710892800;
    let start = 0;
    
    do {
      await Promise.all(puuidArray.map(async (id, index) => {
        const response = await limiterPerSecond.schedule(() => fetch(`https://americas.api.riotgames.com/tft/match/v1/matches/by-puuid/${id}/ids?start=${start}&startTime=${startTime}&count=200&api_key=${process.env.RIOT_API_KEY}`));
        const json = await response.json();
        if(json){
          const set = new Set(json);
          set.forEach(match => matchIDs[index].add(match));
        } else {
          console.log("failed");
        }
          
      }));
  
      start += 200;
      console.log("Match IDs Sizes: " + matchIDs[0].size + " " + matchIDs[1].size + " " + start);
    } while (matchIDs[0].size == start || matchIDs[1].size == start);
  
    return matchIDs;
  }

  function findCommonMatchIDs(matchIDs) {
    const set1 = new Set(matchIDs[0]);
    const set2 = new Set(matchIDs[1]);
    return [...set1].filter(id => set2.has(id));
  }

  async function fetchDoubleUpMatchIDs(commonIds, puuidArray) {
    const doubleUpMatchIDs = [];
    const placementCounts = [0,0,0,0];
  
    await Promise.all(commonIds.map(async (matchID) => {
      const response = await limiterPerSecond.schedule(() => fetch(`https://americas.api.riotgames.com/tft/match/v1/matches/${matchID}?api_key=${process.env.RIOT_API_KEY}`));
      const json = await response.json();

      const info = json.info;
      
      if (info && info.queue_id === 1160) {
        const participants = info.participants;
        let player1Data;
        let player2Data;

        for(let player of participants){
          if(player.puuid === puuidArray[0]){
            player1Data = player;
          } else if(player.puuid === puuidArray[1]){
            player2Data = player;
          }
        }
        if (player1Data && player2Data && player1Data.partner_group_id === player2Data.partner_group_id) {
          let stats = [];
          const placement = Math.ceil(player1Data.placement/2);
          placementCounts[placement-1]++;
          stats.push(placement);
          stats.push(player1Data.total_damage_to_players);
          stats.push(player2Data.total_damage_to_players);
          stats.push(matchID);
          doubleUpMatchIDs.push(stats);
        }
      } else {
        console.log("skipped: " + matchID);
      }
    }));

    doubleUpMatchIDs.push(placementCounts);
    return doubleUpMatchIDs;
  }
  
  

  module.exports = {
    getMatches
  };