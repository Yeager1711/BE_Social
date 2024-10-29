const express = require("express");
const db = require("../../db_connect/db");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

// Get post articles by username account
router.get("/getPost", authenticateToken, async (req, res) => {
  const accountId = req.accountId;
  console.log("accountId: ", accountId);

  if (!accountId) {
    return res.status(400).json({ error: "accountId is required" });
  }

  try {
    const queryPosts = `
      SELECT 
        p.postId, p.accountId, p.content, p.created_at, p.updated_at, p.location,
        tn.media, 
        ac.username, ac.nickname, ac.email, ac.first_name, ac.last_name, 
        ac.birthday, ac.gender, ac.bio, ac.created_at AS account_created_at,
        ac.updated_at AS account_updated_at, ac.private_status,  
        ac.link_facebook, ac.link_instagram, ac.avatar, 
        r.name AS role_name
      FROM posts p
      LEFT JOIN thumnail tn ON p.postId = tn.postId
      LEFT JOIN accounts ac ON p.accountId = ac.accountId
      LEFT JOIN role r ON ac.roleId = r.roleId
      WHERE p.accountId = ?
    `;

    db.query(queryPosts, [accountId], (err, result) => {
      if (err) {
        console.error("Failed to fetch post articles:", err);
        return res.status(500).json({ error: "Failed to fetch post articles" });
      }

      const postArticleMap = {};

      result.forEach(row => {
        if (!postArticleMap[row.postId]) {
          postArticleMap[row.postId] = {
            postArticle: {
              postId: row.postId,
              accountId: row.accountId,
              content: row.content,
              created_at: row.created_at,
              updated_at: row.updated_at,
              location: row.location,
            },
            account: {
              username: row.username,
              nickname: row.nickname,
              email: row.email,
              firstName: row.first_name,
              lastName: row.last_name,
              birthday: row.birthday,
              gender: row.gender,
              bio: row.bio,
              createdAt: row.account_created_at,
              updatedAt: row.account_updated_at,
              privateStatus: row.private_status,
              linkFacebook: row.link_facebook,
              linkInstagram: row.link_instagram,
              avatar: row.avatar,
              role: row.role_name,
            },
            thumbnails: [],
          };
        }

        if (row.media) {
          postArticleMap[row.postId].thumbnails.push(row.media);
        }
      });

      const postArticles = Object.values(postArticleMap);
      res.json(postArticles);
    });
  } catch (error) {
    console.error("Error fetching post article details by username with accountID:", error);
    res.status(500).json({ error: "Failed to fetch post article details by username with accountID" });
  }
});


module.exports = router;
