// ./src/api/comp/routes/comp_downvote.js

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/custom-comps/getalldownvoted',
      handler: 'comp.getAllDownvoted',
    },
    {
      method: 'GET',
      path: '/custom-comps/getreceiveddownvotes',
      handler: 'comp.getReceivedDownvotes',
    },
    {
      method: 'GET',
      path: '/custom-comps/hasdownvoted/:id',
      config: {
        middlewares: [ 'global::rest_transform_comp_uuid' ],
      },
      handler: 'comp.hasDownvoted',
    },
    {
      method: 'PUT',
      path: '/custom-comps/toggledownvote/:id',
      config: {
        middlewares: [ 'global::rest_transform_comp_uuid' ],
      },
      handler: 'comp.toggleDownvote',
    },
  ]
}
