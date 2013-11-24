myApp.service('workerProfile', function () {
    return {
      preferences: {
        jobType:{},
        certifications: {},
        specializations: {},
        languages: {}
      }};
    })
  .service('workerApplication', function () {
    return {};
    })
  .service('activeProfile', function () {
    return {};
    })
  .service('activeJob', function () {
    return {};
    })
  .factory('serialize',function(){
    return function(obj) {
        var str = [];
        for(var p in obj)
           str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      }
  });