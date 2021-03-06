const { Router } = require('express');
const { sign } = require('jsonwebtoken');
const { secret } = require('../configuration/config');
const {
    comparePassword,
    cryptPassword
} = require('../authentication/passwordEncryptor');
const sequelize = require('../configuration/databaseConfig');

const router = Router();
const fs = require('fs');

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
 *            login:
 *              type: "string"
 *            password:
 *              type: "string"
 *      responses:
 *       200:
 *         description: Login succeded
 *       403:
 *          description: "Incorrect credentials"
 */
const login = (login, password, res) => {
    sequelize
        .query('SELECT "zwracanie_hasla"(:login)', {
            replacements: { login }
        })
        .then(([results]) => {
            if (results.length < 1) {
                res.status(403).json({
                    message: 'Incorrect username or password'
                });
            }
            const hashPass = Object.values(results[0])[0];
            comparePassword(password, hashPass, (err, isMatch) => {
                if (err) {
                    res.status(500).json({
                        message: 'Failed to compare passwords'
                    });
                    return;
                }
                if (isMatch) {
                    let id = null;
                    sequelize
                        .query(
                            'SELECT "id_klienta" AS id FROM klient WHERE klient.login=:login',
                            { replacements: { login: login } }
                        )
                        .then(([results]) => {
                            if (results.length < 1) {
                                res.status(500).json({
                                    message: 'Failed to find id of user'
                                });
                            }
                            id = results[0].id;
                            res.send(
                                `"${sign({ id, login: login }, secret, {
                                    expiresIn: '24h' // expires in 24 hours
                                })}"`
                            );
                        });
                    return;
                }
                res.status(403).json({
                    message: 'Incorrect username or password'
                });
            });
        });
};
router.post('/login', (req, res) => {
    login(req.body.login, req.body.password, res);
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
            res.status(500).json({
                message: 'Failed to encrypt password'
            });
            return;
        }
        const pass = hash;
        sequelize
            .query(
                'CALL "dodaj_klienta"(:imie, :nazwisko, :dataUrodzenia, :pesel, :login, :haslo)',
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
            .then(() => login(req.body.login, req.body.password, res))
            .catch(e => {
                res.status(400).json({
                    message: e.original.sqlMessage
                });
            });
    });
});

router.get('/image/:id', function(req, res) {
    sequelize
        .query('SELECT image FROM "pojazd_mechaniczny" WHERE id_pojazdu=:id', {
            replacements: { id: req.params.id }
        })
        .then(([results]) => {
            if (results.length > 0) {
                const data = results[0].image;
                res.contentType('image/jpeg');
                if (data === null) {
                    fs.readFile('./img-placeholder.jpg', (err, fileData) => {
                        if (err) {
                            res.end('', 'binary');
                        } else {
                            res.end(fileData, 'binary');
                        }
                    });
                } else {
                    res.end(data, 'binary');
                }
            } else {
                res.status(400);
            }
        });
});

// export this router to use in our index.js
module.exports = router;
