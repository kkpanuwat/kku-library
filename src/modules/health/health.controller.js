const { asyncHandler } = require("../../shared/utils/asyncHandler");
const { query } = require("../../shared/db");

const health = asyncHandler(async (_req, res) => {
  await query("select 1 as ok");
  res.json({ ok: true });
});

module.exports = { health };

