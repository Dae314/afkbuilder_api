// ./src/api/comp/routes/comp_upvote.js

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/comps/hasupvoted/:id',
      handler: 'comp.hasUpvoted',
    },
    {
      method: 'GET',
      path: '/comps/getupvotes/:id',
      handler: 'comp.getUpvotes',
    },
    {
      method: 'PUT',
      path: '/comps/toggleupvote/:id',
      handler: 'comp.toggleUpvote',
    },
  ]
}
