const express = require("express");
const bodyParser = require("body-parser");
const auth = require("./authentication/auth");
const api = require("./routes/api");
const sec = require("./routes/sec");

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use("/api", api);
app.use("/sec", auth.checkToken, sec);

app.listen(port);
