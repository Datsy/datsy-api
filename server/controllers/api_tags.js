apiControllers = {
  'init': function(Models) {
    User = Models.User;
    Metadata = Models.Metadata;
    EmailToken = Models.EmailToken;
  },

  getAllTags : function(req, res) {
    console.log("Retrieving all tags...");
    Metadata.Tags.all(function(err, result){
      if(err) {
        res.writeHead(500);
        res.end("500 Internal Server Error error:", err);
      } else {
        console.log("Successfully retrieved all tags.");
        res.writeHead(200);
        res.render('', {}); // create new view?
      }
    });
  }  
}

module.exports = apiControllers;
