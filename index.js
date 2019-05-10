const express = require('express');
const { json } = require('body-parser');
const { checkToken } = require('./authentication/auth');
const api = require('./routes/api');
const sec = require('./routes/sec').default.default;
const swagger = require('./configuration/swaggerConfig');

const app = express();
const port = process.env.PORT || 8080;

swagger(app);

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
