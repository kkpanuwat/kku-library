const express = require("express");
const cors = require("cors");

const router = require("./router");
const { notFound } = require("./shared/middleware/notFound.middleware");
const { errorHandler } = require("./shared/middleware/error.middleware");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use(router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
