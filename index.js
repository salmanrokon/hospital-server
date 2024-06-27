const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e0co39v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    const servicesCollections = client.db('hospital').collection('services');
    const blogsCollections = client.db('hospital').collection('blogs');
    const usersCollections = client.db('hospital').collection('users');
    const doctorsCollections = client.db('hospital').collection('doctors');

    app.get('/services', async (req, res) => {
      const services = await servicesCollections.find().toArray();
      res.send(services);
    });

    // Updated /blogs endpoint to handle search functionality
    app.get('/blogs', async (req, res) => {
      const searchTerm = req.query.search || '';
      const query = searchTerm ? { Title: { $regex: searchTerm, $options: 'i' } } : {};
      const blogs = await blogsCollections.find(query).toArray();
      res.send(blogs);
    });

    //users related API
    app.post('/users',async(req,res)=>{
      const user = req.body;
      const query={email :user.email}
      const existingUser =await usersCollections.findOne(query);
      if(existingUser){
        res.status(400).send('User already exists');
        return;
      }
      const result = await usersCollections.insertOne(user);
      res.json(result);
    })

    app.get('/users',async(req,res)=>{
      const users = await usersCollections.find().toArray();
      res.send(users);
    })

    app.get('/doctors',async(req,res)=>{
      const doctors = await doctorsCollections.find().toArray();
      res.send(doctors);
    })
    app.post('/doctors',async(req,res)=>{
      const doctor = req.body;
      const query={doctor_id :doctor.doctor_id}
      const existingDoctor =await doctorsCollections.findOne(query);
      if(existingDoctor){
        res.status(400).send('Doctor already exists');
        return;
      }
      const result = await doctorsCollections.insertOne(doctor);
      res.json(result);
    });

    app.put('/doctors/:id',async (req, res) => {
      const id=req.params.id;
      const query={_id:new ObjectId(id)}
      const updateDoc={
        $set:{
          
        }
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
