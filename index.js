const express = require('express');
const { json } = require('body-parser');
const checkToken = require('./authentication/auth');
const api = require('./routes/api');
const sec = require('./routes/sec');
const startSwagger = require('./configuration/swaggerConfig.js');

const app = express();
const port = process.env.PORT || 8080;

startSwagger(app);

app.use(json());
app.use('/api', api);
app.use('/sec', checkToken, sec);
// Use error handler
app.use((err, req, res) => {
    res.status(400).json({
        error: err
    });
});
app.listen(port);
