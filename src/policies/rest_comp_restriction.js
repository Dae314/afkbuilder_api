const { PolicyError } = require('@strapi/utils').errors;

module.exports = async (ctx, config, { strapi }) => {
  const now = new Date();
  const restrictions = await strapi.entityService.findMany('api::restriction.restriction', {
    fields: ['id'],
    filters: {
      $and: [
        { active: { $eq: true } },
        { type: { $eq: 'comp' } },
        { target_id: { $eq: ctx.state.user.id} },
        { expiration: { $gt: now.toISOString() } },
      ]
    }
  });
  if(restrictions.length > 0) {
    throw new PolicyError(`You have been banned from modifying comps`, {policy: 'gql_comp_restriction'});
  } else {
    return true;
  }
}
