'use strict';

/**
 *  hero controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const logger = require('../../../utilities/logger');
const {selectProps} = require('../../../utilities/selectProps');

module.exports = createCoreController('api::hero.hero', ({ strapi }) => ({
  //-----------------
  // Custom functions
  //-----------------
  // return an array of all tags with >0 related comps
  async getAllHeroes(ctx) {
    try {
      const heroes = await strapi.entityService.findMany('api::hero.hero', {
        fields: ['name'],
        populate: 'comps',
      });
      const cleanHeroes = heroes
        .map(e => ({...e, totalComps: e.comps.length}))
        .map(selectProps('name', 'totalComps'))
        .filter(e => e.totalComps > 0);
      return { data: cleanHeroes };
    } catch (err) {
      logger.error(`An error occurred looking up heroes for getAllHeroes: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred looking up heroes for getAllHeroes.`);
    }
  },
}));
