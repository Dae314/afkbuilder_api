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
      handler: 'comp.hasSaved',
    },
    {
      method: 'PUT',
      path: '/custom-comps/togglesave/:id',
      handler: 'comp.toggleSave',
    },
  ]
}
