function notFound(_req, res) {
  res.status(404).json({ error: { code: "NOT_FOUND" } });
}

module.exports = { notFound };

