const express = require("express");
const router = express.Router();
const {createUser, loginUser} = require("../controller/userController");

router.post("/register", createUser); // User registration
router.post("/login", loginUser); // User login

module.exports = router;
