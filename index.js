const express = require("express");
const app = express();
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;
const stripe = require('stripe')(process.env.STRIPE_SECRET)

// wedreamfly-adminsdk.json


const serviceAccount = require("./wedreamfly-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

//middleware
app.use(cors());
app.use(express.json());
// router.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x4jxd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function verifyToken(req, res, next) {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
    const token = req.headers.authorization.split(' ')[1];


    try {
      const decodedUser = await admin.auth().verifyIdToken(token);
      req.decodedEmail = decodedUser.email;
    }
    catch {

    }
  }
  next()
}

async function run() {
  try {
    await client.connect();

    const database = client.db('DreamFly');
    const blogsCollection = database.collection('blogs');
    const userCollection = database.collection("users");
    const tourCollection = database.collection("tourPackages");
    const ordersCollection = database.collection('orders');
    const flightCollection = database.collection("flights");
    const commentsCollection = database.collection("comment");
    const ratingsCollection = database.collection("reviews");
    const serviceCollection = database.collection("service");
    const teamsInfoCollection = database.collection("teamsInfo");
    const coursesCollection = database.collection("courses");
    const subscribesCollection = database.collection("subscribes");

    // ................ blog api start .............. //

    //GET blogs API
    app.get('/blogs', async (req, res) => {
      const cursor = blogsCollection.find({});
      const page = req.query.page;
      const size = parseInt(req.query.size);
      let blogs;
      const count = await cursor.count();

      if (page) {
        blogs = await cursor.skip(page * size).limit(size).toArray();
      }
      else {
        blogs = await cursor.toArray();
      }

      res.send({
        count,
        blogs
      });
    });

    //GET Single blog
    app.get("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const blog = await blogsCollection.findOne(query);
      res.json(blog);
    });

    //POST Blogs API
    app.post('/blogs', async (req, res) => {
      const blogs = req.body;
      const result = await blogsCollection.insertOne(blogs);
      res.json(result);
    });

    //DELETE Blog API
    app.delete('/blogs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
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



    // ................ users api start .............. //

    // GET - All users
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find({});
      const users = await cursor.toArray();
      res.json(users);
    });

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
      console.log("put", user);
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
    app.put("/make-admin/:id", async (req, res) => {
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

    // Get api admin
    app.get("/admins", async (req, res) => {
      const cursor = userCollection.find({});
      const users = await cursor.toArray();
      res.json(users);
    });

    // PUT - Set an user role as admin
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // ................ users api end .............. //



    // ................ Tourpackage api start .............. //

    // GET tourPackages API
    app.get('/tourPackages', async (req, res) => {
      const cursor = tourCollection.find({});
      const tourPackages = await cursor.toArray();
      res.send(tourPackages);
    });

    //GET Single tourPackages
    app.get('/tourPackages/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const tourPackage = await tourCollection.findOne(query);
      res.json(tourPackage);
    });

    // POST package order API
    app.post('/tourPackages', async (req, res) => {
      const product = req.body;
      const result = await tourCollection.insertOne(product);
      res.json(result);
    });


      // Delete - Delete an user from DB
      app.delete("/tourPackages/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await tourCollection.deleteOne(query);
        res.json({ _id: id, deletedCount: result.deletedCount });
    });

    app.put('/tourPackages/:id', async (req, res) => {
        const id = req.params.id;
        const updatedPackage = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
            $set: {
                images: updatedPackage.images,
                title: updatedPackage.title,
                price: updatedPackage.price,
                category: updatedPackage.category,
                person: updatedPackage.person,
                date: updatedPackage.date
            },
        };
        const result = await tourCollection.updateOne(filter, updateDoc, options)
        console.log('updating user', req);
        res.json(result)
    })

    // ................ Tourpackage api end .............. //



    // ................ Order api start .............. //

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

    });

    // ................ Order api end .............. //



    // ................ Flight api start .............. //

    // Get flight data
    app.get("/flight", async (req, res) => {
      const cursor = flightCollection.find({});
      const flight = await cursor.toArray();
      res.json(flight);
    });

    // get the filter flight data
    app.get("/filterFlight", async (req, res) => {
      const cursor = flightCollection.find({});
      const flight = await cursor.toArray();
      res.json(flight);
    });

    // get the flight data
    app.get("/filter", async (req, res) => {
      const cursor = flightCollection.find({});
      const flight = await cursor.toArray();
      res.json(flight);
    });

    // filter by from to
    app.post("/filter", async (req, res) => {
      const query = req.body;
      const result = await flightCollection.find(query).toArray();
      res.json(result);
    });

    // Get Flight by ID
    app.get('/flight/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const flight = await flightCollection.findOne(query);
      res.json(flight);
    });


    // ................ Flight api end .............. //



    // ................ comment api start .............. //

    //GET comment api
    app.get("/comments", async (req, res) => {
      const cursor = commentsCollection.find({});
      const comments = await cursor.toArray();
      res.json(comments);
    });

    //POST comment api
    app.post('/comments', async (req, res) => {
      const comments = req.body;
      const result = await commentsCollection.insertOne(comments);
      res.json(result);
    });

    //delete comment api
    app.delete('/comments/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await commentsCollection.deleteOne(query);
      res.json(result);
    });

    // ................ comment api end .............. //



    // ................ Review api start .............. //

    // get Ratings by users //
    app.get('/reviews', async (req, res) => {
      const cursor = ratingsCollection.find({});

      const result = await cursor.toArray();
      res.json(result);
    });

    // POst Ratings By users //
    app.post('/reviews', async (req, res) => {
      const data = req.body;

      const result = await ratingsCollection.insertOne(data);

      res.send(result);
    });

    // ................ Review api end .............. //



    // ................ Services api start .............. //

    // GET services API
    app.get('/services', async (req, res) => {
      const cursor = serviceCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });

    //GET Single 
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.json(service);
    });

    // ................ Services api end .............. //


    app.put('/users/admin', verifyToken, async (req, res) => {
      const user = req.body;
      console.log('decodedEmail', req.decodedEmail);
      const requester = req.decodedEmail;
      if (requester) {
        const requesterAccount = await userCollection.findOne({ email: requester });
        if (requesterAccount.role === 'admin') {
          const filter = { email: user.email };
          const updateDoc = { $set: { role: 'admin' } };
          const result = await userCollection.updateOne(filter, updateDoc);
          res.json(result);
        }
      }
      else {
        res.status(403).json({ message: 'You do not have access to make admin' })
      }



    });

    // ................ Teams info api start .............. //

    // team details get data
    app.get('/teamsInfo', async (req, res) => {
      const cursor = teamsInfoCollection.find({});

      const result = await cursor.toArray();
      res.json(result);
    });

    //GET Single team details   coursesCollection
    app.get("/teamsInfo/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const blog = await teamsInfoCollection.findOne(query);
      res.json(blog);
    });

    // ................ Teams info api end .............. //



    // ................ Courses api start .............. //

    // course get data 
    app.get('/courses', async (req, res) => {
      const cursor = coursesCollection.find({});

      const result = await cursor.toArray();
      res.json(result);
    });

    //GET Single course
    app.get("/courses/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const blog = await coursesCollection.findOne(query);
      res.json(blog);
    });

    // ................ Courses api end .............. //



    // ................ Subscribes api start .............. //

    // subscribes get data 
    app.get('/subscribes', async (req, res) => {
      const cursor = subscribesCollection.find({});

      const result = await cursor.toArray();
      res.json(result);
    });

    // subscribes poist data 
    app.post('/subscribes', async (req, res) => {
      const data = req.body;
      const result = await subscribesCollection.insertOne(data);
      res.send(result);
    });

    // ................ Subscribes api end .............. //



    // ................ Payment stripe api start .............. //

    // GET For Payment 
    app.get('/booked:/id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookedCollection.findOne(query);
      res.json(result);
    })

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
    });

    // ................ Payment stripe api end .............. //   

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