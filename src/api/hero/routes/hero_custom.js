// ./src/api/hero/routes/hero_custom.js

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/custom-heroes/getallheroes',
      handler: 'hero.getAllHeroes',
    },
  ]
}
