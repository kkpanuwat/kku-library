const express = require("express");
const borrows = require("../borrows/borrows.controller");

const router = express.Router();

router.post("/returns/:borrowId", borrows.returnById);

module.exports = router;

