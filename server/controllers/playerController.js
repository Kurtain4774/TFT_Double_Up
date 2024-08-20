const Bottleneck = require("bottleneck");
const database = require('../database/player-db');
const playerModel = require('../database/schemas/player-schema');
const matchModel = require('../database/schemas/match-schema');

//Bottleneck limiter limits number of requests to 1 per 1200ms or 100 per 2 minutes
const limiterPerSecond = new Bottleneck({
  //reservoir helps with bursts of requests

  minTime: 60,
  maxConcurrent: 1,

  reservoir: 100, // initial value
  reservoirRefreshAmount: 100,
  reservoirRefreshInterval: 140000, // must be divisible by 250
});


//Function takes in a puuid 
//Returns username and tag from RIOT api of null if not found
async function fetchUsingPuuid(puuid) {
  const response = await fetchWithRetry(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}?api_key=${process.env.RIOT_API_KEY}`);
  const json = await response.json();

  return response.ok ? json : null;
}

//Function takes in username and tag
//Returns puuid from RIOT api or null if not found
async function fetchPuuid(username, tag) {
  const response = await fetchWithRetry(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${username}/${tag}?api_key=${process.env.RIOT_API_KEY}`);
  const json = await response.json();

  return response.ok ? json : null;
}

async function getPlayerInfoByPuuid(puuid){
  let player = await database.findPlayersByPuuid(puuid);
  
  //if the player doesnt exist in my database, we need to find them using riot api and then add them to my database for future reference
  if(!player){
    console.log("user not in my database");
    //use riots api to find the puuid of the user given username and tag
    player = await fetchUsingPuuid(puuid);
    if(!player){
      console.log("Riot api did not find user: " + puuid);
      return null;
    }

    player = {
      username: player.gameName.toLowerCase(),
      tag: player.tagLine.toLowerCase(),
      puuid: player.puuid,
      lastUpdated: process.env.SET_START_TIME,
      matchIds: [],
    };

    //add a player document to my database containing information about the player. 
    
    database.insertPlayer(player);
  }

  return player;
}
//returns database information on player that matches a certain username and tag
async function getPlayerInfo(username, tag){
  //looks through my database to find the player
  let player = await database.findPlayers(username,tag);
  
  //if the player doesnt exist in my database, we need to find them using riot api and then add them to my database for future reference
  if(!player){
    console.log("users not in my database");
    //use riots api to find the puuid of the user given username and tag
    player = await fetchPuuid(username, tag);
    if(!player){
      console.log("Riot api did not find user: " + username + " " + tag);
      return null;
    }

    //add a player document to my database containing information about the player. 
    player = {
      username: player.gameName.toLowerCase(),
      tag: player.tagLine.toLowerCase(),
      puuid: player.puuid,
      lastUpdated: process.env.SET_START_TIME,
      matchIds: [],
    };
    
    database.insertPlayer(player);
    console.log("Added player: " + username + " " + tag);
  }

  return player;
}

//function takes in when my database was last updated and a player's puuid
//queries riot api for all matches played by that player after the given time
async function fetchMatchIDs(startTime = lastUpdated, puuid) {
  //we do not want duplicate matches so we use a set
  const matchIDs = new Set();
  let start = 0;

  //do have to use this do while loop because riot's api only returns a max of 200 matchIds per query
  do {
    const response = await fetchWithRetry(`https://americas.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?start=${start}&startTime=${startTime}&count=200&api_key=${process.env.RIOT_API_KEY}`);
    const json = await response.json();
    if(json){
      const set = new Set(json);

      //combines the set of matches we just got with the overall set of total match Ids
      set.forEach(match => matchIDs.add(match));
    } else {
      console.log("failed");
    }

    start += 200;
  } while (matchIDs.size == start);

  return matchIDs;
}

//function takes in a riot api url to fetch and attempts to execute the fetch request a few times until it passes the rate limit.
async function fetchWithRetry(url, retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
      try{
        const response = await limiterPerSecond.schedule(() => fetch(url));
        limiterPerSecond.currentReservoir()
.then((reservoir) => console.log(reservoir));
        if (response.status === 429) {
          console.log("Rate limited, retrying...");
          //pause the program for a set delay when we face a 429 error. 
          //This works because we essentially are waiting for riot's api to give us more api calls
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        } else {
            return response;
        }
      } catch(error){
        console.error("Error with limiter: ", error);
      }
      
      
  }
  throw new Error('Max retries reached');
}

