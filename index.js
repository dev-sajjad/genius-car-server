const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { query } = require('express');
const jwt = require('jsonwebtoken')
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

    // get specific user order data by email query and execute verifyJWT function
    app.get('/orders', verifyJWT, async (req, res) => {

      // get decoded from req
      const decoded = req.decoded;
      if (decoded?.email !== req.query.email) {
        res.status(403).send({message: 'Unauthorized access!'})
      }

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


    // update a specific order status 
    app.patch('/orders/:id', async(req, res) => {
      const id = req.params.id;
      const filter= { _id: ObjectId(id) }
      const status = req.body.status;
      const updatedDoc = {
        $set: {
          status: status,
        }
      }
      const result = await orderCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })

    // delete an  order
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id:ObjectId(id)}
      const result = await orderCollection.deleteOne(query);
      res.send(result)
      console.log(result)
    })

  }
  finally {

  }
}
run().catch(err => console.error(err))


// verify JWT token 
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({ message: "Unauthorized request!" });
  }

  // get the token: we send token as `Bearer token` then we split it with empty space get back an array.
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
     return res.status(401).send({ message: "Unauthorized Access!" });
    }
    req.decoded = decoded;

    // must call the next(), otherwise function will not go further
    next();
  });
}


//sign JWT token
app.post('/jwt', (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });  // (when jwt will expires)
  res.send({token})
})




app.listen(port, (req, res) => {
   console.log(`Genius Car server is running on port: ${port}`)
})