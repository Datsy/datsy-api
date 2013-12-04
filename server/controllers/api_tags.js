apiControllers = {
  'init': function(Models) {
    User = Models.User;
    Metadata = Models.Metadata;
    EmailToken = Models.EmailToken;
  },

  'getAllTags' : function(req, res) {
    console.log("Retrieving all tags...");
    Metadata.Tags.all(function(err, result){
      if(err) {
        res.send("500 Internal Server Error error:", err);
      } else {
        console.log("Successfully retrieved all tags.");
        res.send(result);
      }
    });
  }  
}

module.exports = apiControllers;
