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
const rentalsQuery = `INSERT INTO wypozyczenia("id_klienta", "id_pojazdu", "data_wypozyczenia", "oplacenie_kaucji", "zwrocenie_pojazdu")
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
const historyQuery = `SELECT klient.login,
wypozyczenia.data_wypozyczenia,
pojazd_mechaniczny.id_pojazdu,
pojazd_mechaniczny.login AS wlasciciel,
pojazd_mechaniczny.nazwa,
pojazd_mechaniczny.rocznik,
pojazd_mechaniczny.dmc,
pojazd_mechaniczny.liczba_siedzen,
pojazd_mechaniczny.sprawnosc,
pojazd_mechaniczny.stan_wypozyczenia,
pojazd_mechaniczny.przebieg,
pojazd_mechaniczny.image,
pojazd_mechaniczny.kategoria,
pojazd_mechaniczny.cena,
pojazd_mechaniczny.kaucja,
pojazd_mechaniczny.latitude,
pojazd_mechaniczny.longitude
FROM klient
JOIN wypozyczenia ON klient.id_klienta = wypozyczenia.id_klienta
JOIN pojazd_mechaniczny ON wypozyczenia.id_pojazdu = pojazd_mechaniczny.id_pojazdu`;

router.get('/history', (req, res) => {
    sequelize
        .query(historyQuery, {
            replacements: { login: req.decoded.login }
        })
        .then(([results]) => {
            const cars = results.map(currentValue => {
                return {
                    login: currentValue.login,
                    date: currentValue.data_wypozyczenia,
                    id: currentValue.id_pojazdu,
                    name: currentValue.nazwa,
                    year: currentValue.rocznik,
                    dmc: currentValue.dmc,
                    seats: currentValue.liczba_siedzen,
                    mileage: currentValue.przebieg,
                    category: currentValue.kategoria,
                    image: `api/image/${currentValue.id_pojazdu}`,
                    owner: currentValue.wlasciciel,
                    price: currentValue.cena,
                    security: currentValue.kaucja
                }
            }).filter(value => value.login === req.decoded.login);
            res.json(cars);
        });
});

/**
 * @swagger
 * /sec/add:
 *    post:
 *      description: Add car
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
router.post('/add', (req, res) => {
    const image = Buffer.from(req.body.image, 'base64');
    sequelize
        .query(
            'CALL "dodaj_pojazd_full"(:name, :year, :dmc, :seats, true, false, :mileage, :login, :image, :price, :security)',
            {
                replacements: {
                    name: req.body.name,
                    year: req.body.year,
                    dmc: req.body.dmc,
                    seats: req.body.seats,
                    mileage: req.body.mileage,
                    login: req.decoded.login,
                    image,
                    price: req.body.price,
                    security: req.body.security
                }
            }
        )
        .then(() => {
            res.send('Return succeded');
        });
});

module.exports = router;
