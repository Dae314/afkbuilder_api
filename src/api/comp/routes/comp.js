'use strict';

/**
 * comp router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::comp.comp', {
  config: {
    create: {
      middlewares: [ 'global::rest_comp_tags', 'global::rest_comp_heroes' ],
    },
    update: {
      middlewares: ['global::rest_comp_tags', 'global::rest_comp_heroes' ],
    }
  }
});
