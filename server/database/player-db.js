const { MongoClient, ServerApiVersion } = require('mongodb');
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
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
      } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        throw error; // Throw error to handle it elsewhere if needed
    }
}

async function insertPlayer(player) {
    // Insert product logic
    const db = client.db(databaseName);
    const col = db.collection(collectionName);

    const result = await col.insertOne(player);

    console.log("Insert Done");
}

async function findPlayers() {
    // Find products logic
    const db = client.db(databaseName);
    const col = db.collection(collectionName);

    const data = await col.find();

    return JSON.stringify(data);
}

async function updatePlayer(id, updatedFields) {
    // Update product logic
}

async function deletePlayer(id) {
    // Delete product logic
}

module.exports = {
    connectToMongoDB,
    insertPlayer,
    findPlayers,
    updatePlayer,
    deletePlayer
};