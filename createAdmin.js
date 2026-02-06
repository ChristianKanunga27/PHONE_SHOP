
const bcrypt = require('bcrypt');
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'MyRoot123!',
    database: 'phone_shop'
});

async function createAdmin(){

    const username = "christian";
    const email = "kanungachiristian@gmail.com";
    const password = "kanunga2727";

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
    INSERT INTO users (username, email, password, role)
    VALUES (?, ?, ?, 'admin')
    `;

    db.query(sql,[username,email,hashedPassword],(err)=>{
        if(err) throw err;
        console.log("Admin created successfully");
        process.exit();
    });
}

createAdmin();
