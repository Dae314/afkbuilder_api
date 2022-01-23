const logger = require('../utilities/logger');

module.exports = async (ctx, config, { strapi }) => {
  try {
    const [comp] = await strapi.entityService.findMany('api::comp.comp', {
      fields: ['name'],
      filters: {
        id: ctx.params.id,
        author: ctx.state.user.id,
      },
    });

    if (!comp) {
      const sanitized_ctx = {method: ctx.request.method, url: ctx.request.url, body: ctx.request.body};
      logger.error(`A forbidden error occurred on REST Comp update: ${JSON.stringify(sanitized_ctx)}`);
      return false;
    }
  } catch(err) {
    logger.error(`An error occured on REST Comp update while finding comp: ${JSON.stringify(err)}`);
    throw new PolicyError(`An error occured on REST author policy while finding comp.`, {policy: 'author_policy'});
  }
  return true;
}
