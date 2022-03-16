const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;


//middleware
app.use(cors());
app.use(express.json());
// router.use(cors());


//Conect MongoDB
// https://web.programming-hero.com/web-4/video/web-4-70-9-module-summary-and-database-connection 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x4jxd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


//  console.log(uri);

async function run() {
  try {
    await client.connect();

    const database = client.db('DreamFly');
    const blogsCollection = database.collection('blogs');

    // GET Blogs API
    app.get('/blogs', async (req, res) => {
      const cursor = blogsCollection.find({});
      const blogs = await cursor.toArray();
      res.send(blogs);
    });

    // //GET blogs API
    // app.get('/blogs', async (req, res) => {
    //     const cursor = blogsCollection.find({});
    //     const page = req.query.page;
    //     const size = parseInt(req.query.size);
    //     let blogs;
    //     const count = await cursor.count();

    //     if (page) {
    //         blogs = await cursor.skip(page * size).limit(size).toArray();
    //     }
    //     else {
    //         blogs = await cursor.toArray();
    //     }

    //     res.send({
    //         count,
    //         blogs
    //     });
    // });

    //GET Single blog
    app.get('/blogs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const blog = await blogsCollection.findOne(query);
      res.json(blog);
    });


    console.log('DB Connected');
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello DreamFly!')
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})