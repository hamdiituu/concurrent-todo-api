const express = require("express");
const app = express();
const todoRoute = require("./routes/todoRoute");

app.use(express.json());

app.use("/api/todos", todoRoute);

module.exports = app;