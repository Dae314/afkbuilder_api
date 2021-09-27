'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  /**
   * Create a comp and link the logged in user as the afkbuilder_author
   *
   * @return {Object}
   */
  async create(ctx) {
    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      data.afkbuilder_user = ctx.state.user.id;
      entity = await strapi.services.comps.create(data, { files });
    } else {
      ctx.request.body.afkbuilder_user = ctx.state.user.id;
      entity = await strapi.services.comps.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.comps });
  },

   /**
   * Update a comp. Restrict updating to only the matching afkbuilder_user
   *
   * @return {Object}
   */
    async update(ctx) {
      const { id } = ctx.params;

      let entity;

      const [comp] = await strapi.services.comps.find({
        id: ctx.params.id,
        'afkbuilder_author.id': ctx.state.user.id,
      });

      if (!comp) {
        return ctx.unauthorized(`You can't update this entry!`);
      }

      if (ctx.is('multipart')) {
        const { data, files } = parseMultipartData(ctx);
        entity = await strapi.services.comps.update({ id }, data, {
          files,
        });
      } else {
        entity = await strapi.services.comps.update({ id }, ctx.request.body);
      }

      return sanitizeEntity(entity, { model: strapi.models.comps });
    },
};
