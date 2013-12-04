var apiDev = function(req, res){
  console.log("In API Dev");
  console.log("User Session", req.session);
  console.log("User object", req.user);

  User.findOne({where:{id:req.user.id}}, function(err, result){
      if (err) {
        console.log("ERROR in saving API key!");
        res.writeHead(500);
        res.end("500 Internal Server Error error:", err);
      } else {
        console.log('Success in finding a user', result);
        result.apikey = apiKey;
        User.upsert(result, function (err, data) {
          if (err){
            console.log('** ERROR in updating user API key **');
            console.log("ERR!!! - ",err);
          } else{
            console.log('** user update with API key is successful ** ');
            res.send(apiKey);
          }
        });
      }
  });
};