const { PolicyError } = require('@strapi/utils').errors;

// disallow users from setting score in the API (read only field)
module.exports = async (ctx, config, { strapi }) => {
  if('score' in ctx.request.body.data) {
    throw new PolicyError(`score cannot be set by the API`, {policy: 'rest_score_policy'});
  }
  return true;
}
