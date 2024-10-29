const express = require("express");
const router = express.Router();

const loginRouter = require("./login");
const registerRouter = require("./register");

router.use("/l-account", loginRouter);
router.use("/r-acount", registerRouter);

router.get("/", (req, res) => {
  res.send("Welcome to the API");
});

module.exports = router;
