var Metadata = require('./server/models/metadataModel.js'),
    json = require('./test.json');

setTimeout(function() {
  Metadata.saveDataset(json);
}, 3000);
