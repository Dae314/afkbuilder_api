'use strict';

/**
 *  tag controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const logger = require('../../../utilities/logger');
const {selectProps} = require('../../../utilities/selectProps');

module.exports = createCoreController('api::tag.tag', ({ strapi }) => ({
  //-----------------
  // Custom functions
  //-----------------
  // return an array of all users with >0 published comps
  async getAllTags(ctx) {
    try {
      const tags = await strapi.entityService.findMany('api::tag.tag', {
        fields: ['name'],
        populate: 'comps',
      });
      const cleanTags = tags
        .map(e => ({...e, totalComps: e.comps.length}))
        .map(selectProps('name', 'totalComps'))
        .filter(e => e.totalComps > 0);
      return { data: cleanTags };
    } catch (err) {
      logger.error(`An error occurred looking up tags for getAllTags: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred looking up tags for getAllTags.`);
    }
  },
}));
