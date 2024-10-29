// Middleware để xác thực token và gắn user vào req
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const router = express.Router();
router.use(cors());

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log("Auth Header:", authHeader);
  console.log("Token:", token);

  if (!token) {
    console.log("No token provided");
    return res.sendStatus(401); 
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("Token verification error:", err);
      return res.sendStatus(403);
    }

    req.accountId = decoded.accountId;
    console.log("Decoded token:", decoded);
    next();
  });
}


module.exports = authenticateToken;

