const {logger} = require('../utilities/logger');
const { sanitize } = require("@strapi/utils");

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    if('tags' in ctx.request.body.data) {
      const { auth } = ctx.state; // required for sanitize
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
              logger.error(`An error occurred on REST comp create/update while adding a new tag: ${JSON.stringify(err)}`);
              return ctx.throw(500, `An error occurred on REST comp create/update while adding a new tag.`);
            }
          } else {
            // tag already exists, add its ID to the tagList
            tagList.push(existingTag.id);
          }
        }
      }
      ctx.request.body.data.tags = tagList;
    }

    return next();
  };
};
