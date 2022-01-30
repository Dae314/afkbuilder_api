const logger = require('../utilities/logger');

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // expect author username in ctx.params.id parameter
    if(ctx.params.id) {
      const username = ctx.params.id;
      let user;
      try {
        [user] = await strapi.entityService.findMany('plugin::users-permissions.user', {
          fields: ['id'],
          filters: {
            username: username,
          },
        });
      } catch(err) {
        logger.error(`An error occurred looking up user for rest_transform_username: ${JSON.stringify(err)}`);
        return ctx.throw(500, `An error occurred looking up user for rest_transform_username.`);
      }
      if(!user) {
        // unable to find user
        logger.warn(`Unable to find user with username ${username} for rest_transform_username.`);
        return ctx.throw(404, `Unable to find user with username ${username}`);
      }
      ctx.params.id = user.id;
    } else {
      return ctx.throw(500, `Must provide username to rest_transform_username.`);
    }
    return next();
  };
};
