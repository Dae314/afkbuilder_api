// src/utilities/core-resolvers.js
/**
 * This exports the ‘core’ resolve methods extracted/duplicated from
 * @strapi/plugin-graphql. When overwriting the resolve function to add
 * custom business-logic, these methods can be used to trigger the
 * default resolve behavior from within this overwrite.
 *
 * Please note that not all core resolve methods are extracted yet.
 * You can find and extract them from here:
 * - node_modules/@strapi/plugin-graphql/server/services/builders/mutations
 * - node_modules/@strapi/plugin-graphql/server/services/builders/queries
 *
 * I added the `contentTypeName` argument which should contain the
 * contentType identifier ("api::restaurant.restaurant").
 */

const { sanitize } = require("@strapi/utils");

const coreUpdateMutationResolve = async (
  contentTypeName,
  parent,
  args,
  context
) => {
  const { service: getService } = strapi.plugin("graphql");
  const { transformArgs } = getService("builders").utils;
  const { toEntityResponse } = getService("format").returnTypes;

  const contentType = strapi.contentTypes[contentTypeName];
  const { uid } = contentType;

  // Direct copy from here on:
  const { auth } = context.state;
  const transformedArgs = transformArgs(args, { contentType });

  // Sanitize input data
  const sanitizedInputData = await sanitize.contentAPI.input(
    transformedArgs.data,
    contentType,
    { auth }
  );

  Object.assign(transformedArgs, { data: sanitizedInputData });

  const { update } = getService("builders")
    .get("content-api")
    .buildMutationsResolvers({ contentType });

  const value = await update(parent, transformedArgs);

  return toEntityResponse(value, {
    args: transformedArgs,
    resourceUID: uid,
  });
};

const coreCreateMutationResolve = async (
  contentTypeName,
  parent,
  args,
  context
) => {
  const { service: getService } = strapi.plugin("graphql");
  const { transformArgs } = getService("builders").utils;
  const { toEntityResponse } = getService("format").returnTypes;

  const contentType = strapi.contentTypes[contentTypeName];
  const { uid } = contentType;

  // Direct copy from here on:
  // removed Sanitize logic because it would sanitize the author field out of the args
  // const { auth } = context.state;
  const transformedArgs = transformArgs(args, { contentType });

  // Sanitize input data
  // const sanitizedInputData = await sanitize.contentAPI.input(
  //   transformedArgs.data,
  //   contentType,
  //   { auth }
  // );

  // Object.assign(transformedArgs, { data: sanitizedInputData });
  Object.assign(transformedArgs, { data: transformedArgs.data });

  const { create } = getService("builders")
    .get("content-api")
    .buildMutationsResolvers({ contentType });

  const value = await create(parent, transformedArgs);

  return toEntityResponse(value, { args: transformedArgs, resourceUID: uid });
};

const coreDeleteMutationResolve = async (
  contentTypeName,
  parent,
  args
) => {

  const { service: getService } = strapi.plugin("graphql");
  const { transformArgs } = getService("builders").utils;
  const { toEntityResponse } = getService("format").returnTypes;

  const contentType = strapi.contentTypes[contentTypeName];
  const { uid } = contentType;

  // Direct copy from here on:
  const transformedArgs = transformArgs(args, { contentType });

  const { delete: deleteResolver } = getService('builders')
    .get('content-api')
    .buildMutationsResolvers({ contentType });

  const value = await deleteResolver(parent, args);

  return toEntityResponse(value, { args: transformedArgs, resourceUID: uid });
};

module.exports = {
  coreUpdateMutationResolve,
  coreCreateMutationResolve,
  coreDeleteMutationResolve,
};
