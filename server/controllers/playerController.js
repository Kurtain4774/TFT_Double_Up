const Bottleneck = require("bottleneck");
const { connectToMongoDB, insertPlayer, findPlayers, updateTime, updateMatches, findMatches, deletePlayers } = require('../database/player-db');
const playerModel = require('../database/schemas/player-schema');
const matchModel = require('../database/schemas/match-schema');

//Bottleneck limiter limits number of requests to 1 per 1200ms or 100 per 2 minutes
const limiterPerSecond = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1200
});

//returns database information on player that matches a certain username and tag
async function getPlayerInfo(username, tag){
  let player = await findPlayers(username,tag);

  let puuid;

  if(!player){
    puuid = await limiterPerSecond.schedule(() => fetchPuuid(username, tag));
    if(!puuid){
      console.log("Riot api did not find user: " + username + " " + tag);
      return null;
    }
    console.log("Found in riot api");
    player = {
      username: username,
      tag: tag,
      puuid: puuid,
      lastUpdated: process.env.SET_START_TIME
    }
    insertPlayer(player);

    return player;
  } else {
    console.log("Found in database");

    return player;
  }
}
const getMatches = async (req, res) => {
    const username1 = req.query.username;
    const tag1 = req.query.tag;
    const username2 = req.query.username2;
    const tag2 = req.query.tag2;
    const region = req.query.region;

    //check to see if we already have this player in the database
    await connectToMongoDB();

    //await deletePlayers();

    console.log("Parameters: " + username1 + "#" + tag1 + " " + username2 + "#" + tag2);

    const player1 = await getPlayerInfo(username1, tag1);

    if(player1 == null){
      res.status(404).send({username: username1, tag: tag1});
      return;
    }

    const player2 = await getPlayerInfo(username2, tag2);

    if(player2 == null){
      res.status(404).send({username: username2, tag: tag2});
      return;
    }

    const puuidArray = [player1.puuid, player2.puuid];

    console.log("PUUID 1: " + puuidArray[0]);
    console.log("PUUID 2: " + puuidArray[1]);

    const lastUpdatedArray = [player1.lastUpdated, player2.lastUpdated];
    
    let newMatches = await fetchMatchIDs(lastUpdatedArray, puuidArray);

    let totalMatches = newMatches[0].size + newMatches[1].size;

    //console.log("reservoir: " + await limiterPerSecond.currentReservoir() + " " + totalMatches);
    if(totalMatches < 90 && await limiterPerSecond.currentReservoir() >= 90){
      console.log("changed to 50ms");
      limiterPerSecond.updateSettings({minTime: 50});
    } else {
      console.log("changed to 1200ms");
      limiterPerSecond.updateSettings({minTime: 1200});
    }

    player1newDoubleUpGames = await filterDoubleUpGames(Array.from(newMatches[0]), puuidArray[0]);
    player2newDoubleUpGames = await filterDoubleUpGames(Array.from(newMatches[1]), puuidArray[1]);
    
    updateTime(username1,tag1);
    updateTime(username2,tag2);

    

    await updateMatches(username1,tag1,player1newDoubleUpGames);
    await updateMatches(username2,tag2,player2newDoubleUpGames);

    //const commonIds = await findCommonMatchIds(puuidArray[0],puuidArray[1]);
    //console.log("Common Match IDs: " + commonIds[0]);

    const commonIds = await findCommonMatchIds(puuidArray[0],puuidArray[1]);

    console.log("database match results: " + commonIds.matchIds)
    

    //array of stats containing [placement,player1damage,player2damage,matchID]
    const doubleUpMatchStats = await fetchDoubleUpMatchIDs(commonIds.matchIds, puuidArray);

    console.log("Total Double Up Games: " + doubleUpMatchStats.length - 1);

    res.send([...doubleUpMatchStats]);
    
    //res.status(200).send();
    return;
  };

  

  async function fetchPuuid(username, tag) {
    const response = await fetch(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${username}/${tag}?api_key=${process.env.RIOT_API_KEY}`);
    const json = await response.json();
    if (!response.ok) {
      return null;
    }
    return json.puuid;
  }

  

  async function fetchMatchIDs(lastUpdatedArray, puuidArray) {
    const matchIDs = [new Set(), new Set()];
    let start = 0;
    console.log("TIME START: " + lastUpdatedArray[0]);
    console.log("TIME START: " + lastUpdatedArray[1]);
    do {
      await Promise.all(puuidArray.map(async (id, index) => {
        const response = await limiterPerSecond.schedule(() => fetch(`https://americas.api.riotgames.com/tft/match/v1/matches/by-puuid/${id}/ids?start=${start}&startTime=${lastUpdatedArray[index]}&count=200&api_key=${process.env.RIOT_API_KEY}`));
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

  function findCommonMatchIds(puuid1, puuid2) {
    const matches = findMatches(puuid1, puuid2);
    return matches;
  }

  function findCommonMatchIDs(matchIDs) {
    const set1 = new Set(matchIDs[0]);
    const set2 = new Set(matchIDs[1]);
    return [...set1].filter(id => set2.has(id));
  }

  async function fetchWithRetry(url, retries = 5, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        const response = await limiterPerSecond.schedule(() => fetch(url));
        if (response.status === 429) {
            console.log("Rate limited, retrying...");
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
        } else {
            return response;
        }
    }
    throw new Error('Max retries reached');
}


  async function filterDoubleUpGames(matchIds, puuid) {
    const doubleUpMatchIDs = [];
  
    await Promise.all(matchIds.map(async (matchId) => {
      const url = `https://americas.api.riotgames.com/tft/match/v1/matches/${matchId}?api_key=${process.env.RIOT_API_KEY}`;

      const response = await fetchWithRetry(url);
      console.log("looking up: " + matchId);
      
      const json = await response.json();

        const info = json.info;
        
        if (info) {
          if(info.queue_id === 1160){
            const participants = info.participants;
            let playerData;
    
            for(let player of participants){
              if(player.puuid === puuid){
                playerData = player;
              }
            }
    
            let team = playerData.partner_group_id;
            let teammatePuuid;
    
            for(let player of participants){
              if(player.partner_group_id === team && player.puuid != puuid){
                teammatePuuid = player.puuid;
              }
            }
            doubleUpMatchIDs.push({teammate: teammatePuuid, matchId: matchId});
          }
        } else {
          console.log("Error couldnt read json: " + matchId);
        }
      
    }));

    return doubleUpMatchIDs;
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