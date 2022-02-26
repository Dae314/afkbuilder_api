// ./src/api/tag/routes/tag_custom.js

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/custom-tags/getalltags',
      handler: 'tag.getAllTags',
    },
  ]
}
