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

  // modify the user delete route with owner check
  const userDeleteIdx = plugin.routes['content-api'].routes.findIndex(e => e.method === 'DELETE' && e.handler === 'user.destroy');
  plugin.routes['content-api'].routes[userDeleteIdx] = {
    method: 'DELETE',
    path: '/users/:id',
    handler: 'user.destroy',
    config: {
      prefix: '',
      policies: ['global::rest_profile_owner_policy'],
    }
  };

  // modify the user update route with owner check and username check
  const userUpdateIdx = plugin.routes['content-api'].routes.findIndex(e => e.method === 'PUT' && e.handler === 'user.update');
  plugin.routes['content-api'].routes[userUpdateIdx] = {
    method: 'PUT',
    path: '/users/:id',
    handler: 'user.update',
    config: {
      prefix: '',
      policies: ['global::rest_profile_owner_policy','global::rest_username_policy'],
    }
  };

  // modify user create route with username check
  const userCreateIdx = plugin.routes['content-api'].routes.findIndex(e => e.method === 'POST' && e.handler === 'user.create');
  plugin.routes['content-api'].routes[userCreateIdx] = {
    method: 'POST',
    path: '/users',
    handler: 'user.create',
    config: {
      prefix: '',
      policies: ['global::rest_username_policy'],
    }
  };

  return plugin;
};
