module.exports = [
  'strapi::errors',
  'strapi::security',
  { name: 'strapi::cors',
    config: {
      origin: ['https://api.afkbuilder.com', 'https://afkbuilder.com', 'https://afkbuilder-strapi.onrender.com'],
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
