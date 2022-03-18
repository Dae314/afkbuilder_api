module.exports = [
  'strapi::errors',
  'strapi::security',
  { name: 'strapi::cors',
    config: {
      origin: ['http://localhost:1337', 'https://api.afkbuilder.com', 'https://afkbuilder.com'],
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
