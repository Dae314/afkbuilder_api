const { PolicyError } = require('@strapi/utils').errors;

// disallow users from setting total_upvotes in the API (read only field)
module.exports = async (ctx, config, { strapi }) => {
  if(ctx.args.data.total_upvotes) {
    throw new PolicyError(`total_upvotes cannot be set by the API`, {policy: 'gql_upvote_policy'});
  }
  return true;
}
