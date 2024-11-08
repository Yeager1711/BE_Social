const express = require("express");
const router = express.Router();

const createReels_Router = require("./createReels");
const getALLReels_Router = require("./get_Reels_All");
const getReels_AccountId_Router = require("./get_Reels_AccountId");


router.use("/post", createReels_Router);
router.use("/get", getALLReels_Router);
router.use("/get", getReels_AccountId_Router);


module.exports = router;