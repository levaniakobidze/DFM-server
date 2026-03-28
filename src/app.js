const express = require('express');
const cors = require('cors');

const router = require('./routes/index');
const { attachUser } = require('./middlewares/auth');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ── Middleware ────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(attachUser); // attaches req.user on every request if a valid JWT is present

// ── Routes ────────────────────────────────────
app.use('/api', router);

// ── 404 & Error handlers (must be last) ───────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
