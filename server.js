

const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

//middleware

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(session({
    secret: "phone_shop_secret",
    resave: false,
    saveUninitialized: false
}));


const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

app.use('/uploads', express.static('uploads'));

//create the database connection

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'MyRoot123!',
    database: 'phone_shop',
    connectionLimit: 10
});
//test the connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database error:', err);
        return;
    }
    console.log('MySQL Connected');
    connection.release();
});

//root for registration

app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (username, email, password, role)
            VALUES (?, ?, ?, 'user')
        `;

        db.query(sql, [username, email, hashedPassword], (err) => {
            if (err) return res.status(500).json({ message: 'Registration failed' });

            res.json({ message: 'User registered successfully' });
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

//route for login

app.post('/login', (req, res) => {

    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';

    db.query(sql, [email], async (err, result) => {

        if (err) return res.status(500).json({ message: 'Server error' });

        if (result.length === 0)
            return res.status(401).json({ message: 'User not found' });

        const user = result[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match)
            return res.status(401).json({ message: 'Wrong password' });

        req.session.user = user;

        // Role Redirect 
        if (user.role === 'admin') {
            res.json({ redirect: 'admin.html' });
        } else {
            res.json({ redirect: 'account.html' });
        }

    });
});

     //get all phones 

app.get('/phones', (req, res) => {

    db.query("SELECT * FROM phones_list", (err, result) => {
        if (err) return res.status(500).send(err);

        res.json(result);
    });

});
 
app.get('/phones/:id', (req, res) => {

app.get('/phones/:id', (req,res)=>{
    const id = req.params.id;

    db.query(
        "SELECT * FROM phones_list WHERE id=?",
        [id],
        (err, result) => {
            if (err) return res.status(500).send(err);

            res.json(result[0]);
        }
    );
});

});

 

app.post('/phones', upload.single('image'), (req,res)=>{
    const {name, price, description} = req.body;

    const image = req.file
        ? '/uploads/' + req.file.filename
        : null;

    const sql = "INSERT INTO phones_list (name, price, description, image) VALUES (?,?,?,?)";

    db.query(sql,[name,price,description,image],(err)=>{
        if(err) return res.status(500).send(err);

        res.send("Phone added successfully");
    });
});

 

app.put('/phones/:id', upload.single('image'), (req, res) => {


    
    const id = req.params.id;
    const { name, brand, price, description } = req.body;

    const image = req.file 
        ? '/uploads/' + req.file.filename 
        : null;

    let sql;
    let values;

    if (image) {

        sql = `
            UPDATE phones_list 
            SET name=?, brand=?, price=?, description=?, image=? 
            WHERE id=?
        `;

        values = [name, brand, price, description, image, id];

    } else {

        sql = `
            UPDATE phones_list 
            SET name=?, brand=?, price=?, description=? 
            WHERE id=?
        `;

        values = [name, brand, price, description, id];
    }

    db.query(sql, values, (err) => {

        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }

        res.json({ message: 'Phone updated successfully' });

    });

});




app.delete('/phones/:id', (req, res) => {

    const id = req.params.id;

    db.query("DELETE FROM phones_list WHERE id=?", [id], (err) => {

        if (err) return res.status(500).send(err);

        res.json({ message: 'Phone deleted successfully' });

    });

});

app.get('/logout', (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.status(500).send("Logout failed");
        }

        res.clearCookie('connect.sid');  
        res.json({ redirect: "home.html" });

    });
});

//route for orders

app.post('/buy-phone', (req, res) => {

    const { customer_name, phone_number, phone_id, phone_name, price } = req.body;

    const sql = `
    INSERT INTO orders (customer_name, phone_number, phone_id, phone_name, price)
    VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [customer_name, phone_number, phone_id, phone_name, price], (err) => {
        if (err) {
            return res.status(500).json({ message: "Failed to save order" });
        }

        res.json({ message: "Order placed successfully" });
    });
});

app.get('/orders', (req,res)=>{

    const sql = "SELECT * FROM orders ORDER BY id DESC";

    db.query(sql,(err,result)=>{
        if(err){
            return res.status(500).json({message:"Error loading orders"});
        }

        res.json(result);
    });
});




const port = 3000;

app.listen(port, () => {

    console.log(`Server now is running on port ${port}`);
});
