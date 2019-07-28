const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { user, loan, transaction, sequelize, init } = require("../db/models");
const users = require("./routes/users");
const loans = require("./routes/loans");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
init(); // init models

app.use("/users", users);
app.use("/loans", loans);
const port = 5000 || process.env.PORT;
app.listen(5000);
console.log("running on port %s", port);
