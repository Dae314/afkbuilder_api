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
      path: '/custom-comps/getreceivedupvotes',
      handler: 'comp.getReceivedUpvotes',
    },
    {
      method: 'GET',
      path: '/custom-comps/hasupvoted/:id',
      config: {
        middlewares: [ 'global::rest_transform_comp_uuid' ],
      },
      handler: 'comp.hasUpvoted',
    },
    {
      method: 'PUT',
      path: '/custom-comps/toggleupvote/:id',
      config: {
        middlewares: [ 'global::rest_transform_comp_uuid' ],
      },
      handler: 'comp.toggleUpvote',
    },
  ]
}
