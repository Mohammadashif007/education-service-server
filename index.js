const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;

// ! middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.u69fsfj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const courseCollections = client
            .db("educationDB")
            .collection("course_collections");
        const bookingCollections = client
            .db("educationDB")
            .collection("booking_collections");
        const reviewCollections = client
            .db("educationDB")
            .collection("review_collections");
        const teacherCollections = client
            .db("educationDB")
            .collection("teacher_collections");

        // ! service related api
        app.get("/services", async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = { instructor_email: req.query.email };
            }

            const result = await courseCollections.find(query).toArray();
            res.send(result);
        });

        //! single service by id
        app.get("/services/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await courseCollections.findOne(query);
            res.send(result);
        });

        // ! post service route
        app.post("/services", async (req, res) => {
            const item = req.body;
            const result = await courseCollections.insertOne(item);
            res.send(result);
        });

        // ! update service info
        app.put("/services/:id", async (req, res) => {
            const id = req.params.id;
            const item = req.body;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: item.name,
                    service_area: item.service_area,
                    price: item.price,
                    image: item.image,
                    description: item.description,
                },
            };

            const result = await courseCollections.updateOne(
                query,
                updateDoc,
                options
            );
            res.send(result);
        });

        // ! delete service
        app.delete("/services/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await courseCollections.deleteOne(query);
            res.send(result);
        });

        // ! booking related api

        app.post("/bookings", async (req, res) => {
            const booking = req.body;
            const result = await bookingCollections.insertOne(booking);
            res.send(result);
        });
        app.get("/bookings", async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = {
                    user_email: req.query.email,
                };
            }
            const result = await bookingCollections.find(query).toArray();
            res.send(result);
        });

        app.patch("/bookings/:id", async(req, res) => {
          const id = req.params.id;
          const query = {_id: new ObjectId(id)};
          const updatedBooking = req.body;
          console.log(updatedBooking);
          const updateDoc = {
            $set: {
              status : updatedBooking.status
            },
          };
          const result = await bookingCollections.updateOne(query, updateDoc);
          res.send(result)
        })


        //! Review collections
        app.get("/reviews", async (req, res) => {
            const result = await reviewCollections.find().toArray();
            res.send(result);
        });

        //! teacher collections
        app.get("/teachers", async (req, res) => {
            const result = await teacherCollections.find().toArray();
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("server is open");
});

app.listen(port, () => {
    console.log("server is running");
});
