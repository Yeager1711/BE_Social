const express = require("express");
const cors = require("cors");
const dotenv = require('dotenv');
const db = require('./db_connect/db'); 

// API connect routes
const authenRoutes = require("./routes/auth/auth"); 
const accountRoutes = require("./routes/account/account"); 
const postRoutes = require("./routes/post/post"); 
const commentsRoutes = require("./routes/comment/comments"); 
const LikesRoutes = require("./routes/Likes/like"); 
const SavedRoutes = require("./routes/Saved/saved"); 
const ReelsRoutes = require("./routes/Reels/Reel"); 

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: true, limit: "500mb" }));
app.use(express.json({ limit: "500mb" }));
app.use(cors());

// // Sử dụng các router
app.use("/api/auth", authenRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/likes", LikesRoutes);
app.use("/api/saved", SavedRoutes);
app.use("/api/reels", ReelsRoutes);

// Kiểm tra kết nối cơ sở dữ liệu
db.connect((err) => {
  if (err) {
    console.error("Failed to connect to MySQL", err);
  } else {
    console.log("Connected to MySQL");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
