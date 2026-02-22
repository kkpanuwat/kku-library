const express = require("express");
const books = require("./books.controller");

const router = express.Router();

router.get("/books", books.list);
router.get("/books/:id", books.getById);
router.post("/books", books.create);
router.put("/books/:id", books.update);
router.delete("/books/:id", books.remove);

module.exports = router;

