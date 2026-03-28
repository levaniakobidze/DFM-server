const { Paddle, Environment, LogLevel } = require('@paddle/paddle-node-sdk');

const isProd = process.env.NODE_ENV === 'production';

const paddle = new Paddle(process.env.PADDLE_API_KEY, {
  environment: isProd ? Environment.Production : Environment.Sandbox,
  logLevel: isProd ? LogLevel.Error : LogLevel.Verbose,
});

module.exports = paddle;
