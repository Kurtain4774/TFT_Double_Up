const Bottleneck = require("bottleneck");
const { connectToMongoDB, insertPlayer, insertMatch, findPlayers, findPlayerNoTag, findMatch, updateTime, updateMatches, findCommonMatches, clearGames, deletePlayers } = require('../database/player-db');
const playerModel = require('../database/schemas/player-schema');
const matchModel = require('../database/schemas/match-schema');

//Bottleneck limiter limits number of requests to 1 per 1200ms or 100 per 2 minutes
const limiterPerSecond = new Bottleneck({
  //reservoir helps with bursts of requests

  minTime: 1200,
  maxConcurrent: 1,

  reservoir: 100, // initial value
  reservoirRefreshAmount: 100,
  reservoirRefreshInterval: 60 * 1000 * 2, // must be divisible by 250
});

limiterPerSecond.on('error', (error) => {
  console.error('Error event caught:', error.message);
});

// Failed event listener (triggered when a job fails)
limiterPerSecond.on('failed', (error, jobInfo) => {
  console.error('Job failed:', error.message, jobInfo);
  // Optionally, retry failed jobs
  if (jobInfo.retryCount < 3) { // Retry up to 3 times
    return 1000; // Retry after 1 second
  }
});

//Function takes in username and tag
//Returns puuid from RIOT api or null if not found
async function fetchPuuid(username, tag) {
  const response = await fetchWithRetry(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${username}/${tag}?api_key=${process.env.RIOT_API_KEY}`);
  const json = await response.json();

  return response.ok ? json.puuid : null;
}

//returns database information on player that matches a certain username and tag
async function getPlayerInfo(username, tag){
  //looks through my database to find the player
  let player = await findPlayers(username,tag);
  
  //if the player doesnt exist in my database, we need to find them using riot api and then add them to my database for future reference
  if(!player){
    //use riots api to find the puuid of the user given username and tag
    const puuid = await fetchPuuid(username, tag);
    if(!puuid){
      console.log("Riot api did not find user: " + username + " " + tag);
      return null;
    }

    //add a player document to my database containing information about the player. 
    player = {
      username: username,
      tag: tag,
      puuid: puuid,
      lastUpdated: process.env.SET_START_TIME
    }
    insertPlayer(player);
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
async function fetchWithRetry(url, retries = 5, delay = 1200) {
  for (let i = 0; i < retries; i++) {
      try{
        const response = await limiterPerSecond.schedule(() => fetch(url));

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
async function filterDoubleUpGames(matchIds, puuid1, puuid2) {
  let doubleUpMatchIDs1 = [];
  let doubleUpMatchIDs2 = [];
  //loop through every single matchId
  await Promise.all(matchIds.map(async (matchId) => {
    //fetch the matchId from the riot api
    const response = await fetchWithRetry(`https://americas.api.riotgames.com/tft/match/v1/matches/${matchId}?api_key=${process.env.RIOT_API_KEY}`);
    console.log("looking up: " + matchId);
    //limiterPerSecond.currentReservoir()
//.then((reservoir) => console.log(reservoir));

    const json = await response.json();

    
    
    if (json) {
      //console.log(json.info.participants[0]);
      

      const info = json.info;

      if(info.queue_id === 1160){
        insertMatch(json);

        //get the participants in the game
        const participants = info.participants;

        // Find the player data for the first puuid
        let playerData = participants.find(player => player.puuid === puuid1);
        
        if (playerData) {
          const team = playerData.partner_group_id;

          // Find the teammate's puuid who is in the same team but not the same player
          const teammate = participants.find(player => player.partner_group_id === team && player.puuid !== puuid1);

          if (teammate) {
            doubleUpMatchIDs1.push({ teammate: teammate.puuid, matchId: matchId });
          }
        }

        // Find the player data for the given puuid
        playerData = participants.find(player => player.puuid === puuid2);

        if (playerData) {
          const team = playerData.partner_group_id;

          // Find the teammate's puuid who is in the same team but not the same player
          const teammate = participants.find(player => player.partner_group_id === team && player.puuid !== puuid2);

          if (teammate) {
            doubleUpMatchIDs2.push({ teammate: teammate.puuid, matchId: matchId });
          }
        }
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

//function updates player information in my database
async function checkPlayer(username1, tag1, username2, tag2){
  //check if the player currently exists in my database or in the riot database/add them to my database
  let player1 = await getPlayerInfo(username1, tag1);
  //if the player with the tag cannot be found then return an error back to the front end

  player1 = player1 == null ? await findPlayerNoTag(username1) : player1;

  if(player1 == null){
    console.log("user does not exist");
    res.status(404).send({username: username1, tag: tag1});
    return;
  }

  let player2 = await getPlayerInfo(username2,tag2);

  player2 = player2 == null ? await findPlayerNoTag(username2) : player2;

  //if the player with the tag cannot be found then return an error back to the front end
  if(player2 == null){
    console.log("user does not exist");
    res.status(404).send({username: username2, tag: tag2});
    return;
  }

  let player1Matches = await getPlayerMatches(player1);

  let player2Matches = await getPlayerMatches(player2);

  const newMatches = new Set([...player1Matches, ...player2Matches])

  

  //get the number of new matches
  //if there is a low number of new matches we can change the limiter settings since we are unlikely to run into api rate limits
  const totalMatches = newMatches.size;

  if(totalMatches < 90 && await limiterPerSecond.currentReservoir() >= totalMatches){
    console.log("changed to 50ms");
    limiterPerSecond.updateSettings({minTime: 50});
  } else {
    console.log("changed to 1200ms");
    limiterPerSecond.updateSettings({minTime: 1200});
  }

  //filter out any useless games that aren't double up games
  const newDoubleUpGames = await filterDoubleUpGames(Array.from(newMatches), player1.puuid, player2.puuid);
  console.log("done filtering");
  //update the last updated time in my database
  updateTime(player1.username,player1.tag);
  updateTime(player2.username,player2.tag);



  //add the new matches into my database for future reference
  await updateMatches(player1.username,player1.tag,newDoubleUpGames[0]);
  await updateMatches(player2.username,player2.tag,newDoubleUpGames[1]);

  return [player1.puuid, player2.puuid];
}

//function gets information on double up games given all the matchIds to look for
async function fetchGameStats(commonIds, puuidArray) {
  const stats = [];
  
  for(let matchId of commonIds){
    const match = await findMatch(matchId);

    stats.push(match)
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
    await connectToMongoDB();

    //clearGames();

    //update my database with games and stats of both players
    const puuids = await checkPlayer(username1,tag1,username2,tag2);


    //find the games where both players were teammates
    const commonIds = await findCommonMatches(puuids[0], puuids[1]);

    //console.log("Games in common: " + commonIds.matchIds);
    
    //collect stats on those games
    //array of stats containing [placement,player1damage,player2damage,matchID]
    if(commonIds.matchIds.length > 0){
      const matchStats = await fetchGameStats(commonIds.matchIds, puuids);

      //console.log(matchStats);
      res.status(200).send([...matchStats]);
    } else {
      //deal with having no games in common later
      res.status(200).send("");
    }
    
    return;
  };

  module.exports = {
    getMatches
  };