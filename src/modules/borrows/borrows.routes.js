const express = require("express");
const borrows = require("./borrows.controller");

const router = express.Router();

router.get("/borrows", borrows.list);
router.post("/borrows", borrows.create);

module.exports = router;

