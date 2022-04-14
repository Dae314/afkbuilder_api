module.exports = [
  'strapi::errors',
  'strapi::security',
  { name: 'strapi::cors',
    config: {
      origin: ['http://localhost:1337', 'http://localhost:5000', 'http://192.168.1.146:5000'],
    }
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
