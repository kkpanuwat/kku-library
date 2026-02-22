function normalizeEmail(email) {
  if (typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

function isEmailLike(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  if (!password) return "password is required";
  if (password.length < 8) return "password must be at least 8 characters";
  return "";
}

module.exports = { normalizeEmail, isEmailLike, validatePassword };

