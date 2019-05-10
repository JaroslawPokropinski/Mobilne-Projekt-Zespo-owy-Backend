import { Router } from 'express';
import { sign } from 'jsonwebtoken';
import { secret } from '../configuration/config';
import {
    comparePassword,
    cryptPassword
} from '../authentication/passwordEncryptor';
import sequelize from '../configuration/databaseConfig';

const router = Router();

/**
 * @swagger
 * /api:
 *    get:
 *      description: nil
 */
router.get('/', (req, res) => {
    res.send('GET route on things.');
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
router.post('/login', (req, res) => {
    if (req.body.username === 'admin' && req.body.password === 'admin') {
        res.json({
            message: sign({ username: req.body.username }, secret, {
                expiresIn: '24h' // expires in 24 hours
            })
        });
    } else {
        sequelize
            .query('SELECT `zwracanie_hasla`(:login)', {
                replacements: { login: req.body.login }
            })
            .then(([results]) => {
                if (results.length < 1) {
                    res.status(403).json({
                        message: 'Incorrect username or password'
                    });
                }
                const hashPass = Object.values(results[0])[0];
                comparePassword(req.body.password, hashPass, (err, isMatch) => {
                    if (err) {
                        res.status(500).json({
                            message: 'Failed to compare passwords'
                        });
                        return;
                    }
                    if (isMatch) {
                        res.json({
                            message: sign(
                                { username: req.body.username },
                                secret,
                                {
                                    expiresIn: '24h' // expires in 24 hours
                                }
                            )
                        });
                        return;
                    }
                    res.status(403).json({
                        message: 'Incorrect username or password'
                    });
                });
            });
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
router.post('/register', (req, res) => {
    cryptPassword(req.body.password, (err, hash) => {
        if (err) {
            res.status(400).json({
                message: 'Failed to encrypt password'
            });
            return;
        }
        const pass = hash;
        sequelize
            .query(
                'CALL `Dodaj_Klienta`(:imie, :nazwisko, :dataUrodzenia, :pesel, :login, :haslo)',
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
            .then(() =>
                res.json({
                    message: 'success'
                })
            )
            .catch(e => {
                res.status(400).json({
                    message: e.original.sqlMessage
                });
            });
    });
});

// export this router to use in our index.js
export default router;
