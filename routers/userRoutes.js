const express = require("express");
const { saveUser } = require("../controllers/userController");
const { validateData } = require("../middlewares/userMiddleware");
const api = express.Router();

api.post("/users", validateData, saveUser);

module.exports = api;
