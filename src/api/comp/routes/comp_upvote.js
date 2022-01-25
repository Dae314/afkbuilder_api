// ./src/api/comp/routes/comp_upvote.js

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/custom-comps/getallupvoted',
      handler: 'comp.getAllUpvoted',
    },
    {
      method: 'GET',
      path: '/custom-comps/gettotalupvotes',
      handler: 'comp.getTotalUpvotes',
    },
    {
      method: 'GET',
      path: '/custom-comps/hasupvoted/:id',
      handler: 'comp.hasUpvoted',
    },
    {
      method: 'GET',
      path: '/custom-comps/getupvotes/:id',
      handler: 'comp.getUpvotes',
    },
    {
      method: 'PUT',
      path: '/custom-comps/toggleupvote/:id',
      handler: 'comp.toggleUpvote',
    },
  ]
}
