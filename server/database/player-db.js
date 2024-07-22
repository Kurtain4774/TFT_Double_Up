const { MongoClient, ServerApiVersion } = require('mongodb');
const dotenv = require("dotenv");
const databaseName = 'doubleUp';
const collectionName = 'player';

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
      } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
      }
}

async function insertProduct(playerGames) {
    // Insert product logic
    const db = client.db(databaseName);
    const col = db.collection(collectionName);

    const p = await col.insertMany(playerGames);
}

async function findProducts() {
    // Find products logic
    const db = client.db(databaseName);
    const col = db.collection(collectionName);

    const data = await col.find();

    return JSON.stringify(data);
}

async function updateProduct(id, updatedFields) {
    // Update product logic
}

async function deleteProduct(id) {
    // Delete product logic
}

module.exports = {
    connectToMongoDB,
    insertProduct,
    findProducts,
    updateProduct,
    deleteProduct
};