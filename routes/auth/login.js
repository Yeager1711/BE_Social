const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../../db_connect/db");

const router = express.Router();

const queryPromise = (sql, values) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required!" });
    }

    const getUserQuery = "SELECT * FROM accounts WHERE username = ? LIMIT 1";
    const user = await queryPromise(getUserQuery, [username]);

    if (user.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Token payload and generation
    const tokenPayload = {
      username,
      userId: user[0].userId,
      accountId: user[0].accountId,
      roleId: user[0].roleId,
      first_name: user[0].first_name,
      last_name: user[0].last_name,
      // email: user[0].email,
    };

    const tokenAuth = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    return res.status(200).json({ success: true, tokenAuth, roleId: user[0].roleId });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
