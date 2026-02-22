const express = require("express");

const healthRoutes = require("./modules/health/health.routes");
const authRoutes = require("./modules/auth/auth.routes");
const { requireAuth } = require("./shared/middleware/auth.middleware");
const booksRoutes = require("./modules/books/books.routes");
const usersRoutes = require("./modules/users/users.routes");
const borrowsRoutes = require("./modules/borrows/borrows.routes");
const returnsRoutes = require("./modules/returns/returns.routes");
const finesRoutes = require("./modules/fines/fines.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");

const router = express.Router();

router.use(healthRoutes);
router.use(authRoutes);

// Protected routes (require Bearer access token)
router.use(requireAuth);
router.use(booksRoutes);
router.use(usersRoutes);
router.use(borrowsRoutes);
router.use(returnsRoutes);
router.use(finesRoutes);
router.use(dashboardRoutes);

module.exports = router;
