const cronTasks = require("../../cron-tasks");

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env("RENDER_EXTERNAL_URL"),
  app: {
    keys: env.array('APP_KEYS', ['koa.sess', 'koa.sess2']),
  },
  cron: {
    enabled: env.bool('CRON_ENABLED', false),
    tasks: cronTasks,
  },
  admin: {
    auth: {
      secret: env("ADMIN_JWT_SECRET"),
    },
  },
});
