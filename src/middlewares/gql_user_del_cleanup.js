const {logger} = require('../utilities/logger');
const { ApplicationError } = require('@strapi/utils').errors;

module.exports = async (next, parent, args, context, info) => {
  const comps = await strapi.entityService.findMany('api::comp.comp', {
    filters: { author: { id: { $eq: args.id} } },
    fields: ['id'],
  });
  const result = await next(parent, args, context, info);
  try {
    for(let comp of comps) {
      await strapi.entityService.update('api::comp.comp', comp.id, {
        data: {
          author: env('DEFAULT_USER_ID'),
        }
      });
    }
  } catch(err) {
    logger.error(`An error occurred on GQL user delete while modifying comps: ${JSON.stringify(err)}`);
    return new ApplicationError(`An error occurred on GQL user delete while modifying comps`);
  }
  return result;
};
