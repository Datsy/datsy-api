module.exports = function(app, passport, Models){
  //var api_tags = require('../controllers/api_tags.js');
  //app.get('/tags', api_tags.getAllTags);

  var api = require('../controllers/api.js')(Models);

  app.get('/search/tag', api.getTags);
};
