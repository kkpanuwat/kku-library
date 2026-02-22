require("dotenv").config();

const { createApp } = require("./app");
const { env } = require("./shared/config/env");

const app = createApp();

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`KKU Library API listening on :${env.PORT}`);
});
