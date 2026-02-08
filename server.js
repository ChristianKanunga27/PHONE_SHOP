


require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();


//middleware

 // Serve frontend files
 
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

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

//database connection pool

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10
}).promise();

console.log("Database Pool Ready &  DATABASE CONNECTION SUCCESSFUL");

// Serve home.html on root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});


//register root route

app.post('/register', async (req, res) => {

    try {

        const { username, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            "INSERT INTO users (username,email,password,role) VALUES (?,?,?,'user')",
            [username, email, hashedPassword]
        );

        res.json({ message: "User registered successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Registration failed" });
    }

});

//login root route

app.post('/login', async (req, res) => {

    try {

        const { email, password } = req.body;

        const [rows] = await db.query(
            "SELECT * FROM users WHERE email=?",
            [email]
        );

        if (rows.length === 0)
            return res.status(401).json({ message: "User not found" });

        const user = rows[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match)
            return res.status(401).json({ message: "Wrong password" });

        req.session.user = user;

        if (user.role === "admin") {
            res.json({ redirect: "admin.html" });
        } else {
            res.json({ redirect: "account.html" });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Login failed" });
    }

});

//get all phones

app.get('/phones', async (req, res) => {

    try {

        const [phones] = await db.query("SELECT * FROM phones_list");
        res.json(phones);

    } catch (err) {
        res.status(500).send(err);
    }

});

//get single phone

app.get('/phones/:id', async (req, res) => {

    try {

        const [result] = await db.query(
            "SELECT * FROM phones_list WHERE id=?",
            [req.params.id]
        );

        res.json(result[0]);

    } catch (err) {
        res.status(500).send(err);
    }

});

//add phone

app.post('/phones', upload.single('image'), async (req, res) => {

    try {

        const { name, price, description } = req.body;

        const image = req.file
            ? '/uploads/' + req.file.filename
            : null;

        await db.query(
            "INSERT INTO phones_list (name,price,description,image) VALUES (?,?,?,?)",
            [name, price, description, image]
        );

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

        if (req.file) {

            await db.query(`
                UPDATE phones_list
                SET name=?, brand=?, price=?, description=?, image=?
                WHERE id=?
            `, [name, brand, price, description, '/uploads/' + req.file.filename, id]);

        } else {

            await db.query(`
                UPDATE phones_list
                SET name=?, brand=?, price=?, description=?
                WHERE id=?
            `, [name, brand, price, description, id]);
        }

        res.json({ message: "Phone updated successfully" });

    } catch (err) {
        res.status(500).send(err);
    }

});

//delete phone

app.delete('/phones/:id', async (req, res) => {

    try {

        await db.query("DELETE FROM phones_list WHERE id=?", [req.params.id]);
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

        await db.query(`
            INSERT INTO orders (customer_name, phone_number, phone_id, phone_name, price)
            VALUES (?, ?, ?, ?, ?)
        `, [customer_name, phone_number, phone_id, phone_name, price]);

        res.json({ message: "Order placed successfully" });

    } catch (err) {
        res.status(500).json({ message: "Failed to save order" });
    }

});

//get orders for admin

app.get('/orders', async (req, res) => {

    try {

        const [orders] = await db.query("SELECT * FROM orders ORDER BY id DESC");
        res.json(orders);

    } catch (err) {
        res.status(500).json({ message: "Error loading orders" });
    }

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
