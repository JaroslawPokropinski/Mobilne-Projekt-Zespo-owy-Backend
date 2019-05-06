const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize");
const sequelize = (process.env.DB_URL) ? new Sequelize(`mysql://sql7290405:${process.env.DB_PASSWORD}@${process.env.DB_URL}:3306/sql7290405`)
  : new Sequelize(`mysql://root:root@localhost:3306/wypozyczalnia_bcdzmiana`);

router.get("/", function (req, res) {
  res.send("GET route on sec.");
});
/**
 * @swagger
 * /sec/loans:
 *    post:
 *      description: List loans of user
 */
router.get("/loans", function (req, res) {
  res.send("GET route on sec.");
});
/**
 * @swagger
 * /sec/cars:
 *    get:
 *      description: List all cars avaliable
 *      responses:
 *       200:
 *         description: Login succeded
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             year:
 *               type: string
 *             dmc:
 *               type: integer
 *             seats:
 *               type: integer
 *             mileage:
 *               type: integer
 *             category:
 *               type: string
 *             image:
 *               type: string
 */
router.get("/cars", function (req, res) {
  res.json([
    { id: 0,
      year: '2009',
      dmc: 3499,
      seats: 4,
      mileage: 300000,
      category: 'B',
      image: 'data:image/jpeg;base64,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' }
  ]);
});

/**
 * @swagger
 * /sec/rent:
 *    post:
 *      description: Login
 *      parameters:
 *      - in: "body"
 *        name: "Rental info"
 *        required: true
 *        schema:
 *          type: "object"
 *          properties:
 *            carId:
 *              type: integer
 *      responses:
 *       200:
 *         description: Rent succeded
 */
router.post("/rent", function (req, res) {
  res.send('Rent succeded')
});

/**
 * @swagger
 * /sec/return:
 *    post:
 *      description: Login
 *      parameters:
 *      - in: "body"
 *        name: "Rental info"
 *        required: true
 *        schema:
 *          type: "object"
 *          properties:
 *            carId:
 *              type: integer
 *      responses:
 *       200:
 *         description: Return succeded
 */
router.post("/return", function (req, res) {
  res.send('Return succeded')
});

module.exports = router;
