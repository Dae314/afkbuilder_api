const {calcScore} = require('../utilities/calcScore');
const logger = require('../utilities/logger');

module.exports = async (next, parent, args, context, info) => {
  const res = await next(parent, args, context, info);

  if('comp_update' in args.data) {
    // update the score if the comp_update field is being updated
    try {
      const comp = await strapi.entityService.findOne('api::comp.comp', args.id, {
        fields: ['upvotes', 'downvotes', 'saves'],
      });
      const score = calcScore({
        upvotes: comp.upvotes,
        downvotes: comp.downvotes,
        saves: comp.saves,
        updatedAt: args.data.comp_update
      });
      await strapi.entityService.update('api::comp.comp', args.id, {
        data: { score: score },
      });
    } catch(err) {
      logger.error(`An error occurred updating score for GQL comp update middleware: ${JSON.stringify(err)}`);
      return context.throw(500, `An error occurred on REST comp update while updating score.`);
    }
  }

  return res;
}
