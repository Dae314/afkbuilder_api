// ./src/api/comp/routes/comp_author.js

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/comps/getmycomps/:id',
      handler: 'comp.getAuthoredComps',
    },
  ],
}
