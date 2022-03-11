const { PolicyError } = require('@strapi/utils').errors;

module.exports = async (ctx, config, { strapi }) => {
  if('username' in ctx.args.data) {
    const now = new Date();
    const restrictions = await strapi.entityService.findMany('api::restriction.restriction', {
      fields: ['id'],
      filters: {
        $and: [
          { active: { $eq: true } },
          { type: { $eq: 'username' } },
          { target_id: { $eq: ctx.state.user.id } },
          { expiration: { $gt: now.toISOString() } },
        ]
      }
    });
    if(restrictions.length > 0) {
      throw new PolicyError(`You have been banned from changing your username`, {policy: 'gql_username_restriction'});
    } else {
      return true;
    }
  }
  return true;
}
