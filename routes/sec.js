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
    // eslint-disable-next-line global-require
    sequelize.query('SELECT * FROM "pojazd_mechaniczny"').then(([results]) => {
        const cars = results.map(currentValue => {
            let data = currentValue.image;
            let base64data = '';
            if (data !== null) {
                let buff = new Buffer(data);
                base64data = `data:image/jpeg;base64,${buff.toString(
                    'base64'
                )}`;
            }
            return {
                id: currentValue.id_pojazdu,
                name: currentValue.nazwa,
                year: currentValue.rocznik,
                dmc: currentValue.dmc,
                seats: currentValue.liczba_siedzen,
                mileage: currentValue.przebieg,
                category: currentValue.kategoria,
                image: base64data,
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
router.get('/history', (req, res) => {
    res.send('Return succeded');
});

module.exports = router;
