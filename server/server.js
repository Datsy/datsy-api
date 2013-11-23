var express = require('express');

var app = express();

// Log requests
app.use(express.logger('short'));

// Get the port from environment variables
var port = process.env.PORT || 3000;

app.listen(port);

console.log('Server running on port %d', port);
