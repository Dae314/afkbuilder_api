const {logger} = require('../utilities/logger');

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // expect comp uuid in ctx.params.id parameter
    if('id' in ctx.params) {
      const uuid = ctx.params.id;
      let comp;
      try {
        [comp] = await strapi.entityService.findMany('api::comp.comp', {
          fields: ['id'],
          filters: {
            uuid: uuid,
          },
        });
      } catch(err) {
        logger.error(`An error occurred looking up comp for rest_transform_comp_uuid: ${JSON.stringify(err)}`);
        return ctx.throw(500, `An error occurred looking up comp for rest_transform_comp_uuid.`);
      }
      if(!comp) {
        // unable to find comp
        logger.warn(`Unable to find comp with uuid ${uuid} for rest_transform_comp_uuid.`);
        return ctx.throw(404, `Unable to find comp with uuid ${uuid}`);
      }
      ctx.params.id = comp.id;
    } else {
      return ctx.throw(500, `Must provide uuid to rest_transform_comp_uuid.`);
    }
    return next();
  };
};
