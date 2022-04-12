const { parse } = require("pg-connection-string");

module.exports = ({ env }) => {
  let { host, port, database, user, password } = parse(env("DATABASE_URL"));

  if(!port) port = env.int('DATABASE_PORT', 5432);

  return {
    connection: {
      client: 'postgres',
      connection: {
        host,
        port,
        database,
        user,
        password,
        ssl: {
          rejectUnauthorized: false, // For self-signed certificates
        },
      },
      pool: {
        min: 0,
        max: 10,
        createTimeoutMillis: 8000,
        acquireTimeoutMillis: 8000,
        idleTimeoutMillis: 8000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 100,
      },
      debug: false,
    },
  };
};
