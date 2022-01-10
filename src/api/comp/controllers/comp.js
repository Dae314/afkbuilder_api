'use strict';

/**
 *  comp controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::comp.comp', ({ strapi }) => ({
  async create(ctx) {
    let entity;
    const user = ctx.state.user;
    const author = user.id;
    ctx.request.body.data.author = author;
    try {
      entity = await strapi.entityService.create('api::comp.comp', ctx.request.body);
    } catch(err) {
      console.log(err);
    }
    return entity;
  },
  async update(ctx) {
    try {
      const [comp] = await strapi.entityService.findMany('api::comp.comp', {
        fields: ['name'],
        filters: {
          id: ctx.params.id,
          author: ctx.state.user.id,
        },
      });

      if (!comp) {
        return ctx.unauthorized(`You are not authorized to delete this entry.`);
      }
    } catch(err) {
      console.log(err);
    }

    try {
      const response = await super.update(ctx);
      return response;
    } catch(err) {
      console.log(err);
    }
  },
  async delete(ctx) {
    try {
      const [comp] = await strapi.entityService.findMany('api::comp.comp', {
        fields: ['name'],
        filters: {
          id: ctx.params.id,
          author: ctx.state.user.id,
        },
      });

      if (!comp) {
        return ctx.unauthorized(`You are not authorized to delete this entry.`);
      }
    } catch(err) {
      console.log(err);
    }

    try {
      const response = await super.delete(ctx);
      return response;
    } catch(err) {
      console.log(err);
    }
  },
}));
