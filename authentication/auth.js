const { verify } = require('jsonwebtoken');
const { secret } = require('../configuration/config');

module.exports = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }

    if (!token) {
        // res.json({
        //     success: false,
        //     message: 'Auth token is not supplied'
        // });
        return next('Auth token is not supplied');
    }

    verify(token, secret, (err, decoded) => {
        if (err) {
            // return res.json({
            //   success: false,
            //   message: 'Token is not valid'
            // });
            return next('Token is not valid');
        }
        req.decoded = decoded;
        next();
    });
};
