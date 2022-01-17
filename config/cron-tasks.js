const logger = require('../src/utilities/logger');

module.exports = {
  // cleanup dead heroes and tags everyday at 1AM
  '0 0 1 * * *': async ({ strapi }) => {
    // delete all dead tags (tags with no comps associated)
    let allTags;
    try {
      allTags = await strapi.entityService.findMany('api::tag.tag', {
        fields: ['id'],
        populate: { comps: true },
        filters: {
          id: {
            $notNull: true
          },
        },
      });
    } catch(err) {
      logger.error(`An error occurred finding all tags during daily delete dead tags: ${JSON.stringify(err)}`);
    }
    for(let tag of allTags) {
      if(tag.comps.length === 0) {
        try {
          await strapi.entityService.delete('api::tag.tag', tag.id);
        } catch(err) {
          logger.error(`An error occurred during daily delete dead tags: ${JSON.stringify(err)}`);
        }
      }
    }

    // delete all dead heroes (heroes with no comps associated)
    let allHeroes;
    try {
      allHeroes = await strapi.entityService.findMany('api::hero.hero', {
        fields: ['id'],
        populate: { comps: true },
        filters: {
          id: {
            $notNull: true
          },
        },
      });
    } catch(err) {
      logger.error(`An error occurred finding all heroes during daily delete dead heroes: ${JSON.stringify(err)}`);
    }
    for(let hero of allHeroes) {
      if(hero.comps.length === 0) {
        try {
          await strapi.entityService.delete('api::hero.hero', hero.id);
        } catch(err) {
          logger.error(`An error occurred during daily delete dead heroes: ${JSON.stringify(err)}`);
        }
      }
    }
  },
};
