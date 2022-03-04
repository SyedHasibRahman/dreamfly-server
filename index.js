const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;
const stripe = require('stripe')(process.env.STRIPE_SECRET)


//middleware
app.use(cors());
app.use(express.json());
// router.use(cors());





//Conect MongoDB
// https://web.programming-hero.com/web-4/video/web-4-70-9-module-summary-and-database-connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x4jxd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

//  console.log(uri);

async function run() {
  try {
    await client.connect();

    const database = client.db('DreamFly');
    const blogsCollection = database.collection('blogs');
    const userCollection = database.collection("users");
    const tourCollection = database.collection("tourPackages");
    const ordersCollection = database.collection('orders');
    const flightCollection = database.collection("flights");





    // GET tourPackages API
    app.get('/tourPackages', async (req, res) => {
      const cursor = tourCollection.find({});
      const tourPackages = await cursor.toArray();
      res.send(tourPackages);
    });



  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello DreamFly!");
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});