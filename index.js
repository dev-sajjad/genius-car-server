const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const orderCollection = client.db('geniusCar').collection('orders')

    //service api
    //get all services data from database
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const service = await cursor.toArray();
      res.send(service);
    });

    //get a specific service by using dynamic id from db
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const service = await serviceCollection.findOne(query)
      res.send(service)
    })


    // order api

    // get specific user order data by email query
    app.get('/orders', async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email
        }
      }
      const cursor = orderCollection.find(query)
      const orders = await cursor.toArray();
      res.send(orders)
    })

    // post order data to database 
    app.post('/orders', async (req, res) => {
      const order = req.body
      const result = await orderCollection.insertOne(order)
      console.log(result)
      res.send(result);
    })

  }
  finally {

  }
}
run().catch(err => console.error(err))






app.listen(port, (req, res) => {
   console.log(`Genius Car server is running on port: ${port}`)
})