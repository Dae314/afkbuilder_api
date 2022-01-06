module.exports = (plugin) => {
  plugin.controllers.auth['tokenDecrypt'] = async (ctx) => {
    // get token from the POST request
    const {token} = ctx.request.body;

    // check token requirement
    if (!token) {
      return ctx.badRequest('`token` param is missing')
    }

    try {
      // decrypt the jwt
      const obj = await strapi.plugin('users-permissions').service('jwt').verify(token);

      // send the decrypted object
      return obj;
    } catch (err) {
      // if the token is not a valid token it will throw and error
      return ctx.badRequest(err.toString());
    }
  }

  plugin.routes['content-api'].routes.push({
    method: 'POST',
    path: '/token/validation',
    handler: 'auth.tokenDecrypt',
    config: {
      policies: [],
      prefix: '',
    },
  });

  return plugin;
};
