const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../configuration/config");
const router = express.Router();

router.get("/", function(req, res) {
  res.send("GET route on things.");
});

router.post("/login", function(req, res, next) {
  if (req.body.username === "admin" && req.body.password === "admin") {
    res.json({
      message: jwt.sign({ username: req.body.username }, config.secret, {
        expiresIn: "24h" // expires in 24 hours
      })
    });
  } else {
    res.send(403).json({
      message: "message: 'Incorrect username or password"
    });
  }
});

//export this router to use in our index.js
module.exports = router;
