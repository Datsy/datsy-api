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

    if (!req.query.tag) {

      // No tags specified, so get all

      Dataset.findAll({
        include: [Tag],
      }).success(function(datasets) {
        createResult(res, datasets, []);
      });

/*
      Tag.findAll({
        include: [Dataset],
        attributes: ['Tags.id', 'Tags.label', 'Datasets.id']
      }).success(function(tags) {
        createResult(res, tags);  // Add dataset count and respond
      });
*/

    } else {

      if (typeof req.query.tag === 'string') {
        req.query.tag = [ req.query.tag ];
      }

      Dataset.findAll({
        include: [Tag],
        where: { 'Tags.label': req.query.tag }
      }).success(function(datasets) {
        createResult(res, datasets, req.query.tag);
      });

/*
        Tag.findAll({
          where: { label: req.query.tag },
          include: [Dataset],
          attributes: ['Tags.id', 'Tags.label', 'Datasets.id']
        }).success(function(tags) {
        console.log(tags[0].datasets);
          createResult(res, tags, req.query.tag);  // Add dataset count and respond
        });
*/

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
