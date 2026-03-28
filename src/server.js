require('dotenv').config();
const app = require('./app');
const { startCleanupJob } = require('./utils/cleanup');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[server] Running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  startCleanupJob();
});
