'use strict';

const session = require("koa-session2"); // required import for oauth

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
                return resolver
              } catch(err) {
                console.log(err);
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
                return new ForbiddenError(`You are not authorized to update this entry.`);
              }
              return await coreUpdateMutationResolve(
                "api::comp.comp",
                parent,
                args,
                context
              );
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
                return new ForbiddenError(`You are not authorized to delete this entry.`);
              }
              return await coreDeleteMutationResolve(
                "api::comp.comp",
                parent,
                args
              );
            },
          },
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
