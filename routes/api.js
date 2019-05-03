const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../configuration/config");
const router = express.Router();
const Sequelize = require('sequelize');
const sequelize = new Sequelize(`mysql://sql7290405:${process.env.DB_PASSWORD}@sql7.freemysqlhosting.net:3306/sql7290405`);

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
    res.status(403).json({
      message: "message: 'Incorrect username or password"
    });
  }
});


router.post("/register", function(req, res, next) {
  sequelize
    .query('CALL `Dodaj_Klienta`(:imie, :nazwisko, :dataUrodzenia, :pesel)', 
          {replacements: { imie: req.body.name, nazwisko: req.body.surname, dataUrodzenia: req.body.dateOfBirth, pesel: req.body.pesel, }})
    .then(v => res.json({
      message: 'success'
    }))
    .catch(e => {
      console.log(e)
      res.status(400).json({
        message: e.original.sqlMessage
      })
    })
});



//export this router to use in our index.js
module.exports = router;
