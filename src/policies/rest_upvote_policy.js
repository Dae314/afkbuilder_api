const { PolicyError } = require('@strapi/utils').errors;

// disallow users from setting total_upvotes in the API (read only field)
module.exports = async (ctx, config, { strapi }) => {
  if('total_upvotes' in ctx.request.body.data) {
    throw new PolicyError(`total_upvotes cannot be set by the API`, {policy: 'rest_upvote_policy'});
  }
  return true;
}
