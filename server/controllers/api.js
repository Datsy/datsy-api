var User, Dataset, Tag, Column,
    models, schema,
    apiControllers;

apiControllers = {

  'getTags': function(req, res) {

    // Helper function to get the number of datasets associated with a set of tags

    var createResult = function(res, datasets, queryTags) {

      var result = {};
      result.tag = [];
      result.total = 0;


      // Count the datasets that are associated with all queried tags

      var datasetIds = [];

      for (var j = 0; j < datasets.length; j++) {
        if (datasets[j].tags.length === queryTags.length) {
          result.total++;
          datasetIds.push(datasets[j].id);
        }
      }


      // Save all unique tags that are in the resulting datasets

      Dataset.findAll({
        where: { id: datasetIds },
        include: [Tag],
        attributes: ['Datasets.id', 'Tags.label']
      }).success(function(datasets) {

        var seen = {};

        for (var j = 0; j < datasets.length; j++) {
          var dataset = datasets[j];
          for (var k = 0; k < dataset.tags.length; k++) {
            var tag = dataset.tags[k];
            if(!seen[tag.label]) {
              seen[tag.label] = true;
              result.tag.push(tag.label);
            }
          }
        }

        res.send(result);
      });

    };


    // Select datasets that match one or more of the tags
    // (or all if no tags are specified)

    if (!req.query.tag) {

      var result = {};
      result.tag = [];
      result.total = 0;


      // No tags specified, so get all tags and count all datasets

      Tag.findAll({
        attributes: ['label']
      }).success(function(tags) {
        for (var i = 0; i < tags.length; i++) {
          result.tag.push(tags[i].label);
        }

        Dataset.count().success(function(datasets) {
          result.total = datasets;
          res.send(result);
        });
      });

    } else {


      // One or more tags specified, so get only those that match at least one

      if (typeof req.query.tag === 'string') {
        req.query.tag = req.query.tag.toLowerCase();
        req.query.tag = [ req.query.tag ];
      } else {
        for (var j = 0; j < req.query.tag.length; j++) {
          req.query.tag[j] = req.query.tag[j].toLowerCase();
        }
      }

      Dataset.findAll({
        include: [Tag],
        where: { 'Tags.label': req.query.tag }
      }).success(function(datasets) {
        createResult(res, datasets, req.query.tag);
      });

    }
  }
};

module.exports = function(Models) {
  User = Models.User;
  Dataset = Models.Dataset;
  Tag = Models.Tag;
  Column = Models.Column;
  models = Models;
  schema = Models.sequelize;

  return apiControllers;
};






/*
      // Get the number of datasets that are associated with the queried tags

      var whereOptions = '';
      for (var i = 0; i < queriedTags.length; i++) {
        if (i === queriedTags.length-1) {
          whereOptions += '"TagId"=' + queriedTags[i].id;
        } else {
          whereOptions += '"TagId"=' + queriedTags[i].id + ' OR ';
        }
      }

      schema.query('SELECT count(*) FROM "DatasetsTags" WHERE ' + whereOptions + ';')
        .success(function(tagCount) {
          result.total = parseInt(tagCount[0].count);
          res.send(result);
        });
*/
