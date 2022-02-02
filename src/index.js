'use strict';

const logger = require('./utilities/logger');

// resolver imports
const { coreCreateMutationResolve, coreUpdateMutationResolve, coreDeleteMutationResolve } = require("./utilities/core-resolvers.js");
const { ApplicationError } = require('@strapi/utils').errors;
const { sanitize } = require("@strapi/utils");

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  // register(/*{ strapi }*/) {},
  register({ strapi }) {
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
              // required for sanitize step
              const { auth } = context.state;

              // sanitize input data
              const compContentType = strapi.contentTypes['api::comp.comp'];
              const compSanitizedInputData = await sanitize.contentAPI.input(
                args.data,
                compContentType,
                { auth }
              );

              // add author field
              const user = context.state.user;
              const author = user.id;
              compSanitizedInputData.author = author;

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
                      const contentType = strapi.contentTypes['api::tag.tag'];
                      const sanitizedInputData = await sanitize.contentAPI.input(
                        { name: tag },
                        contentType,
                        { auth }
                      );
                      const newTag = await strapi.entityService.create('api::tag.tag', {
                        data: sanitizedInputData,
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
              compSanitizedInputData.tags = tagList;

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
                      logger.error(`An error occurred on GQL comp creation while adding a new hero: ${JSON.stringify(err)}`);
                      return new ApplicationError(`An error occurred on GQL comp creation while adding a new hero.`);
                    }
                  } else {
                    // hero already exists, add its ID to the heroList
                    heroList.push(existingHero.id);
                  }
                }
              }
              compSanitizedInputData.heroes = heroList;

              // try to create the comp
              try {
                args.data = compSanitizedInputData;
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
              // required for sanitize step
              const { auth } = context.state;

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
                        const contentType = strapi.contentTypes['api::tag.tag'];
                        const sanitizedInputData = await sanitize.contentAPI.input(
                          { name: tag },
                          contentType,
                          { auth }
                        );
                        const newTag = await strapi.entityService.create('api::tag.tag', {
                          data: sanitizedInputData,
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
        'Mutation.createUsersPermissionsUser': {
          policies: ['global::gql_username_policy'],
        },
        'Mutation.updateUsersPermissionsUser': {
          policies: [
            (policyContext, config, { strapi }) => {
              // policy to ensure that users can only update their own user profile
              return parseInt(policyContext.state.user.id) === parseInt(policyContext.args.id);
            },
            'global::gql_username_policy',
          ],
        },
        'Mutation.createComp': {
          policies: ['global::gql_upvote_policy'],
        },
        'Mutation.updateComp': {
          policies: ['global::gql_author_policy', 'global::gql_upvote_policy'],
        },
        'Mutation.deleteComp': {
          policies: ['global::gql_author_policy'],
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
