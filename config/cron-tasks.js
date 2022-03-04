const logger = require('../src/utilities/logger');
const {calcScore, decayBegin, decayEnd} = require('../src/utilities/calcScore');

module.exports = {
  // cleanup dead heroes and tags everyday at 1AM
  '0 0 1 * * *': async ({ strapi }) => {
    // delete all dead tags (tags with no comps associated)
    const start = Date.now();
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
    const end = Date.now();
    logger.info(`Daily hero and tag cleanup completed in ${end - start}ms`);
  },
  // cleanup upvotes, downvotes, and decay scores everyday at 4AM
  '0 0 4 * * *': async ({ strapi }) => {
    const start = Date.now();
    let allComps;
    try {
      allComps = await strapi.entityService.findMany('api::comp.comp', {
        fields: ['id', 'upvotes', 'downvotes', 'saves', 'score', 'createdAt'],
        populate: ['upvoters', 'downvoters', 'saved_users'],
      });
    } catch(err) {
      logger.error(`An error occurred finding all comps during daily vote cleanup: ${JSON.stringify(err)}`);
    }
    try {
      for(let comp of allComps) {
        if(comp.upvotes !== comp.upvoters.length || comp.downvotes !== comp.downvoters.length || comp.saves !== comp.saved_users.length) {
          // something got de-sync'd with upvotes, downvotes, or saves,
          // fix the upvotes, downvotes, saves, and score fields
          await strapi.entityService.update('api::comp.comp', comp.id, {
            data: {
              upvotes: comp.upvoters.length,
              downvotes: comp.downvoters.length,
              saves: comp.saved_users.length,
              score: calcScore({
                upvotes: comp.upvoters.length,
                downvotes: comp.downvoters.length,
                saves: comp.saved_users.length,
                updatedAt: comp.createdAt
              }),
            },
          });
        } else {
          // upvotes, downvotes, and saves are good, just update the score if comp is in the decay range
          const age = Date.now() - Date.parse(comp.createdAt);
          const oneDay = 86400000; // one day in ms
          //             24 * 60 * 60 * 1000
          if(age >= decayBegin && age <= decayEnd + oneDay) {
            // add one day to decayEnd to account for this function only running once a day
            await strapi.entityService.update('api::comp.comp', comp.id, {
              data: {
                score: calcScore({
                  upvotes: comp.upvotes,
                  downvotes: comp.downvotes,
                  saves: comp.saves,
                  updatedAt: comp.createdAt
                }),
              },
            });
          }
        }
      }
    } catch(err) {
      logger.error(`An error occurred updating comp vote information during daily vote cleanup: ${JSON.stringify(err)}`);
    }
    const end = Date.now();
    logger.info(`Daily vote cleanup completed in ${end - start}ms`);
  },
};
