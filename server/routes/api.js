module.exports = function(app, passport, Models){
  var api_tags = require('../controllers/api_tags.js');
  // var api_search = require('../controllers/api_search.js');

  app.get('/tags', api_tags.getAllTags);
};
