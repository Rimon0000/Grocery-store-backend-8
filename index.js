const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db('Grocery-Store');
        const collection = db.collection('users');
        const flashSalesCollection = db.collection('flashSales');
        const categoriesCollection = db.collection('categories');
        const productsCollection = db.collection('products');

        

        // User Registration
        app.post('/api/v1/register', async (req, res) => {
            const { name, email, password } = req.body;

            // Check if email already exists
            const existingUser = await collection.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists'
                });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user into the database
            await collection.insertOne({ name, email, password: hashedPassword });

            res.status(201).json({
                success: true,
                message: 'User registered successfully'
            });
        });

        // User Login
        app.post('/api/v1/login', async (req, res) => {
            const { email, password } = req.body;

            // Find user by email
            const user = await collection.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Compare hashed password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Generate JWT token
            const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.EXPIRES_IN });

            res.json({
                success: true,
                message: 'Login successful',
                token
            });
        });


        // ==============================================================
        // WRITE YOUR CODE HERE
        //create flash sale
        app.post("/flash-sale", async(req, res) =>{
            const newFlashSale = req.body;
            const result = await flashSalesCollection.insertOne(newFlashSale)
            res.status(201).json({
                success: true,
                message: 'New Flash sale Added successfully!',
                data: result
            });
        })

        //get all flash sale
        app.get("/flash-sale", async(req, res) =>{
            const result = await flashSalesCollection.find().toArray()
            res.status(201).json({
                success: true,
                message: 'Flash sale are retrieved successfully!',
                data: result
            });
        })

        //create Category
        app.post("/category", async(req, res) =>{
            const newCategory = req.body;
            const result = await categoriesCollection.insertOne(newCategory)
            res.status(201).json({
                success: true,
                message: 'New Category Added successfully!',
                data: result
            });
        })

        //get all flash sale
        app.get("/categories", async(req, res) =>{
            const result = await categoriesCollection.find().toArray()
            res.status(201).json({
                success: true,
                message: 'Category are retrieved successfully!',
                data: result
            });
        })

        //create product
        app.post("/product", async(req, res) =>{
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct)
            res.status(201).json({
                success: true,
                message: 'New Product Added successfully!',
                data: result
            });
        })

        //get all products for popular products
        app.get("/products", async(req, res) =>{
            const result = await productsCollection.find().sort({ ratings: -1 }).toArray();
            res.status(201).json({
                success: true,
                message: 'Products are retrieved successfully!',
                data: result
            });
        })
          
          

        //get all products
        app.get("/fish", async(req, res) =>{
            const result = await productsCollection.find().toArray();
            res.status(201).json({
                success: true,
                message: 'Products are retrieved successfully!',
                data: result
            });
        })

        // //filter by category
        app.get('/fish/:category', async (req, res) => {
              const category = req.params.category;
              let query = {};
            
              if (category) {
                query = { category: new RegExp(`^${category}$`, 'i') }; // Case-insensitive match
              }
            
              const result = await productsCollection.find(query).toArray();
              res.status(200).json({
                success: true,
                message: 'Products are retrieved successfully!',
                data: result
              });
          });

        //get single product
        app.get("/single-fish/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.status(201).json({
                success: true,
                message: 'Product is retrieved successfully!',
                data: result
            });
        });

        
            

        // ==============================================================


        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });

    } finally {
    }
}

run().catch(console.dir);

// Test route
app.get('/', (req, res) => {
    const serverStatus = {
        message: 'Server is running smoothly',
        timestamp: new Date()
    };
    res.json(serverStatus);
});