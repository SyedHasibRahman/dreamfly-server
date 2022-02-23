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

// ................ blog api start .............. //
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
        app.get('/blogs/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const blog = await blogsCollection.findOne(query);
            res.json(blog);
        });

        //POST Blogs API
        app.post('/blogs', async(req, res) => {
            const blogs = req.body;  
            const result = await blogsCollection.insertOne(blogs);
            res.json(result);
        });

        //DELETE Blog API
        app.delete('/blogs/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await blogsCollection.deleteOne(query);
            console.log('deleting blog with id ', result);
            res.json(result);
        });

        //UPDATE Blog API
        app.put("/blogs/:id", async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) };
            console.log(req.params.id);
            const result = await blogsCollection.updateMany(filter, {
              $set: {
                title: req.body.title,
                fullTitle: req.body.fullTitle,
                info: req.body.info,
                description: req.body.description,
                quote: req.body.quote,
                quoteName: req.body.quoteName,
                tag1: req.body.tag1,
                tag2: req.body.tag2,
              },
            });
            res.send(result);
            console.log(result);
          });
   
// ................ blog api end .............. //

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