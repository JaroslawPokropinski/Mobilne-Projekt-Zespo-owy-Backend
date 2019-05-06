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
 *             name:
 *               type: string
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
  const { car } = require("../mocks")
  res.json([ car ]);
});

/**
 * @swagger
 * /sec/rent:
 *    post:
 *      description: Rent car
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
 *      description: Return car
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

/**
 * @swagger
 * /sec/history:
 *    get:
 *      description: Get all past end present rentals of current user
 *      responses:
 *       200:
 *         description: Rental history
 *         schema:
 *           type: array
 *           items:
 *            type: object
 *            properties:
 *              date:
 *                type: string
 *              name:
 *                type: string
 *              year:
 *                type: string
 *              dmc:
 *                type: integer
 *              seats:
 *                type: integer
 *              mileage:
 *                type: integer
 *              category:
 *                type: string
 *              image:
 *                type: string
 */
router.get("/history", function (req, res) {
  res.send('Return succeded')
});

module.exports = router;
