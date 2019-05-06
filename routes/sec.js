const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize");
const sequelize = (process.env.DB_URL) ? new Sequelize(`mysql://sql7290405:${process.env.DB_PASSWORD}@${process.env.DB_URL}:3306/sql7290405`)
  : new Sequelize(`mysql://root:root@localhost:3306/wypozyczalnia_bcdzmiana`);

router.get("/", function(req, res) {
  res.send("GET route on sec.");
});

router.get("/loans", function (req, res) {

  res.send("GET route on sec.");
});

module.exports = router;
