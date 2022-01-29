module.exports = (plugin) => {
  // controller and route for tokenDecrypt
  plugin.controllers.auth['tokenDecrypt'] = async (ctx) => {
    // get token from the POST request
    const {token} = ctx.request.body;

    // check token requirement
    if (!token) {
      return ctx.badRequest('`token` param is missing')
    }

    try {
      // decrypt the jwt
      const obj = await strapi.service("plugin::users-permissions.jwt").verify(token);

      // send the decrypted object
      return obj;
    } catch (err) {
      // if the token is not a valid token it will throw and error
      return ctx.badRequest(err.toString());
    }
  };
  plugin.routes['content-api'].routes.push({
    method: 'POST',
    path: '/token/validation',
    handler: 'auth.tokenDecrypt',
    config: {
      policies: [],
      prefix: '',
    },
  });

  // modify the user update route to only allow users to update their own profile
  plugin.policies['userUpdate'] = (policyContext, config, { strapi }) => {
    return parseInt(policyContext.state.user.id) === parseInt(policyContext.params.id);
  };
  const userUpdateIdx = plugin.routes['content-api'].routes.findIndex(e => e.method === 'PUT' && e.handler === 'user.update');
  plugin.routes['content-api'].routes[userUpdateIdx] = {
    method: 'PUT',
    path: '/users/:id',
    handler: 'user.update',
    config: {
      prefix: '',
      policies: ['userUpdate'],
    }
  };

  return plugin;
};
