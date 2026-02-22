const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { env } = require("../../shared/config/env");
const { HttpError } = require("../../shared/utils/httpError");
const { isEmailLike, normalizeEmail, validatePassword } = require("../../shared/utils/validators");
const { userRepository } = require("../users/user.repository");

async function register(input) {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const emailRaw = typeof input.email === "string" ? input.email : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (!name) throw new HttpError(400, "VALIDATION_ERROR", "name is required");

  const email = normalizeEmail(emailRaw);
  if (!email || !isEmailLike(email)) throw new HttpError(400, "VALIDATION_ERROR", "email is invalid");

  const passwordError = validatePassword(password);
  if (passwordError) throw new HttpError(400, "VALIDATION_ERROR", passwordError);

  const existing = await userRepository.findByEmail(email);
  if (existing) throw new HttpError(409, "EMAIL_ALREADY_EXISTS", "email already registered");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepository.create({
    name,
    email,
    role: "Student",
    status: "Active",
    passwordHash,
  });

  return user;
}

async function login(input) {
  const emailRaw = typeof input.email === "string" ? input.email : "";
  const password = typeof input.password === "string" ? input.password : "";

  const email = normalizeEmail(emailRaw);
  if (!email || !isEmailLike(email)) throw new HttpError(400, "VALIDATION_ERROR", "email is invalid");
  if (!password) throw new HttpError(400, "VALIDATION_ERROR", "password is required");

  const userWithAuth = await userRepository.findAuthByEmail(email);
  if (!userWithAuth || !userWithAuth.passwordHash) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "invalid credentials");
  }

  const ok = await bcrypt.compare(password, userWithAuth.passwordHash);
  if (!ok) throw new HttpError(401, "INVALID_CREDENTIALS", "invalid credentials");

  const token = jwt.sign({ sub: userWithAuth.id, role: userWithAuth.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  const { passwordHash: _pw, ...user } = userWithAuth;
  return { accessToken: token, tokenType: "Bearer", user };
}

const authService = { register, login };

module.exports = { authService };

