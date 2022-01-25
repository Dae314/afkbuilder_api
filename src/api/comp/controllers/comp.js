'use strict';

/**
 *  comp controller ./src/api/comp/controllers/comp.js
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { sanitize } = require("@strapi/utils");
const logger = require('../../../utilities/logger');

function selectProps(...props) {
  return function(obj){
    const newObj = {};
    props.forEach(name => {
      newObj[name] = obj[name];
    });
    return newObj;
  }
}

module.exports = createCoreController('api::comp.comp', ({ strapi }) => ({
  async create(ctx) {
    // required for sanitize step
    const { auth } = ctx.state;

    // sanitize input data
    const compContentType = strapi.contentTypes['api::comp.comp'];
    const compSanitizedInputData = await sanitize.contentAPI.input(
      ctx.request.body.data,
      compContentType,
      { auth }
    );

    // add author field
    const user = ctx.state.user;
    const author = user.id;
    compSanitizedInputData.author = author;

    // try to create the comp
    try {
      const entity = await strapi.entityService.create('api::comp.comp', {data: compSanitizedInputData});
      logger.debug(`REST Comp create called with args: ${JSON.stringify(ctx.request.body)}`);
      return entity;
    } catch(err) {
      logger.error(`An error occurred on REST Comp create: ${JSON.stringify(err)}`);
      return ctx.throw(500);
    }
  },
  async update(ctx) {
    try {
      const response = await super.update(ctx);
      const sanitized_ctx = {method: ctx.request.method, url: ctx.request.url, body: ctx.request.body};
      logger.debug(`REST Comp update called with args: ${JSON.stringify(sanitized_ctx)}`);
      return response;
    } catch(err) {
      logger.error(`An error occured on REST Comp update: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occured on REST Comp update.`);
    }
  },
  async delete(ctx) {
    try {
      const response = await super.delete(ctx);
      const sanitized_ctx = {method: ctx.request.method, url: ctx.request.url, body: ctx.request.body};
      logger.debug(`REST Comp delete called with args: ${JSON.stringify(sanitized_ctx)}`);
      return response;
    } catch(err) {
      logger.error(`An error occured on REST Comp delete: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occured on REST Comp delete.`);
    }
  },
  async getAuthoredComps(ctx) {
    try {
      const comps = await strapi.entityService.findMany('api::comp.comp', {
        fields: ['uuid', 'updatedAt'],
        filters: { author: { id: ctx.state.user.id } },
      });
      return { data: {comps: comps} };
    } catch (err) {
      logger.error(`An error occurred looking up comps for getAuthoredComps: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred looking up comps for getAuthoredComps.`);
    }
  },
  async hasUpvoted(ctx) {
    try {
      const comp = await strapi.entityService.findOne('api::comp.comp', ctx.params.id, {
        populate: 'upvoters',
      });
      const result = comp.upvoters.some(e => e.id === ctx.state.user.id);
      return { data: {upvoted: result} };
    } catch (err) {
      logger.error(`An error occurred looking up comp for hasUpvoted: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred looking up comp for hasUpvoted.`);
    }
  },
  async getAllUpvoted(ctx) {
    try {
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', ctx.state.user.id, {
        populate: 'upvoted_comps',
      });
      const result = user.upvoted_comps.map(selectProps('id', 'uuid'));
      return { data: { comps: result} };
    } catch (err) {
      logger.error(`An error occurred looking up user for getAllUpvoted: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred looking up user for getAllUpvoted.`);
    }
  },
  async getUpvotes(ctx) {
    try {
      const comp = await strapi.entityService.findOne('api::comp.comp', ctx.params.id, {
        populate: 'upvoters',
      });
      return { data: {upvotes: comp.upvoters.length} };
    } catch (err) {
      logger.error(`An error occurred looking up comp for getUpvotes: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred looking up comp for getUpvotes.`);
    }
  },
  async toggleUpvote(ctx) {
    let comp;
    let hasUpvoted;
    try {
      comp = await strapi.entityService.findOne('api::comp.comp', ctx.params.id, {
        populate: 'upvoters',
      });
      hasUpvoted = comp.upvoters.some(e => e.id === ctx.state.user.id);
    } catch (err) {
      logger.error(`An error occurred on toggleUpvote while looking up comp.: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred on toggleUpvote while looking up comp.`);
    }
    try {
      if(hasUpvoted) {
        // user already upvoted, assume remove upvote
        const new_upvoters = comp.upvoters.filter(e => e.id !== ctx.state.user.id);
        await strapi.entityService.update('api::comp.comp', ctx.params.id, {
          data: {
            upvoters: new_upvoters,
          },
        });
      } else {
        // user has not upvoted, assume add upvote
        const new_upvoters = comp.upvoters.concat(ctx.state.user);
        await strapi.entityService.update('api::comp.comp', ctx.params.id, {
          data: {
            upvoters: new_upvoters,
          },
        });
      }
      // return the list of comps that the user upvoted
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', ctx.state.user.id, {
        populate: 'upvoted_comps',
      });
      const result = user.upvoted_comps.map(selectProps('id', 'uuid'));
      return { data: {comps: result} };
    } catch(err) {
      logger.error(`An error occurred updating comp for toggleUpvote: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred updating comp for toggleUpvote.`);
    }
  },
  async getTotalUpvotes(ctx) {
    try {
      const comps = await strapi.entityService.findMany('api::comp.comp', {
        filters: { author: { id: ctx.state.user.id } },
        populate: 'upvoters',
      });
      let total = 0;
      for(let comp of comps) {
        total += comp.upvoters.length;
      }
      return { data: {upvotes: total} };
    } catch (err) {
      logger.error(`An error occurred looking up comp for getUpvotes: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred looking up comp for getUpvotes.`);
    }
  },
}));
