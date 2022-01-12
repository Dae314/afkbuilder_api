'use strict';

/**
 *  comp controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const logger = require('../../../utilities/logger');

module.exports = createCoreController('api::comp.comp', ({ strapi }) => ({
  async create(ctx) {
    let entity;
    const user = ctx.state.user;
    const author = user.id;
    ctx.request.body.data.author = author;
    try {
      entity = await strapi.entityService.create('api::comp.comp', ctx.request.body);
      logger.debug(`REST Comp create called with args: ${JSON.stringify(ctx.request.body)}`);
      return entity;
    } catch(err) {
      logger.error(`An error occurred on REST Comp creation: ${JSON.stringify(err)}`);
    }
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
        const sanitized_ctx = {method: ctx.request.method, url: ctx.request.url, body: ctx.request.body};
        logger.error(`A forbidden error occurred on REST Comp update: ${JSON.stringify(sanitized_ctx)}`);
        return ctx.unauthorized(`You are not authorized to delete this entry.`);
      }
    } catch(err) {
      logger.error(`An error occured finding comp on REST Comp update: ${JSON.stringify(err)}`);
    }

    try {
      const response = await super.update(ctx);
      const sanitized_ctx = {method: ctx.request.method, url: ctx.request.url, body: ctx.request.body};
      logger.debug(`REST Comp update called with args: ${JSON.stringify(sanitized_ctx)}`);
      return response;
    } catch(err) {
      logger.error(`An error occured on REST Comp update: ${JSON.stringify(err)}`);
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
        const sanitized_ctx = {method: ctx.request.method, url: ctx.request.url, body: ctx.request.body};
        logger.error(`A forbidden error occurred on REST Comp delete: ${JSON.stringify(sanitized_ctx)}`);
        return ctx.unauthorized(`You are not authorized to delete this entry.`);
      }
    } catch(err) {
      logger.error(`An error occured finding comp on REST Comp delete: ${JSON.stringify(err)}`);
    }

    try {
      const response = await super.delete(ctx);
      const sanitized_ctx = {method: ctx.request.method, url: ctx.request.url, body: ctx.request.body};
      logger.debug(`REST Comp delete called with args: ${JSON.stringify(sanitized_ctx)}`);
      return response;
    } catch(err) {
      logger.error(`An error occured on REST Comp delete: ${JSON.stringify(err)}`);
    }
  },
}));
