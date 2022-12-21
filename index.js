const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;
const app = express();

require("dotenv").config();


// middleware
app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.send('Genius Car server is running')
})

// db user info
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ozga6sm.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const serviceCollection = client.db('geniusCar').collection('services')

    //get all services data from database
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const service = await cursor.toArray();
      res.send(service);
    });
  }
  finally {

  }
}
run().catch(err => console.error(err))






app.listen(port, (req, res) => {
   console.log(`Genius Car server is running on port: ${port}`)
})