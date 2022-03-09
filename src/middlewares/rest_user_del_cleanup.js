const {logger} = require('../utilities/logger');

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const comps = await strapi.entityService.findMany('api::comp.comp', {
      filters: { author: { id: { $eq: ctx.params.id} } },
      fields: ['id'],
    });
    const result = await next(ctx);
    try {
      for(let comp of comps) {
        await strapi.entityService.update('api::comp.comp', comp.id, {
          data: {
            author: env('DEFAULT_USER_ID'),
          }
        });
      }
    } catch(err) {
      logger.error(`An error occurred on REST user delete while modifying comps: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred on REST user delete while modifying comps`);
    }
    return result;
  };
};
