module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/custom-comps/getmycomps',
      handler: 'comp.getAuthoredComps',
    },
  ],
};
