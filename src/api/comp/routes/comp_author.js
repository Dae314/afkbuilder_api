module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/custom-comps/getmycomps',
      handler: 'comp.getAuthoredComps',
    },
    {
      method: 'GET',
      path: '/custom-comps/getauthor/:id',
      config: {
        middlewares: [ 'global::rest_transform_username' ],
      },
      handler: 'comp.getAuthorProfile',
    },
    {
      method: 'GET',
      path: '/custom-comps/getcompauthor/:id',
      config: {
        middlewares: [ 'global::rest_transform_comp_uuid' ],
      },
      handler: 'comp.getCompAuthor',
    },
  ],
};
