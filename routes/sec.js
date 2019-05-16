const { Router } = require('express');
const sequelize = require('../configuration/databaseConfig');

const router = Router();

router.get('/', (req, res) => {
    res.send('GET route on sec.');
});
/**
 * @swagger
 * /sec/loans:
 *    post:
 *      description: List loans of user
 */
router.get('/loans', (req, res) => {
    res.send('GET route on sec.');
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
 *             owner:
 *               type: string
 *             price:
 *               type: float
 *             security:
 *               type: float
 */
router.get('/cars', (req, res) => {
    sequelize.query('SELECT * FROM "pojazd_mechaniczny"').then(([results]) => {
        const cars = results.map(currentValue => {
            return {
                id: currentValue.id_pojazdu,
                name: currentValue.nazwa,
                year: currentValue.rocznik,
                dmc: currentValue.dmc,
                seats: currentValue.liczba_siedzen,
                mileage: currentValue.przebieg,
                category: currentValue.kategoria,
                image: `api/image/${currentValue.id_pojazdu}`,
                owner: currentValue.login,
                price: currentValue.cena,
                security: currentValue.kaucja
            };
        });
        res.json(cars);
    });
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
const rentalsQuery = `INSERT INTO wypozyczenia("ID_Klienta", "ID_Pojazdu", "data_Wypozyczenia", "oplacenie_Kaucji", "zwrocenie_Pojazdu")
VALUES(:clientId, :carId, :date, true ,false);`;

router.post('/rent', (req, res) => {
    sequelize.query(rentalsQuery, {
        replacements: {
            clientId: req.decoded.id,
            carId: req.body.carId,
            date: '2019-05-12'
        }
    });
    res.send('Rent succeded');
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
router.post('/return', (req, res) => {
    res.send('Return succeded');
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
 *                type: integer
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
router.get('/history', (req, res) => {
    sequelize
        .query('SELECT * FROM "wypozyczenia" WHERE "ID_Klienta"=:clientId', {
            replacements: { clientId: req.decoded.id }
        });
});

/**
 * @swagger
 * /sec/return:
 *    post:
 *      description: Return car
 *      parameters:
 *      - in: "body"
 *        name: "Car info"
 *        required: true
 *        schema:
 *          type: "object"
 *          properties:
 *              name:
 *                type: string
 *              year:
 *                type: integer
 *              dmc:
 *                type: integer
 *              seats:
 *                type: integer
 *              mileage:
 *                type: integer
 *              image:
 *                type: string
 *              price:
 *                type: float
 *              security:
 *                type: float
 *      responses:
 *       200:
 *         description: Car added
 */
router.post('add', (req, res) => {
    sequelize
        .query(
            'CALL "dodaj_pojazd_full"(:name, :year, :dmc, :seats, true, false, :mileage, :login, :image, :price, :security)',
            {
                replacements: {
                    name: req.param.name,
                    year: req.param.year,
                    dmc: req.param.dmc,
                    seats: req.param.seats,
                    mileage: req.param.mileage,
                    login: req.param.login,
                    image: req.param.image,
                    price: req.param.price,
                    security: req.param.security
                }
            }
        )
        .then(() => {
            res.send('Return succeded');
        });
});

module.exports = router;
