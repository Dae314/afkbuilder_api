'use strict';

/**
 *  comp controller ./src/api/comp/controllers/comp.js
 */

const { createCoreController } = require('@strapi/strapi').factories;
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
    // add author field
    const user = ctx.state.user;
    const author = user.id;
    ctx.request.body.data.author = author;

    // parse tags field
    let tagList = [];
    const inputTags = ctx.request.body.data.tags.map(e => e.trim());
    const uniqueTags = [...new Set(inputTags)];
    for(let tag of uniqueTags) {
      if(tag) {
        let [existingTag] = await strapi.entityService.findMany('api::tag.tag', {
          fields: ['id'],
          filters: {
            name: tag,
          },
        });
        if (!existingTag) {
          // tag does not exist yet, add a new tag
          try {
            const newTag = await strapi.entityService.create('api::tag.tag', {
              data: {
                name: tag,
              },
            });
            tagList.push(newTag.id);
          } catch(err) {
            logger.error(`An error occurred on REST comp creation while adding a new tag: ${JSON.stringify(err)}`);
            return ctx.throw(500);
          }
        } else {
          // tag already exists, add its ID to the tagList
          tagList.push(existingTag.id);
        }
      }
    }
    ctx.request.body.data.tags = tagList;

    // parse heroes field
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
            const newHero = await strapi.entityService.create('api::hero.hero', {
              data: {
                name: hero,
              },
            });
            heroList.push(newHero.id);
          } catch(err) {
            logger.error(`An error occurred on REST comp creation while adding a new hero: ${JSON.stringify(err)}`);
            return ctx.throw(500);
          }
        } else {
          // hero already exists, add its ID to the heroList
          heroList.push(existingHero.id);
        }
      }
    }
    ctx.request.body.data.heroes = heroList;

    // try to create the comp
    try {
      const entity = await strapi.entityService.create('api::comp.comp', ctx.request.body);
      logger.debug(`REST Comp create called with args: ${JSON.stringify(ctx.request.body)}`);
      return entity;
    } catch(err) {
      logger.error(`An error occurred on REST Comp creation: ${JSON.stringify(err)}`);
      return ctx.throw(500);
    }
  },
  async update(ctx) {
    // check that the user is authorized to update the comp
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
        return ctx.throw(403, `You are not authorized to update this entry.`);
      }
    } catch(err) {
      logger.error(`An error occured finding comp on REST Comp update: ${JSON.stringify(err)}`);
      return ctx.throw(500);
    }

    // parse tags field if necessary
    if(ctx.request.body.data.tags) {
      let tagList = [];
      const inputTags = ctx.request.body.data.tags.map(e => e.trim());
      const uniqueTags = [...new Set(inputTags)];
      for(let tag of uniqueTags) {
        if(tag) {
          let [existingTag] = await strapi.entityService.findMany('api::tag.tag', {
            fields: ['id'],
            filters: {
              name: tag,
            },
          });
          if (!existingTag) {
            // tag does not exist yet, add a new tag
            try {
              const newTag = await strapi.entityService.create('api::tag.tag', {
                data: {
                  name: tag,
                },
              });
              tagList.push(newTag.id);
            } catch(err) {
              logger.error(`An error occurred on REST comp update while adding a new tag: ${JSON.stringify(err)}`);
              return ctx.throw(500);
            }
          } else {
            // tag already exists, add its ID to the tagList
            tagList.push(existingTag.id);
          }
        }
      }
      ctx.request.body.data.tags = tagList;
    }

    // parse heroes field if necessary
    if(ctx.request.body.data.heroes) {
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
              const newHero = await strapi.entityService.create('api::hero.hero', {
                data: {
                  name: hero,
                },
              });
              heroList.push(newHero.id);
            } catch(err) {
              logger.error(`An error occurred on REST comp update while adding a new hero: ${JSON.stringify(err)}`);
              return ctx.throw(500);
            }
          } else {
            // hero already exists, add its ID to the heroList
            heroList.push(existingHero.id);
          }
        }
      }
      ctx.request.body.data.heroes = heroList;
    }

    // try to update the comp
    try {
      const response = await super.update(ctx);
      const sanitized_ctx = {method: ctx.request.method, url: ctx.request.url, body: ctx.request.body};
      logger.debug(`REST Comp update called with args: ${JSON.stringify(sanitized_ctx)}`);
      return response;
    } catch(err) {
      logger.error(`An error occured on REST Comp update: ${JSON.stringify(err)}`);
      return ctx.throw(500);
    }
  },
  async delete(ctx) {
    // check that the user is authorized to delete the comp
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
        return ctx.throw(403, `You are not authorized to delete this entry.`);
      }
    } catch(err) {
      logger.error(`An error occured finding comp on REST Comp delete: ${JSON.stringify(err)}`);
      return ctx.throw(500);
    }

    try {
      const response = await super.delete(ctx);
      const sanitized_ctx = {method: ctx.request.method, url: ctx.request.url, body: ctx.request.body};
      logger.debug(`REST Comp delete called with args: ${JSON.stringify(sanitized_ctx)}`);
      return response;
    } catch(err) {
      logger.error(`An error occured on REST Comp delete: ${JSON.stringify(err)}`);
      return ctx.throw(500);
    }
  },
  async getAuthoredComps(ctx) {
    try {
      const comps = await strapi.entityService.findMany('api::comp.comp', {
        fields: ['uuid'],
        filters: { author: { id: ctx.state.user.id } },
      });
      return { data: {comps: comps} };
    } catch (err) {
      logger.error(`An error occurred looking up comps for getAuthoredComps: ${JSON.stringify(err)}`);
      return ctx.throw(500);
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
      return ctx.throw(500);
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
      return ctx.throw(500);
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
      return ctx.throw(500);
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
      logger.error(`An error occurred looking up comp for toggleUpvote: ${JSON.stringify(err)}`);
      return ctx.throw(500);
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
        return { data: {action: 'rm'} };
      } else {
        // user has not upvoted, assume add upvote
        const new_upvoters = comp.upvoters.concat(ctx.state.user);
        await strapi.entityService.update('api::comp.comp', ctx.params.id, {
          data: {
            upvoters: new_upvoters,
          },
        });
        return { data: {action: 'add'} };
      }
    } catch(err) {
      logger.error(`An error occurred modifying comp for toggleUpvote: ${JSON.stringify(err)}`);
      return ctx.throw(500);
    }
  },
}));
