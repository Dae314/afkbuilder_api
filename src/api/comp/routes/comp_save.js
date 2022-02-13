// ./src/api/comp/routes/comp_save.js

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/custom-comps/getallsaved',
      handler: 'comp.getAllSaved',
    },
    {
      method: 'GET',
      path: '/custom-comps/getreceivedsaves',
      handler: 'comp.getReceivedSaves',
    },
    {
      method: 'GET',
      path: '/custom-comps/hassaved/:id',
      config: {
        middlewares: [ 'global::rest_transform_comp_uuid' ],
      },
      handler: 'comp.hasSaved',
    },
    {
      method: 'PUT',
      path: '/custom-comps/togglesave/:id',
      config: {
        middlewares: [ 'global::rest_transform_comp_uuid' ],
      },
      handler: 'comp.toggleSave',
    },
  ]
}
