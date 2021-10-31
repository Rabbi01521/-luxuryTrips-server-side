const { MongoClient } = require("mongodb");
const express = require("express");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s3raz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("luxry_Trip");
    const tripsCollection = database.collection("trips");
    const orderCollection = database.collection("orders");
    const hotelCollection = database.collection("hotels");
    console.log("connected");
    // GET API
    app.get("/trips", async (req, res) => {
      const cursor = tripsCollection.find({});
      const trips = await cursor.toArray();
      res.send(trips);
    });

    // GET Single API
    app.get("/trips/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const trip = await tripsCollection.findOne(query);
      console.log("load trips with id:", id);
      res.send(trip);
    });

    app.get("/orders", async (req, res) => {
      const cursor = orderCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });

    app.get("/hotel", async (req, res) => {
      const cursor = hotelCollection.find({});
      const hotels = await cursor.toArray();
      res.send(hotels);
    });

    // ADD ORDER POST API

    app.post("/trips", async (req, res) => {
      const newTrips = req.body;
      const result = await tripsCollection.insertOne(newTrips);
      console.log("hitting the Post", req.body);
      console.log("added Trip", result);
      res.json(result);
    });

    app.post("/orders", async (req, res) => {
      const newOrder = req.body;
      const result = await orderCollection.insertOne(newOrder);
      console.log("hitting the Post", result);
      res.json(result);
    });

    // DELETE ORDER API
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      console.log("deleting Orders with id", result);
      res.json(result);
    });

    // UPDATE Status

    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const updateStatus = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updateStatus.status,
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log("update Status", req);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running my CRUD SERVER");
});

app.listen(port, () => {
  console.log("Running Server on Port", port);
});
