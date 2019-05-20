const { Router } = require('express');
const moment = require('moment');
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
                security: currentValue.kaucja,
                latitude: currentValue.latitude,
                longitude: currentValue.longitude
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

const getRental = login => {
    return sequelize
        .query(historyQuery, {
            replacements: { login }
        })
        .then(([results]) => {
            const cars = results
                .map(currentValue => {
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
                        security: currentValue.kaucja,
                        latitude: currentValue.latitude,
                        longitude: currentValue.longitude,
                        state: currentValue.stan_wypozyczenia
                    };
                })
                .filter(value => value.login === login && value.state === true);
            return cars[0] ? cars[0] : null;
        });
};

const rentalsQuery = `INSERT INTO wypozyczenia("id_klienta", "id_pojazdu", "data_wypozyczenia", "oplacenie_kaucji", "zwrocenie_pojazdu")
VALUES(:clientId, :carId, :date, true ,false);`;

router.post('/rent', (req, res) => {
    getRental(req.decoded.login).then(car => {
        if (car === null) {
            sequelize.query(rentalsQuery, {
                replacements: {
                    clientId: req.decoded.id,
                    carId: req.body.carId,
                    date: moment('YYYY-MM-DD') // '2019-05-12'
                }
            });
            res.send('Rent succeded');
        } else {
            res.status(400).send('Cannot rent more than one vechicle');
        }
    });
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
    sequelize
        .query(
            'Update wypozyczenia SET wypozyczenia.zwrocenie_pojazdu=true WHERE id_klienta=:clientId AND id_pojazdu=:carId',
            {
                replacements: {
                    clientId: req.body.clientId,
                    carId: req.body.carId
                }
            }
        )
        .then(() => {
            res.send('Return succeded');
        })
        .catch(() => {
            res.status(400).send('Return failed');
        });
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
        .query(historyQuery, {
            replacements: { login: req.decoded.login }
        })
        .then(([results]) => {
            const cars = results
                .map(currentValue => {
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
                        security: currentValue.kaucja,
                        latitude: currentValue.latitude,
                        longitude: currentValue.longitude,
                        state: currentValue.stan_wypozyczenia
                    };
                })
                .filter(value => value.login === req.decoded.login);
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
            'CALL "dodaj_pojazd_all"(:name, :year, :dmc, :seats, true, false, :mileage, :login, :image, :price, :security, :latitude, :longitude)',
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
                    security: req.body.security,
                    latitude: req.body.latitude,
                    longitude: req.body.longitude
                }
            }
        )
        .then(() => {
            res.send('Add succeded');
        });
});

router.get('/rentals', function(req, res) {
    getRental(req.decoded.login).then(car => {
        res.json(car);
    });
});

module.exports = router;
