const {logger} = require('../utilities/logger');
const {selectProps} = require('../utilities/selectProps');

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    await next();
    const filter = selectProps('username', 'avatar');
    try {
      if(Array.isArray(ctx.response.body.data)) {
        // find route, modify all results
        for(let result of ctx.response.body.data) {
          const comp = await strapi.entityService.findOne('api::comp.comp', result.id, {
            populate: { author: true },
          });
          const author = filter(comp.author);
          result.attributes.author = author;
        }
      } else {
        // findOne route, modify the result
        const comp = await strapi.entityService.findOne('api::comp.comp', ctx.response.body.data.id, {
          populate: { author: true },
        });
        const author = filter(comp.author);
        ctx.response.body.data.attributes.author = author;
      }
    } catch(err) {
      logger.error(`An error occurred on rest_comp_add_author: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred on rest_comp_add_author`);
    }
  };
};
