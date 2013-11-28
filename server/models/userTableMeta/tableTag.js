var Tabletag = function(schema){
  var Tabletag = schema.define("tabletag", {
    label: {type: "String"}
  });

  return Tabletag;
};

module.exports = Tabletag;
