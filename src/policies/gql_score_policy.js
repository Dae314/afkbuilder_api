const { PolicyError } = require('@strapi/utils').errors;

// disallow users from setting score in the API (read only field)
module.exports = async (ctx, config, { strapi }) => {
  if('score' in ctx.args.data) {
    throw new PolicyError(`score cannot be set by the API`, {policy: 'gql_score_policy'});
  }
  if('upvotes' in ctx.args.data || 'upvoters' in ctx.args.data) {
    throw new PolicyError(`upvotes cannot be set by the API`, {policy: 'gql_score_policy'});
  }
  if('downvotes' in ctx.args.data || 'downvoters' in ctx.args.data) {
    throw new PolicyError(`downvotes cannot be set by the API`, {policy: 'gql_score_policy'});
  }
  if('saves' in ctx.args.data || 'saved_users' in ctx.args.data) {
    throw new PolicyError(`saves cannot be set by the API`, {policy: 'gql_score_policy'});
  }
  return true;
}
