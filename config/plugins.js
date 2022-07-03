module.exports = ({ env }) => ({
  graphql: {
    config: {
      endpoint: '/graphql',
      shadowCRUD: true,
      playgroundAlways: false,
      depthLimit: 7,
      amountLimit: 100,
      apolloServer: {
        tracing: false,
      },
    },
  },
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '14d',
      },
      jwtSecret: env('JWT_SECRET', 'KbJf0h0$iBQmZrsQ!TTZ#jJuaaWT*Trb'),
    },
  },
});
