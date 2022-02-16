'use strict';

const logger = require('./utilities/logger');
const {calcScore} = require('./utilities/calcScore');
// const GraphQLJSON = require('graphql-type-json');

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

              // add initial score
              const score = calcScore({
                upvotes: 0,
                downvotes: 0,
                saves: 0,
                updatedAt: args.data.comp_update
              });
              compSanitizedInputData.score = score;

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
        'Mutation.deleteUsersPermissionsUser': {
          policies: ['global::gql_profile_owner_policy'],
        },
        'Mutation.updateUsersPermissionsUser': {
          policies: ['global::gql_profile_owner_policy', 'global::gql_username_policy'],
        },
        'Mutation.createComp': {
          policies: ['global::gql_score_policy'],
          middlewares: ['global::gql_comp_tags', 'global::gql_comp_heroes']
        },
        'Mutation.updateComp': {
          policies: ['global::gql_author_policy', 'global::gql_score_policy'],
          middlewares: ['global::gql_comp_tags', 'global::gql_comp_heroes', 'global::gql_comp_update_score'],
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

/***********************************************
                     ⢀⣠⣴⣶⣾⣿⣿⣿⣿⣶⣄
                    ⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧
                  ⡔⠉⠙⠻⡟⠛⠛⠛⠛⠿⣿⠻⣿⣿⣿⣿
                ⠈⡄⢢              ⣨⣿⣿⠃
⣷⣄             ⢰⣿⣆⡁    ⠠⠤⢤⣤⣀   ⠰⡁
⣿⣿⣷⣦⣀⣀⡀    ⣾⣿⣿⡿   ⠠⠊⠁  ⠊   ⡗⠒⠁　Y-a-Y
⠟⢻⢟⠒⢦⠤⣈⠑⠒⣿⣿⣿⣇        ⣀⣤⣄⣠⡤⠜
 ⢞⠢⣉⡒⠉   ⢱⢸⣿⣿⣿⣦⡴⠋⣿⣿⣿⣿ ⡴⠛⣿⡇
 ⢸⠉⠒⠧⢀⣀⠔⠁⠘⣿⣿⣿⣿⣧  ⠸⣿⣿⣿⣷⣤⣾⡿⠁
⢠⠚   ⢠⠋⢹   ⢸⠒⠻⣿⣿⣿⣿  ⠙⠻⠿⠿⠛⠁
⠇   ⡎⢠⡾    ⣸⡤  ⣿⣿⣿⣿
   ⢰⠁⢸⡇    ⣿⣤⣴⣿⣿⣿⠟
   ⠸⡀⠈⡇    ⠘⡟⠛⠋⡏⠁
⠢⠤⠤⠜⠉⢧⣀⣀⣀⡸ ⠒⠒⠁
************************************************/
