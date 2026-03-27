const express = require('express');
const cors = require('cors');

const router = require('./routes/index');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ── Middleware ────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────
app.use('/api', router);

// ── 404 & Error handlers (must be last) ───────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
