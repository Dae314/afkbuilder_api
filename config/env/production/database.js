const { parse } = require("pg-connection-string");
var dns = require('dns');

const dnscheck = dns.lookup('dpg-c8pv9nfh8vl7rvmq45gg', function (err, addresses, family) {
  console.log(`dns err: ${err}`);
  console.log(`dns address: ${addresses}`);
});

module.exports = ({ env }) => {
  const { host, port, database, user, password } = parse(env("DATABASE_URL"));

  if(!port) port = env.int('DATABASE_PORT', 5432);
  console.log(env("DATABASE_URL"));
  console.log(`host: ${host}`);
  console.log(`port: ${port}`);
  console.log(`database: ${database}`);
  console.log(`user: ${user}`);

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
      debug: false,
    },
  };
};
