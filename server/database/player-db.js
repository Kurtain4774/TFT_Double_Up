const { MongoClient, ServerApiVersion, TopologyDescription } = require('mongodb');
const mongoose = require('mongoose');
const Player = require('./schemas/player-schema');
const dotenv = require("dotenv");

//constants
const databaseName = 'doubleUp';
const collectionName = 'players';

//loads in my .env variables
dotenv.config();

//get the mongoDB url
const mongoURI = process.env.DB_STRING;

//create a new mongoDB client that can be used to make changes to my database
const client = new MongoClient(mongoURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//function to connect to mongoDB
async function connectToMongoDB() {
    // Connect logic
    await mongoose.connect(mongoURI, {
    }).then(() => {
        console.log('Connected to MongoDB');
    }).catch(err => {
        console.error('Error connecting to MongoDB:', err.message);
    });
}

//add the player into my database
async function insertPlayer(player) {
    try {
        const p = new Player(player);

        // Save the user to the database
        await p.save();
        
        console.log('User registered successfully,');
    } catch (error) {
        console.log('Error adding player to database:', error);
    }

    
}

//function finds a player that matches the given username and tag
async function findPlayers(username, tag) {
    const db = client.db(databaseName);
    const col = db.collection(collectionName);

    const cursor = await col.findOne({username: username, tag: tag});

    return cursor;
}

async function findMatches(puuid1, puuid2) {
    // Find products logic
    const db = client.db(databaseName);
    const col = db.collection(collectionName);

    //find the player that matches the puuid
    //then open the matchIds array into a table/document
    //find all the matchIds that have teammate matching puuid2
    //group the information back together into an array
    //project removes the teammate column so that the data is ready to send off
    const player = await Player.aggregate([
        {
          $match: {
            puuid: puuid1  // Replace with the first input puuid
          }
        },
        {
          $unwind: "$matchIds"
        },
        {
          $match: {
            "matchIds.teammate": puuid2  // Replace with the second input puuid (teammate)
          }
        },
        {
            $group: {
                _id: '$_id',
                matchIds: { $push: '$matchIds.matchId' }
            }
        },
        {
            $project: {
                _id: 0,
                matchIds: 1
            }
        }
      ]);
    
    //return empty array if no games were found
    return player.length > 0 ? player[0] : [];
}

async function updateTime(username, tag) {
    // Update the time
    //find the right player
    const query = {username: username, tag: tag};

    //gets the current unix timestamp time in seconds
    const newTime = Math.floor(Date.now() / 1000);

    // Update the document with the current time
    const updateDoc = {
      $set: {
        lastUpdated: newTime // Set the `time` field to the current time in seconds
      }
    };

    //perform the update
    try{
        client.db(databaseName).collection(collectionName).updateOne(query, updateDoc);
    }catch(error){
        console.log(error);
    }
    
}

//adds new matches into a player in my database
async function updateMatches(username, tag, newMatches) {
  //query finds the right player to update
  const query = {username: username, tag: tag};

  // Update the document by pushing the new matches to the end of an array
  const updateDoc = {
    $push: {
      matchIds: { $each: newMatches } //each separates the games adding them one by one rather than pushing the entire array as one object entity to the end of the array
    }
  };

  try{
    await Player.updateOne(
      query, // Query to find the document
      updateDoc
    );      
  } catch(error){
      console.error('Error updating document:', error);
  }
}

//function clears the entire collection deleting all documents
async function deletePlayers() {
  await client.db(databaseName).collection(collectionName).deleteMany({});
}

//export these functions so they can be used in other javascript files
module.exports = {
  connectToMongoDB,
  insertPlayer,
  findPlayers,
  findMatches,
  updateTime,
  updateMatches,
  deletePlayers
};