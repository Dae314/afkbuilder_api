'use strict';

/**
 * comp router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::comp.comp', {
  config: {
    create: {
      middlewares: [ 'global::rest_comp_tags', 'global::rest_comp_heroes' ],
      policies: ['global::rest_score_policy'],
    },
    update: {
      middlewares: ['global::rest_comp_tags', 'global::rest_comp_heroes'],
      policies: ['global::rest_author_policy','global::rest_score_policy'],
    },
    delete: {
      policies: ['global::rest_author_policy'],
    }
  }
});
