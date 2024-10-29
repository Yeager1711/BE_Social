const express = require("express");
const router = express.Router();

const getUsername = require("./getUsername");
const editProfile = require("./edit");

router.use("/auth", getUsername);
router.use("/auth/editProfile", editProfile);

router.get("/", (req, res) => {
  res.send("Welcome to the API");
});

module.exports = router;
