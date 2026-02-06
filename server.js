

const express = require('express');
const mysql = require('mysql2');
const session = require("express-session");

const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

 
 const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "phone_shop_secret",
    resave: false,
    saveUninitialized: true
}));


//create the database connection to the database

const db = mysql.createPool({  
    host: 'localhost',
    user: 'root',       
    password: 'MyRoot123!', 
    database: 'phone_shop', 

    connectionLimit: 100,
    waitForConnections: true,
    queueLimit: 0,
    port: 3306
});


 //test the connection
 db.getConnection((err,connection)=>{
    if(err){
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database');
    connection.release();
 });



//the root fo the registration
app.post('/register', async (req, res) => {        
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sqlInsert = "INSERT INTO users (username, email, password) VALUES (?,?,?,'user') ";

        db.query(sqlInsert, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).send('Error registering user');
            }
            res.status(200).send('User registered successfully');
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// THE ROOT FOR THE LOGIN FORM
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, result) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (result.length === 0) return res.status(401).json({ message: 'User not found' });

        const user = result[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) return res.status(401).json({ message: 'Wrong password' });

        req.session.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };

         if (user.role === 'admin') {
            res.json({
                message: 'Login successful',
                redirect: 'admin.html'  
            });
        } else {
            res.json({
                message: 'Login successful',
                redirect: 'account.html'
            });
    });
});

//get all phones 

app.get('/phones', (req,res)=>{
    db.query("SELECT * FROM phones_list", (err, result)=>{
        if(err) return res.status(500).send(err);
        res.json(result);
    });
});
 
// get single phone by id

app.get('/phones/:id', (req,res)=>{
    const id = req.params.id;
    db.query("SELECT * FROM phones_list WHERE id=?", [id], (err,result)=>{
        if(err) return res.status(500).send(err);
        res.json(result[0]);
    });
});

// add phone

app.post('/phones', (req,res)=>{
    const {name, price, description} = req.body;
    db.query("INSERT INTO phones_list (name, price, description) VALUES (?,?,?)", 
        [name, price, description], (err,result)=>{
            if(err) return res.status(500).send(err);
            res.json({message:"Phone added"});
        });
});


//update phone

app.put('/phones/:id', (req,res)=>{
    const id = req.params.id;
    const {name, price, description} = req.body;
    db.query("UPDATE phones_list SET name=?, price=?, description=? WHERE id=?", 
        [name, price, description, id], (err,result)=>{
            if(err) return res.status(500).send(err);
            res.json({message:"Phone updated"});
        });
});

//delete phone

app.delete('/phones/:id', (req,res)=>{
    const id = req.params.id;
    db.query("DELETE FROM phones_list WHERE id=?", [id], (err,result)=>{
        if(err) return res.status(500).send(err);
        res.json({message:"Phone deleted"});
    });
});



const port = 3000;

app.listen(port,()=>{
    console.log('Now server is running at port ' + port);
});