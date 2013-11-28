var generalMiddleware = function(){
  console.log("hello");
  var result = {
    allowCrossDomain: function(req, res, next) {
      // res.header('Access-Control-Allow-Origin', config.allowedDomains);
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'content-type, accept');
      res.header('access-control-max-age', '10');
      next();
    }
  };

  return result;
};

module.exports = generalMiddleware;
