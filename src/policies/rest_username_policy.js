const { PolicyError } = require('@strapi/utils').errors;

module.exports = async (ctx, config, { strapi }) => {
  if(ctx.request.body.username) {
    const invalidChars = new RegExp('[^A-Za-z0-9-._~ ]');
    if(invalidChars.test(ctx.request.body.username)) {
      throw new PolicyError(`Username can only contain letters, numbers, spaces, and - . _ ~ characters`, {policy: 'rest_username_policy'});
    }
    if(ctx.request.body.username.length > 20) {
      throw new PolicyError(`Username can be a max of 20 characters`, {policy: 'rest_username_policy'});
    }
  }
  return true;
}