//function takes in a list of matchIds and a puuid and returns only the double up matches in that list of matchIds
async function filterDoubleUpGames(matchIds) {
  let doubleUpMatchIDs1 = [];
  let doubleUpMatchIDs2 = [];
  //loop through every single matchId
  await Promise.all(matchIds.map(async (matchId) => {
    //fetch the matchId from the riot api
    const response = await fetchWithRetry(`https://americas.api.riotgames.com/tft/match/v1/matches/${matchId}?api_key=${process.env.RIOT_API_KEY}`);
    
    

    const json = await response.json();

    
    
    if (json) {
      //console.log(json.info.participants[0]);
      

      const info = json.info;

      if(info.queue_id === 1160){
        console.log("looking up: " + matchId);

        //get the participants in the game
        const participants = info.participants;
        for(let i = 0; i < participants.length; i++){
          const player = participants[i];
          const puuid = player.puuid;

          const playerInfo = await getPlayerInfoByPuuid(puuid);

          participants[i].username = playerInfo.username;
          participants[i].tag = playerInfo.tag;
          
          const team = player.partner_group_id;
          const teammate = participants.find(p => p.partner_group_id === team && p.puuid !== puuid);
          
          database.updateMatchesByPuuid(puuid, {teammate: teammate.puuid, matchId: matchId});


          
        }
        

        database.insertMatch(json);
      }
    } else {
      console.log("Error couldn't read json: " + matchId);
    }
    
  }));

  console.log(doubleUpMatchIDs1.length + " " + doubleUpMatchIDs2.length);

  return [doubleUpMatchIDs1,doubleUpMatchIDs2];
}

async function getPlayerMatches(player){
  //get information about the current player including their puuid and when I last pulled information about them
  const puuid = player.puuid;

  const lastUpdated = player.lastUpdated;

  //fetch the matchIds of any new matches they have played since my database was last updated.
  const newMatches = await fetchMatchIDs(lastUpdated, puuid);

  return newMatches;
}

async function checkPlayer(username, tag){
  let player = await getPlayerInfo(username, tag);
  //if the player with the tag cannot be found then return an error back to the front end

  player = player == null ? await database.findPlayerNoTag(username) : player;

  if(player == null){
    console.log("user does not exist");
    res.status(404).send({username: username, tag: tag});
    return;
  }

  let playerMatches = await getPlayerMatches(player);

  return {puuid: player.puuid, matches: playerMatches};
}

//function updates player information in my database
async function checkPlayers(username1, tag1, username2, tag2){
  //check if the player currently exists in my database or in the riot database/add them to my database
  let player1Matches = await checkPlayer(username1, tag1);

  let player2Matches = await checkPlayer(username2, tag2);

  const newMatches = new Set([...player1Matches.matches, ...player2Matches.matches])


  //filter out any useless games that aren't double up games
  await filterDoubleUpGames(Array.from(newMatches));
  console.log("done filtering");
  //update the last updated time in my database
  database.updateTime(player1Matches.puuid);
  database.updateTime(player2Matches.puuid);

  return [player1Matches.puuid,player2Matches.puuid];
}

//function gets information on double up games given all the matchIds to look for
async function fetchGameStats(commonIds) {
  let stats = [];
  
  for(let matchId of commonIds){
    const match = await database.findMatch(matchId);

    const id = match.info.gameId;

    let index = 0;

    for(let i = 0; i < stats.length; i++){
      if(stats[i].info.gameId < id){
        break;
      }
      index++;
    }

    stats = [
      ...stats.slice(0,index),
      match,
      ...stats.slice(index)
    ];
  }
  console.log("Num games: " + stats.length);

  return stats;
  /*
  //go through all the double up game Ids that both players have in common and collect stats on them
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
        let gameStats = [];
        const placement = Math.ceil(player1Data.placement/2);
        placementCounts[placement-1]++;
        gameStats.push(placement);
        gameStats.push(player1Data.total_damage_to_players);
        gameStats.push(player2Data.total_damage_to_players);
        gameStats.push(matchID);
        stats.push(gameStats);
      }
    } else {
      console.log("skipped: " + matchID);
    }
  }));

  stats.push(placementCounts);
  return stats;

  */
}

//code generates an array of match IDs that two players have in common
const getMatches = async (req, res) => {
    const username1 = req.query.username;
    const tag1 = req.query.tag;
    const username2 = req.query.username2;
    const tag2 = req.query.tag2;
    console.log("Parameters: " + username1 + "#" + tag1 + " " + username2 + "#" + tag2);

    //connect to mongoDB
    await database.connectToMongoDB();

    //database.clearGames();

    //update my database with games and stats of both players
    puuids = await checkPlayers(username1,tag1,username2,tag2);

    //console.log(puuids);

    //find the games where both players were teammates
    const commonIds = await database.findCommonMatches(puuids[0],puuids[1]);

    console.log("Games in common: " + commonIds.matchIds);
    
    //collect stats on those games
    //array of stats containing [placement,player1damage,player2damage,matchID]
    if(commonIds.matchIds && commonIds.matchIds.length > 0){
      const matchStats = await fetchGameStats(commonIds.matchIds);

      //console.log(matchStats);
      res.status(200).send([puuids,matchStats]);
    } else {
      //deal with having no games in common later
      res.status(200).send("");
    }
    
    return;
  };

  module.exports = {
    getMatches
  };