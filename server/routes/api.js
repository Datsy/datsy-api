module.exports = function(app, passport, Models){
  var api_tags   = require('../controllers/api_tags.js');
  var api_search = require('../controllers/api_allmeta.js');

  app.get('/tags',        api_tags.getAllTags);
  app.get('/search/meta', api_allmeta.getAllMetadata);
};
