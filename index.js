const express = require("express");
const bodyParser = require("body-parser");
const auth = require("./authentication/auth");
const api = require("./routes/api");
const sec = require("./routes/sec");

const app = express();

app.use(bodyParser.json());
app.use("/api", api);
app.use("/sec", auth.checkToken, sec);

app.listen(8080);
