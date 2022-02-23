const logger = require('../utilities/logger');
const { sanitize } = require("@strapi/utils");
const { ApplicationError } = require('@strapi/utils').errors;

module.exports = async (next, parent, args, context, info) => {
  if('heroes' in args.data) {
    const { auth } = context.state; // required for sanitize
    let heroList = [];
    const inputHeroes = args.data.heroes.map(e => e.trim());
    const uniqueHeroes = [...new Set(inputHeroes)];
    for(let hero of uniqueHeroes) {
      if(hero) {
        let [existingHero] = await strapi.entityService.findMany('api::hero.hero', {
          fields: ['id'],
          filters: {
            name: hero,
          },
        });
        if (!existingHero) {
          // hero does not exist yet, add a new hero
          try {
            const contentType = strapi.contentTypes['api::hero.hero'];
            const sanitizedInputData = await sanitize.contentAPI.input(
              { name: hero },
              contentType,
              { auth }
            );
            const newHero = await strapi.entityService.create('api::hero.hero', {
              data: sanitizedInputData,
            });
            heroList.push(newHero.id);
          } catch(err) {
            logger.error(`An error occurred on GQL comp create/update while adding a new hero: ${JSON.stringify(err)}`);
            return new ApplicationError(`An error occurred on GQL comp create/update while adding a new hero`);
          }
        } else {
          // hero already exists, add its ID to the heroList
          heroList.push(existingHero.id);
        }
      }
    }
    args.data.heroes = heroList;
  }

  return next(parent, args, context, info);
};
