const logger = require('../utilities/logger');
const { sanitize } = require("@strapi/utils");

module.exports = async (next, parent, args, context, info) => {
  if('tags' in args.data) {
    const { auth } = context.state; // required for sanitize
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
            logger.error(`An error occurred on GQL comp create/update while adding a new tag: ${JSON.stringify(err)}`);
            return context.throw(500, `An error occurred on GQL comp create/update while adding a new tag`);
          }
        } else {
          // tag already exists, add its ID to the tagList
          tagList.push(existingTag.id);
        }
      }
    }
    args.data.tags = tagList;
  }

  return next(parent, args, context, info);
};
