const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "social_app",
});

db.connect((err) => {
  if (err) {
    console.error("Failed to connect to MySQL", err);
  } else {
    console.log("Connected to MySQL API");
  }
});

module.exports = db;


