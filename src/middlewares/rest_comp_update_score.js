const {calcScore} = require('../utilities/calcScore');
const {logger} = require('../utilities/logger');

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const res = await next();

    if('comp_update' in ctx.request.body.data) {
      // update the score if the comp_update field is being updated
      try {
        const comp = await strapi.entityService.findOne('api::comp.comp', ctx.params.id, {
          fields: ['upvotes', 'downvotes', 'saves'],
        });
        const score = calcScore({
          upvotes: comp.upvotes,
          downvotes: comp.downvotes,
          saves: comp.saves,
          updatedAt: ctx.request.body.data.comp_update
        });
        await strapi.entityService.update('api::comp.comp', ctx.params.id, {
          data: { score: score },
        });
      } catch(err) {
        logger.error(`An error occurred updating score for REST comp update middleware: ${JSON.stringify(err)}`);
        return ctx.throw(500, `An error occurred on REST comp update while updating score.`);
      }
    }

    return res;
  };
};
