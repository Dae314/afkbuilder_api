module.exports = [
  'strapi::errors',
  'strapi::security',
  { name: 'strapi::cors',
    config: {
      origin: ['https://api.afkbuilder.com', 'https://afkbuilder.com', 'https://afkbuilder-strapi.onrender.com', 'http://localhost:5000', 'http://192.168.1.146:5000'],
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
