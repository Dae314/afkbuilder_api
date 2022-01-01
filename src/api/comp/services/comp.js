'use strict';

/**
 * comp service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::comp.comp');
