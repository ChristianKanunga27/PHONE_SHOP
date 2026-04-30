require('dotenv').config();

const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

// Import MongoDB connection
const connectDB = require('./config/db');

// Import Models
const User = require('./models/User');
const Phone = require('./models/Phone');
const Order = require('./models/Order');

const app = express();

// Connect to MongoDB Atlas
connectDB();

app.use(cors());
// explicit OPTIONS routes for CORS preflight on API endpoints
app.options('/register', cors());
app.options('/login', cors());
app.options('/phones', cors());
app.options('/phones/:id', cors());
app.options('/buy-phone', cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend files
// allow the server to read the front_end files
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || "phone_shop_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));

//multer setup for file uploads

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });
app.use('/uploads', express.static('uploads'));

// Serve .html on root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});


//register root route

app.post('/register', async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email is already registered" });
        }

        const newUser = new User({
            username,
            email,
            password,
            role: 'user',
            phone: phone || null
        });

        await newUser.save();

        res.status(201).json({
            message: "User registered successfully",
            user: { username, email, phone: phone || '', role: 'user' }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Registration failed" });
    }
});

//login root route

app.post('/login', async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user)
            return res.status(401).json({ message: "User not found" });

        const isMatch = await user.comparePassword(password);

        if (!isMatch)
            return res.status(401).json({ message: "Wrong password" });

        req.session.user = user;

        const redirectPage = user.role === "admin" ? "admin.html" : "account.html";

        res.json({
            message: "Login successful",
            redirect: redirectPage,
            user: {
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Login failed" });
    }

});

//get all phones

app.get('/phones', async (req, res) => {

    try {

        const phones = await Phone.find().sort({ createdAt: -1 });
        res.json(phones);

    } catch (err) {
        res.status(500).send(err);
    }

});

//get single phone

app.get('/phones/:id', async (req, res) => {

    try {

        const phone = await Phone.findById(req.params.id);

        if (!phone) {
            return res.status(404).json({ message: "Phone not found" });
        }

        res.json(phone);

    } catch (err) {
        res.status(500).send(err);
    }

});

//add phone

app.post('/phones', upload.single('image'), async (req, res) => {

    try {

        const { name, brand, price, description } = req.body;

        const image = req.file
            ? '/uploads/' + req.file.filename
            : null;

        const newPhone = new Phone({
            name,
            brand: brand || null,
            price,
            description: description || null,
            image
        });

        
        await newPhone.save();

        res.json({ message: "Phone added successfully" });

    } catch (err) {
        res.status(500).send(err);
    }

});

//update phone

app.put('/phones/:id', upload.single('image'), async (req, res) => {

    try {

        const { name, brand, price, description } = req.body;
        const id = req.params.id;

        const updateData = {
            name,
            brand: brand || null,
            price,
            description: description || null
        };

        if (req.file) {
            updateData.image = '/uploads/' + req.file.filename;
        }

        const phone = await Phone.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!phone) {
            return res.status(404).json({ message: "Phone not found" });
        }

        res.json({ message: "Phone updated successfully" });

    } catch (err) {
        res.status(500).send(err);
    }

});

//delete phone

app.delete('/phones/:id', async (req, res) => {

    try {

        const phone = await Phone.findByIdAndDelete(req.params.id);

        if (!phone) {
            return res.status(404).json({ message: "Phone not found" });
        }

        res.json({ message: "Phone deleted successfully" });

    } catch (err) {
        res.status(500).send(err);
    }

});

//logout

app.get('/logout', (req, res) => {

    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ redirect: "home.html" });
    });

});

///buy phone

app.post('/buy-phone', async (req, res) => {

    try {

        const { customer_name, phone_number, phone_id, phone_name, price } = req.body;

        const newOrder = new Order({
            customer_name,
            phone_number,
            phone_id,
            phone_name,
            price
        });

        await newOrder.save();

        res.json({ message: "Order placed successfully" });

    } catch (err) {
        res.status(500).json({ message: "Failed to save order" });
    }

});

//get orders for admin

app.get('/orders', async (req, res) => {

    try {

        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);

    } catch (err) {
        res.status(500).json({ message: "Error loading orders" });
    }

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
