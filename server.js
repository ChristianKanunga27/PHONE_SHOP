

const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
require('dotenv').config();

 
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//create the vdatabase connection to the database

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
    const { username,email,password} = req.body;

    const sqlInsert = "INSERT INTO phones (username,email,password) VALUES (?,?,?)";
    db.query(sqlInsert, [username,email,password], (err, result) => {
        if (err) {
            console.error('Error inserting data into the database:', err);
            res.status(500).send('Error registering user');
        } else {
            res.status(200).send('User registered successfully');
        }
    }); 
});

const port = 3000;

app.listen(port,()=>{
    console.log('Now server is running at port ' + port);
});