module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '5d0b6a3d45067eb88320a6da6c9b0713'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', '8D1qTArskF2j^f9*Kn@QiV7&m!1@ZMNc'),
  },
  watchIgnoreFiles: ['**/logs/**'],
});
