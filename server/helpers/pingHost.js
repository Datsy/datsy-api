var pingHost = function(target){
  var ping = require('ping');

  var hosts = target; 
  hosts.forEach(function(host){ 
    ping.sys.probe(host, function(isAlive){ 
      var msg = isAlive ? 'host ' + host + ' is alive' : 'ERROR: host ' + host + ' is DEAD!!!'; 
      console.log(msg); 
    }); 
  });
}

module.exports = pingHost;