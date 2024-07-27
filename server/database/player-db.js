const { MongoClient, ServerApiVersion, TopologyDescription } = require('mongodb');
const mongoose = require('mongoose');
const Player = require('./schemas/player-schema');
const dotenv = require("dotenv");
const databaseName = 'doubleUp';
const collectionName = 'players';

dotenv.config();
const mongoURI = process.env.DB_STRING;
const client = new MongoClient(mongoURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function connectToMongoDB() {
    // Connect logic
    await mongoose.connect(mongoURI, {
    }).then(() => {
        console.log('Connected to MongoDB');
    }).catch(err => {
        console.error('Error connecting to MongoDB:', err.message);
    });
}

async function insertPlayer(player) {
    // Insert product logic
    //console.log("Inserting player: " + player.username);
    
    try {
        const p = new Player(player);

        // Save the user to the database
        await p.save();
        
        console.log('User registered successfully,');
    } catch (error) {
        // Check if the error is due to duplicate email

        console.log('Error registering user:', error);
    }

    
}

async function findPlayers(username, tag) {
    // Find products logic
    const db = client.db(databaseName);
    const col = db.collection(collectionName);

    const cursor = await col.findOne({username: username, tag: tag});

    return cursor;
}

async function findMatches(puuid1, puuid2) {
    // Find products logic
    const db = client.db(databaseName);
    const col = db.collection(collectionName);

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
      //console.log("length: " + player.length);
      //console.log(player[0].matchIds);

    return player.length > 0 ? player[0] : [];
}

async function updateTime(username, tag) {
    // Update the time

    const query = {username: username, tag: tag};

    const newTime = Math.floor(Date.now() / 1000);

    // Update the document with the current time
    const updateDoc = {
      $set: {
        lastUpdated: newTime // Set the `time` field to the current time in seconds
      }
    };
    try{
        client.db(databaseName).collection(collectionName).updateOne(query, updateDoc);
        console.log("updated time for: " + username);
    }catch(error){
        console.log(error);
    }
    
}

async function updateMatches(username, tag, newMatches) {
    const query = {username: username, tag: tag};


    // Update the document with the current time
    const updateDoc = {
      $push: {
        matchIds: { $each: newMatches } // Set the `time` field to the current time in seconds
      }
    };
    try{
        //await client.db(databaseName).collection(collectionName).updateOne(query, updateDoc);

        await Player.updateOne(
            query, // Query to find the document
            updateDoc
          );
      
          //console.log(result); // Output the result of the update operation
    } catch(error){
        console.error('Error updating document:', error);
    }
    
}

async function deletePlayers() {
    await client.db(databaseName).collection(collectionName).deleteMany({});

}

module.exports = {
    connectToMongoDB,
    insertPlayer,
    findPlayers,
    findMatches,
    updateTime,
    updateMatches,
    deletePlayers
};