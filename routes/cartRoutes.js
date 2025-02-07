const express = require("express");
const {checkAuth} = require("../middleware/checklogin");
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} = require("../controller/cartController");

const router = express.Router();

router.get("/", checkAuth, getCart);
router.post("/add", checkAuth, addToCart);
router.post("/remove", checkAuth, removeFromCart);
router.delete("/clear", checkAuth, clearCart);

module.exports = router;
