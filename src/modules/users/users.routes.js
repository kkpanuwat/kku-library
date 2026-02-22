const express = require("express");
const users = require("./users.controller");

const router = express.Router();

router.get("/users", users.list);
router.get("/users/:id", users.getById);
router.post("/users", users.create);
router.put("/users/:id", users.update);
router.delete("/users/:id", users.remove);

module.exports = router;

