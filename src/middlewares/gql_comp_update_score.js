const {calcScore} = require('../utilities/calcScore');
const logger = require('../utilities/logger');

module.exports = async (next, parent, args, context, info) => {
  const res = await next(parent, args, context, info);

  if('comp_update' in args.data) {
    // update the score if the comp_update field is being updated
    try {
      const comp = await strapi.entityService.findOne('api::comp.comp', args.id, {
        fields: ['upvotes', 'downvotes'],
      });
      const score = calcScore(comp.upvotes, comp.downvotes, args.data.comp_update);
      await strapi.entityService.update('api::comp.comp', args.id, {
        data: { score: score },
      });
    } catch(err) {
      logger.error(`An error occurred updating score for GQL comp update middleware: ${JSON.stringify(err)}`);
    }
  }

  return res;
}
