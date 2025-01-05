const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const {createDbConnection}= require('./Db')
const Router = require("./router/news");
require("dotenv").config();

createDbConnection();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/news", Router);

app.listen(process.env.PORT, process.env.HOSTNAME, () => {
  console.log("server is started");
});
