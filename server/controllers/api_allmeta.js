apiAllMetadataController = {
  'init': function(Models) {
    Metadata = Models.Metadata;
  },

  getAllMetadata : function(req, res) {
    console.log("Retrieving all metadata...");
    var metadata = [];

    var getDatasets = function(req, res) {
      Metadata.Dataset.all(function(err, result){
        if(err) {
          res.writeHead(500);
          console.log("Could not retrieve metadata datasets.");
          res.end("500 Internal Server Error error:", err);
        } else {
          metadata.push(result);
          getTags(req, res);
        }
      });  
    }

    var getTags = function(req, res) {
     Metadata.Tag.all(function(err, result){
       if(err) {
          res.writeHead(500);
          console.log("Could not retrieve metadata tags.");
          res.end("500 Internal Server Error error:", err);
        } else {
          metadata.push(result);
          getColumns(req, res);
        }
      });
    }

    var getColumns = function(req, res) {
      if(err) {
        res.writeHead(500);
        console.log("Could not retrieve metadata columns.");
        res.end("500 Internal Server Error error:", err);
      } else {
        metadata.push(result);
        res.send(metadata);
      }
    });
    getDatasets(req, res);
  }
}
module.exports = apiAllMetadataController;
