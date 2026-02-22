const express = require("express");
const fines = require("./fines.controller");

const router = express.Router();

router.get("/fines", fines.list);
router.post("/fines/:id/pay", fines.pay);

module.exports = router;

