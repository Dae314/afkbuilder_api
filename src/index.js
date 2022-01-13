'use strict';

const session = require("koa-session2"); // required import for oauth
const logger = require('./utilities/logger');

// resolver imports
const { coreCreateMutationResolve, coreUpdateMutationResolve, coreDeleteMutationResolve } = require("./utilities/core-resolvers.js");
const { ForbiddenError } = require('@strapi/utils').errors;

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

    extensionService.use({
      resolvers: {
        Mutation: {
          createComp: {
            resolve: async (parent, args, context) => {
              const user = context.state.user;
              const author = user.id;
              args.data.author = author;
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
              }
            },
          },
          updateComp: {
            resolve: async (parent, args, context) => {
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
              }
            },
          },
          deleteComp: {
            resolve: async (parent, args, context) => {
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
              }
            },
          },
        },
      },
      resolversConfig: {
        'Mutation.updateUsersPermissionsUser': {
          policies: [
            (policyContext, config, { strapi }) => {
              return parseInt(policyContext.state.user.id) === parseInt(policyContext.args.id);
            }
          ],
        },
      },
    });
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
