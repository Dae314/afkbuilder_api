'use strict';

const session = require("koa-session2"); // required import for oauth
const logger = require('./utilities/logger');

// resolver imports
const { coreCreateMutationResolve, coreUpdateMutationResolve, coreDeleteMutationResolve } = require("./utilities/core-resolvers.js");
const { ForbiddenError, ApplicationError } = require('@strapi/utils').errors;

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  // register(/*{ strapi }*/) {},
  register({ strapi }) {
    // required snippet for oauth
    strapi.server.use(session({
      secret: "grant",
    }));

    const extensionService = strapi.plugin("graphql").service("extension");

    extensionService.use(({ nexus }) => ({
      types: [
        nexus.extendType({
          type: 'UsersPermissionsMe',
          definition(t) {
            // expose custom user fields
            t.string('my_heroes');
            t.string('local_comps');
          },
        }),
      ],
      resolvers: {
        Mutation: {
          createComp: {
            resolve: async (parent, args, context) => {
              // add author field
              const user = context.state.user;
              const author = user.id;
              args.data.author = author;

              // parse tags field
              let tagList = [];
              const inputTags = args.data.tags.map(e => e.trim());
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
                      logger.error(`An error occurred on GQL comp creation while adding a new tag: ${JSON.stringify(err)}`);
                      return new ApplicationError(`An error occurred on GQL comp creation while adding a new tag.`);
                    }
                  } else {
                    // tag already exists, add its ID to the tagList
                    tagList.push(existingTag.id);
                  }
                }
              }
              args.data.tags = tagList;

              // parse heroes field
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
                      const newHero = await strapi.entityService.create('api::hero.hero', {
                        data: {
                          name: hero,
                        },
                      });
                      heroList.push(newHero.id);
                    } catch(err) {
                      logger.error(`An error occurred on GQL comp creation while adding a new hero: ${JSON.stringify(err)}`);
                      return new ApplicationError(`An error occurred on GQL comp creation while adding a new hero.`);
                    }
                  } else {
                    // hero already exists, add its ID to the heroList
                    heroList.push(existingHero.id);
                  }
                }
              }
              args.data.heroes = heroList;

              // try to create the comp
              try {
                const resolver = await coreCreateMutationResolve(
                  "api::comp.comp",
                  parent,
                  args,
                  context
                );
                logger.debug(`GQL Comp create called with args: ${JSON.stringify(args)}`);
                return resolver
              } catch(err) {
                logger.error(`An error occurred on GQL Comp creation: ${JSON.stringify(err)}`);
                return new ApplicationError(`An error occurred on GQL Comp creation.`);
              }
            },
          },
          updateComp: {
            resolve: async (parent, args, context) => {
              // check that the user is authorized to update the comp
              try {
                const [comp] = await strapi.entityService.findMany('api::comp.comp', {
                  fields: ['name'],
                  filters: {
                    id: args.id,
                    author: context.state.user.id,
                  },
                });
                if (!comp) {
                  logger.error(`A forbidden error occurred on GQL Comp update: ${JSON.stringify(args)}`);
                  return new ForbiddenError(`You are not authorized to update this entry.`);
                }
              } catch(err) {
                logger.error(`An error occured on GQL Comp update while finding comp: ${JSON.stringify(err)}`);
                return new ApplicationError(`An error occured GQL Comp update while finding comp.`);
              }

              // parse tags field if necessary
              if(args.data.tags) {
                let tagList = [];
                const inputTags = args.data.tags.map(e => e.trim());
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
                        logger.error(`An error occurred on GQL comp update while adding a new tag: ${JSON.stringify(err)}`);
                        return new ApplicationError(`An error occurred on GQL comp update while adding a new tag.`);
                      }
                    } else {
                      // tag already exists, add its ID to the tagList
                      tagList.push(existingTag.id);
                    }
                  }
                }
                args.data.tags = tagList;
              }

              // parse heroes field if necessary
              if(args.data.heroes) {
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
                        const newHero = await strapi.entityService.create('api::hero.hero', {
                          data: {
                            name: hero,
                          },
                        });
                        heroList.push(newHero.id);
                      } catch(err) {
                        logger.error(`An error occurred on GQL comp update while adding a new hero: ${JSON.stringify(err)}`);
                        return new ApplicationError(`An error occurred on GQL comp update while adding a new hero.`);
                      }
                    } else {
                      // hero already exists, add its ID to the heroList
                      heroList.push(existingHero.id);
                    }
                  }
                }
                args.data.heroes = heroList;
              }

              // try to update the comp
              try {
                const resolver = await coreUpdateMutationResolve(
                  "api::comp.comp",
                  parent,
                  args,
                  context
                );
                logger.debug(`GQL Comp update called with args: ${JSON.stringify(args)}`);
                return resolver;
              } catch(err) {
                logger.error(`An error occurred on GQL Comp update: ${JSON.stringify(err)}`);
                return new ApplicationError(`An error occurred on GQL Comp update.`);
              }
            },
          },
          deleteComp: {
            resolve: async (parent, args, context) => {
              // check that the user is authorized to delete the comp
              try {
                const [comp] = await strapi.entityService.findMany('api::comp.comp', {
                  fields: ['name'],
                  filters: {
                    id: args.id,
                    author: context.state.user.id,
                  },
                });
                if (!comp) {
                  logger.error(`A forbidden error occurred on GQL Comp delete: ${JSON.stringify(args)}`);
                  return new ForbiddenError(`You are not authorized to delete this entry.`);
                }
              } catch(err) {
                logger.error(`An error occured on GQL Comp delete while finding comp: ${JSON.stringify(err)}`);
                return new ApplicationError(`An error occured on GQL Comp delete while finding comp.`);
              }

              // try to delete the comp
              try {
                const resolver = await coreDeleteMutationResolve(
                  "api::comp.comp",
                  parent,
                  args
                );
                logger.debug(`GQL Comp delete called with args: ${JSON.stringify(args)}`);
                return resolver;
              } catch(err) {
                logger.error(`An error occurred on GQL Comp delete: ${JSON.stringify(err)}`);
                return new ApplicationError(`An error occured on GQL Comp delete.`);
              }
            },
          },
        },
      },
      resolversConfig: {
        'Mutation.updateUsersPermissionsUser': {
          policies: [
            (policyContext, config, { strapi }) => {
              // policy to ensure that users can only update their own user profile
              return parseInt(policyContext.state.user.id) === parseInt(policyContext.args.id);
            }
          ],
        },
      },
    }));
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/*{ strapi }*/) {},
};
