const { sanitize } = require("@strapi/utils");

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    if('heroes' in ctx.request.body.data) {
      const { auth } = ctx.state; // required for sanitize
      let heroList = [];
      const inputHeroes = ctx.request.body.data.heroes.map(e => e.trim());
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
              logger.error(`An error occurred on REST comp create while adding a new hero: ${JSON.stringify(err)}`);
              return ctx.throw(500, `An error occurred on REST comp create while adding a new hero`);
            }
          } else {
            // hero already exists, add its ID to the heroList
            heroList.push(existingHero.id);
          }
        }
      }
      ctx.request.body.data.heroes = heroList;
    }

    return next();
  };
};
