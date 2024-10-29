const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../../db_connect/db");
const nodemailer = require("nodemailer");

const router = express.Router();

// Function to generate a random ID
function generateRandomId() {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 10;
  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

// Helper function to execute a SQL query with promises
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

// Function to ensure roles exist in the 'role' table
async function ensureRolesExist() {
  const roles = ["Admin_social", "Clients_social"];
  for (const role of roles) {
    const checkRoleQuery = "SELECT * FROM role WHERE roleId = ?";
    const roleExists = await queryPromise(checkRoleQuery, [role]);

    // Insert role if it does not exist
    if (roleExists.length === 0) {
      const insertRoleQuery = "INSERT INTO role (roleId, roleName) VALUES (?, ?)";
      await queryPromise(insertRoleQuery, [role, role === "Admin_social" ? "Admin" : "Client"]);
    }
  }
}

// Registration route
router.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, username, email, password } = req.body;

    // Ensure necessary roles exist
    await ensureRolesExist();

    const checkEmailQuery = "SELECT * FROM accounts WHERE email = ? LIMIT 1";
    const checkUsernameQuery = "SELECT * FROM accounts WHERE username = ? LIMIT 1"
    const userQueryCount = "SELECT COUNT(*) as userCount FROM accounts";

    // Check if email already exists
    const resultEmail = await queryPromise(checkEmailQuery, [email]);
    const resultUsername = await queryPromise(checkUsernameQuery, [username]);

    if (resultEmail.length > 0) {
      console.log("Email already exists");
      return res.status(500).json({ error: "Email already exists" });
    }

    if(resultUsername.length > 0) {
      console.log("Username already exists");
      return res.status(500).json({ error: "Username already exists" });
    }

    // Determine the role based on user count
    const userCountResult = await queryPromise(userQueryCount, []);
    const userCount = userCountResult[0].userCount;
    const roleId = userCount === 0 ? "Admin_social" : "Clients_social";

    // Hash the password and generate account ID
    const hashedPassword = await bcrypt.hash(password, 10);
    const accountId = generateRandomId();

    // Insert new user into the accounts table
    const insertUserQuery = `INSERT INTO accounts (accountId, first_name, last_name, email, username, password, roleId, created_at, private_status) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 0)`;
    const insertUserValues = [
      accountId,
      firstname,
      lastname,
      email,
      username,
      hashedPassword,
      roleId,
    ];
    await queryPromise(insertUserQuery, insertUserValues);

    // Send a registration confirmation email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "namhp1711@gmail.com",
        pass: "msyq cxub crzx lwyx",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      to: email,
      subject: "Registration Successful",
      text: `- Account registration successful! Welcome to the community!\n
              Details:\n
              - Full Name: ${firstname} ${lastname}\n
              - Email: ${email}\n
              - Username: ${username}`,
    };

    await transporter.sendMail(mailOptions);

    console.log("User registered successfully");
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in registration:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
