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
      handler: 'comp.getAuthorProfile',
    }
  ],
};
