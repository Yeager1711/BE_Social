const express = require("express");
const db = require("../../db_connect/db");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const router = express.Router();
router.use(cors());

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized: Token is missing" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    req.accounts = decoded; // Set the decoded token information to req.accounts
    next();
  });
};

router.get("/getUsername", verifyToken, (req, res) => {
  const username = req.accounts.username;

  if (!username) {
    return res.status(400).json({ error: "username is required !" });
  }

  const getUsernameQuery = "SELECT * FROM accounts WHERE username = ? LIMIT 1"; 

  db.query(getUsernameQuery, [username], (err, result) => {
    if (err) {
      console.error("Failed to fetch user:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password, roleId,  ...userWithoutPassword } = result[0];

    // console.log("User fetched successfully");
    return res.status(200).json(userWithoutPassword);
  });
});

module.exports = router;
