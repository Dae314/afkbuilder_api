module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '5d0b6a3d45067eb88320a6da6c9b0713'),
  },
  watchIgnoreFiles: ['**/logs/**'],
});
