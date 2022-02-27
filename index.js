const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;
const stripe = require('stripe')(process.env.STRIPE_SECRET)


//middleware
app.use(cors());
app.use(express.json());
// router.use(cors());

// https://vast-retreat-08893.herokuapp.com/  | https://git.heroku.com/vast-retreat-08893.git

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
        const userCollection = database.collection("users");
        const tourCollection = database.collection("tourPackages");
        const ordersCollection = database.collection('orders');

        // GET Blogs API
        app.get('/blogs', async (req, res) => {
            const cursor = blogsCollection.find({});
            const blogs = await cursor.toArray();
            res.send(blogs);
        });
        // GET tourPackages API
        app.get('/tourPackages', async (req, res) => {
            const cursor = tourCollection.find({});
            const tourPackages = await cursor.toArray();
            res.send(tourPackages);
        });

        // POST Order API 
        app.post('/orders', async (req, res) => {
            const orders = req.body;
            console.log('hit', orders);
            const result = await ordersCollection.insertOne(orders);
            console.log(result);
            res.json(result);
        });
        // GET Order API 
        app.get('/myorders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);

        });
        // GET Order API 
        app.get('/myorders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.findOne(query);
            res.json(result);
        });
        // save Payment to myorders 

        app.put('/myorders/:id', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    payment: payment
                }
            };
            const result = await ordersCollection.updateOne(filter, updateDoc);
            res.json(result);

        })

        //GET Single blog
        app.get('/tourPackages/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tourPackage = await tourCollection.findOne(query);
            res.json(tourPackage);
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


        // console.log('DB Connected');


        // GET - All users

        /* ========================= 
        User Collection START 
        ======================= */

        // GET - All users
        app.get("/users", async (req, res) => {
            const cursor = userCollection.find({});
            const users = await cursor.toArray();
            res.json(users);
        });

        // GET For Payment 
        app.get('/booked:/id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookedCollection.findOne(query);
            res.json(result);
        })

        // POST - Save user info to user collection
        app.post("/users", async (req, res) => {
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser);
            console.log(result);
            res.json(result);
        });

        // PUT - Update user data to database for third party login system
        app.put("/users", async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // Delete - Delete an user from DB
        app.delete("/users/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.json({ _id: id, deletedCount: result.deletedCount });
        });

        // GET - Admin Status.
        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await userCollection.findOne(query);
            let isAdmin = false;
            if (result?.role === "admin") {
                isAdmin = true;
                res.json({ admin: isAdmin });
            } else {
                res.json({ admin: isAdmin });
            }
        });

        // PUT - Set an user role as admin


        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })



        /*         app.put("/make-admin/:id", async (req, res) => {
                    const filter = req.params.id;
                    const updateDoc = {
                        $set: {
                            role: "admin",
                        },
                    };
                    const result = await userCollection.updateOne(
                        { email: filter },
                        updateDoc
                    );
                    res.json(result);
                    console.log(result);
                });
        
                app.get("/admins", async (req, res) => {
                    const cursor = userCollection.find({});
                    const users = await cursor.toArray();
                    res.json(users);
                }); */

        /* ========================= 
        User Collection END 
        ======================= */
        // Payment 
        app.post("/create-payment-intent", async (req, res) => {
            const paymentInfo = req.body;
            const amount = paymentInfo.price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                // amount: calculateOrderAmount(items),
                currency: "usd",
                amount: amount,
                payment_method_types: ['card']
            });
            res.json({
                clientSecret: paymentIntent.client_secret,
            });
        })


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