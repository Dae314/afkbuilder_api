const { PolicyError } = require('@strapi/utils').errors;

// disallow users from setting score in the API (read only field)
module.exports = async (ctx, config, { strapi }) => {
  if('score' in ctx.request.body.data) {
    throw new PolicyError(`score cannot be set by the API`, {policy: 'rest_score_policy'});
  }
  if('upvotes' in ctx.request.body.data || 'upvoters' in ctx.request.body.data) {
    throw new PolicyError(`upvotes cannot be set by the API`, {policy: 'rest_score_policy'});
  }
  if('downvotes' in ctx.request.body.data || 'downvoters' in ctx.request.body.data) {
    throw new PolicyError(`downvotes cannot be set by the API`, {policy: 'rest_score_policy'});
  }
  if('saves' in ctx.request.body.data || 'saved_users' in ctx.request.body.data) {
    throw new PolicyError(`saves cannot be set by the API`, {policy: 'rest_score_policy'});
  }
  return true;
}
