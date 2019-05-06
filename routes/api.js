const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../configuration/config");
const router = express.Router();
const Sequelize = require("sequelize");
// const sequelize = new Sequelize(`mysql://root:root@localhost:3306/wypozyczalnia_bcdzmiana`);
const sequelize = (process.env.DB_URL) ? new Sequelize(`mysql://sql7290405:${process.env.DB_PASSWORD}@${process.env.DB_URL}:3306/sql7290405`)
  : new Sequelize(`mysql://root:root@localhost:3306/wypozyczalnia_bcdzmiana`);
const passwordEnc = require("../authentication/passwordEncryptor");


/**
 * @swagger
 * /api:
 *    get:
 *      description: nil
 */
router.get("/", function (req, res) {
  res.send("GET route on things.");
});

/**
 * @swagger
 * /api/login:
 *    post:
 *      description: Login
 *      parameters:
 *      - in: "body"
 *        name: "User credencials"
 *        required: true
 *        schema:
 *          type: "object"
 *          properties:
 *            username:
 *              type: "string"
 *            password:
 *              type: "string"
 *      responses:
 *       200:
 *         description: Login succeded
 *       403:
 *          description: "Incorrect credentials"
 */
router.post("/login", function (req, res, next) {
  if (req.body.username === "admin" && req.body.password === "admin") {
    res.json({
      message: jwt.sign({ username: req.body.username }, config.secret, {
        expiresIn: "24h" // expires in 24 hours
      })
    });
  } else {
    sequelize
      .query("SELECT `zwracanie_hasla`(:login)", { replacements: { login: req.body.login } })
      .then(([results, metadata]) => {
        if (results.length < 1) {
          res.status(403).json({
            message: "Incorrect username or password"
          });
        }
        const hashPass = Object.values(results[0])[0]
        passwordEnc.comparePassword(req.body.password, hashPass, (err, isMatch) => {
          if (err) {
            res.status(500).json({
              message: "Failed to compare passwords"
            });
            return;
          }
          if (isMatch) {
            res.json({
              message: jwt.sign({ username: req.body.username }, config.secret, {
                expiresIn: "24h" // expires in 24 hours
              })
            });
            return;
          }
          res.status(403).json({
            message: "Incorrect username or password"
          });
        })
      })
    return
  }
});

/**
 * @swagger
 * /api/register:
 *    post:
 *      description: Register
 *    parameters:
 *    - in: "body"
 *      name: "User information"
 *      required: true
 *      schema:
 *        type: "object"
 *        properties:
 *          name:
 *            type: "string"
 *          surname:
 *            type: "string"
 *          dateOfBirth:
 *            type: "string"
 *          pesel:
 *            type: "string"
 *          login:
 *            type: "string"
 *          password:
 *            type: "string"
 */
router.post("/register", function (req, res, next) {
  passwordEnc.cryptPassword(req.body.password, (err, hash) => {
    if (err) {
      console.error(err);
      pass = null;
      res.status(400).json({
        message: 'Failed to encrypt password'
      });
      return;
    }
    const pass = hash
    sequelize
      .query(
        "CALL `Dodaj_Klienta`(:imie, :nazwisko, :dataUrodzenia, :pesel, :login, :haslo)",
        {
          replacements: {
            imie: req.body.name,
            nazwisko: req.body.surname,
            dataUrodzenia: req.body.dateOfBirth,
            pesel: req.body.pesel,
            login: req.body.login,
            haslo: `${pass}`
          }
        }
      )
      .then(v =>
        res.json({
          message: "success"
        })
      )
      .catch(e => {
        console.log(e);
        res.status(400).json({
          message: e.original.sqlMessage
        });
      });
  });
});

//export this router to use in our index.js
module.exports = router;