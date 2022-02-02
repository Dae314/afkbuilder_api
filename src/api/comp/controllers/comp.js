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
  // return an array of all comps that the authenticated user has published
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
  // return true/false if the authenticated user has upvoted the specified entry
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
  // return an array of all entries that the authenticated user has upvoted
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
  // toggle whether the authenticated user has/has not upvoted an entry
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
            score: new_upvoters.length,
          },
        });
      } else {
        // user has not upvoted, assume add upvote
        const new_upvoters = comp.upvoters.concat(ctx.state.user);
        await strapi.entityService.update('api::comp.comp', ctx.params.id, {
          data: {
            upvoters: new_upvoters,
            score: new_upvoters.length,
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
  // return the total number of upvotes that the authenticated user has received
  async getReceivedUpvotes(ctx) {
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
      logger.error(`An error occurred looking up comp for getReceivedUpvotes: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred looking up comp for getReceivedUpvotes.`);
    }
  },
  // return true/false if the authenticated user has downvoted the specified entry
  async hasDownvoted(ctx) {
    try {
      const comp = await strapi.entityService.findOne('api::comp.comp', ctx.params.id, {
        populate: 'downvoters',
      });
      const result = comp.downvoters.some(e => e.id === ctx.state.user.id);
      return { data: {downvoted: result} };
    } catch (err) {
      logger.error(`An error occurred looking up comp for hasDownvoted: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred looking up comp for hasDownvoted.`);
    }
  },
  // return an array of all entries that the authenticated user has downvoted
  async getAllDownvoted(ctx) {
    try {
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', ctx.state.user.id, {
        populate: 'downvoted_comps',
      });
      const result = user.downvoted_comps.map(selectProps('id', 'uuid'));
      return { data: { comps: result} };
    } catch (err) {
      logger.error(`An error occurred looking up user for getAllDownvoted: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred looking up user for getAllDownvoted.`);
    }
  },
  // toggle whether the authenticated user has/has not upvoted an entry
  async toggleDownvote(ctx) {
    let comp;
    let hasDownvoted;
    let hasUpvoted;
    try {
      comp = await strapi.entityService.findOne('api::comp.comp', ctx.params.id, {
        populate: ['upvoters', 'downvoters'],
      });
      hasUpvoted = comp.upvoters.some(e => e.id === ctx.state.user.id);
      hasDownvoted = comp.downvoters.some(e => e.id === ctx.state.user.id);
    } catch (err) {
      logger.error(`An error occurred on toggleDownvote while looking up comp.: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred on toggleDownvote while looking up comp.`);
    }
    if(hasUpvoted) {
      return ctx.throw(405, `User may not downvote if they have already upvoted.`);
    }
    try {
      if(hasDownvoted) {
        // user already Downvoted, assume remove Downvote
        const new_downvoters = comp.downvoters.filter(e => e.id !== ctx.state.user.id);
        await strapi.entityService.update('api::comp.comp', ctx.params.id, {
          data: {
            downvoters: new_downvoters,
          },
        });
      } else {
        // user has not downvoted, assume add downvote
        const new_downvoters = comp.downvoters.concat(ctx.state.user);
        await strapi.entityService.update('api::comp.comp', ctx.params.id, {
          data: {
            downvoters: new_downvoters,
          },
        });
      }
      // return the list of comps that the user downvoted
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', ctx.state.user.id, {
        populate: 'downvoted_comps',
      });
      const result = user.downvoted_comps.map(selectProps('id', 'uuid'));
      return { data: {comps: result} };
    } catch(err) {
      logger.error(`An error occurred updating comp for toggleDownvote: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred updating comp for toggleDownvote.`);
    }
  },
  // return the total number of downvotes that the authenticated user has received
  async getReceivedDownvotes(ctx) {
    try {
      const comps = await strapi.entityService.findMany('api::comp.comp', {
        filters: { author: { id: ctx.state.user.id } },
        populate: 'downvoters',
      });
      let total = 0;
      for(let comp of comps) {
        total += comp.downvoters.length;
      }
      return { data: {downvotes: total} };
    } catch (err) {
      logger.error(`An error occurred looking up comp for getReceivedDownvotes: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred looking up comp for getReceivedDownvotes.`);
    }
  },
  // public: return the public profile for a user
  async getAuthorProfile(ctx) {
    try {
      const comps = await strapi.entityService.findMany('api::comp.comp', {
        fields: ['name','uuid'],
        filters: { author: { id: ctx.params.id } },
        populate: 'upvoters',
      });
      const resultComps = comps.map(selectProps('id', 'uuid', 'name'));
      let upvotes = 0;
      for(let comp of comps) {
        upvotes += comp.upvoters.length;
      }
      const author = await strapi.entityService.findOne('plugin::users-permissions.user', ctx.params.id, {
        fields: ['username','avatar'],
        populate: 'upvoted_comps',
      });
      author.upvotes = upvotes;
      const resultUpvotedComps = author.upvoted_comps.map(selectProps('id', 'uuid', 'name'));
      author.upvoted_comps = resultUpvotedComps;
      return { data: { comps: resultComps, author: author } };
    } catch (err) {
      logger.error(`An error occurred looking up information for getAuthorProfile: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred looking up information for getAuthorProfile.`);
    }
  },
  // public: return the sanitized author information for the specified entry
  async getCompAuthor(ctx) {
    try {
      const comp = await strapi.entityService.findOne('api::comp.comp', ctx.params.id, {
        populate: 'author',
      });
      const filter = selectProps('username', 'avatar');
      const author = filter(comp.author);
      return { data: { author: author } };
    } catch (err) {
      logger.error(`An error occurred looking up information for getCompAuthor: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred looking up information for getCompAuthor.`);
    }
  },
}));
