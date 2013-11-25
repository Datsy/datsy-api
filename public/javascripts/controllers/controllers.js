myApp.controller('reg1Ctrl',function($scope,$http, workerApplication, $location){
    $scope.processFormData = function(){
      if($scope.name){
        $scope.error1 = ''
        if($scope.password1===$scope.password2 && $scope.password1){
          $scope.error2 = ''
          if($scope.email){
            workerApplication['name'] = $scope.name;
            workerApplication['password'] = $scope.password1;
            workerApplication['email'] = $scope.email;
            console.log($scope.phone);
            workerApplication['phone'] = $scope.phone;
            $scope.submit();
          } else{$scope.error3 = 'Error: You must enter an email';}
        } else{$scope.error1 = 'Error: Your passwords do not match';}
      }else{$scope.error2 = 'Error: You must enter a name';}
    };

    $scope.submit = function(){
      $http({
        method: 'GET',
        url: '/worker-sign-up/checkEmail', 
        params: {email: workerApplication.email}
      })
        .success(function(data,status){
          if(data === "true"){
            $scope.finalizeSignup();
          }else{
            $scope.error1 = 'Error: that email is already in use'
          }
        });
    };

    $scope.finalizeSignup = function(){
      $http.post('/worker-signup-initial', workerApplication)
        .success(function(data,status){
          $location.path('/verifyEmail');
      });      
    }

  })
  .controller('reg2Ctrl',function($scope,$http, $location, workerProfile){
    $scope.caregiver = false;
    $scope.CHHA = false;
    $scope.STNA = false;
    $scope.PCA = false;
    $scope.LPN = false;
    $scope.CNA = false;
    $scope.doAddress = function(){
      if($scope.cityStateZip){
        var street = $scope.street.replace(/ /g,"+");
        var cityStateZip = $scope.cityStateZip.replace(/ /g,"+");
        $http.get('http://maps.googleapis.com/maps/api/geocode/json?address=' + street + '+' + cityStateZip + '&sensor=true')
          .success(function(data) {
            console.log('http://maps.googleapis.com/maps/api/geocode/json?address=' + street + '+' + cityStateZip + '&sensor=true');
            workerProfile.preferences.latitude = data.results[0].geometry.location.lat;
            workerProfile.preferences.longitude = data.results[0].geometry.location.lng;
          })
      }
    }
    $scope.processFormData = function(){
      try{
        if($scope.hourlyRate) workerProfile.preferences.hourlyRate = parseInt($scope.hourlyRate.replace('$',''));
        if($scope.dailyRate) workerProfile.preferences.dailyRate = parseInt($scope.dailyRate.replace('$',''))
        workerProfile.preferences.jobType.caregiver = $scope.caregiver
        workerProfile.preferences.jobType.CHHA = $scope.CHHA
        workerProfile.preferences.jobType.STNA = $scope.STNA
        workerProfile.preferences.jobType.PCA = $scope.PCA
        workerProfile.preferences.jobType.LPN = $scope.LPN
        workerProfile.preferences.jobType.CNA = $scope.CNA
        workerProfile.preferences.fullTime = $scope.fullTime
        workerProfile.preferences.partTime = $scope.partTime
        workerProfile.preferences.dayShift = $scope.dayShift
        workerProfile.preferences.nightShift = $scope.nightShift
        workerProfile.preferences.weekDays = $scope.weekDays
        workerProfile.preferences.weekEnds = $scope.weekEnds
        workerProfile.preferences.homeCare = $scope.homeCare
        workerProfile.preferences.facilityCare = $scope.facilityCare
        workerProfile.preferences.range = parseInt($scope.range.split(" ")[2])
        workerProfile.preferences.catsOK = $scope.catsOk;
        workerProfile.preferences.dogsOk = $scope.dogsOk;
        workerProfile.preferences.smokeOk = $scope.smokeOk;
        workerProfile.preferences.lift25ok = $scope.lift25ok;
        if($scope.carAvailable === 'yes'){
          workerProfile.preferences.carAvailable = true;
        } else{
          workerProfile.preferences.carAvailable = false;
        }
      }catch(e){}
      
      $scope.doAddress();
      $location.path('/worker-registration3');
    }
    
  })
  .controller('reg3Ctrl',function($scope,$http, $location, workerProfile){
    $scope.processFormData = function(){
      workerProfile.preferences.education = $scope.education;
      try{
        workerProfile.preferences.yearsExperience = $scope.yearsExperience[0];
      }
      catch(e){}
      workerProfile.preferences.employerName = $scope.employerName;
      workerProfile.preferences.certifications.PCA = $scope.PCA;
      workerProfile.preferences.certifications.CHHA = $scope.CHHA;
      workerProfile.preferences.certifications.CNA = $scope.CNA;
      workerProfile.preferences.certifications.LPN = $scope.LPN;
      for(var key in $scope.language){
        workerProfile.preferences.languages[key] = true;
      }
      for(var keys in $scope.spec){
        workerProfile.preferences.specializations[key] = true;
      }
      workerProfile.preferences.patientMatchScore = $scope.patientMatchScore
      workerProfile.preferences.scheduleMatchScore = $scope.scheduleMatchScore
      workerProfile.preferences.workCloseToHomeScore = $scope.workCloseToHomeScore
      workerProfile.preferences.workEnvironmentScore = $scope.workEnvironmentScore


      $location.path('worker-registration4')
    }
  })
  .controller('reg4Ctrl',function($scope,$http, workerProfile, $location){
    $scope.submit = function(){
      workerProfile.preferences.idealPatient = $scope.idealPatient
      workerProfile.preferences.idealWorkEnvironment = $scope.workEnvironment
      workerProfile.preferences.interests = $scope.interests

      $http.post('/worker/worker-updateInfo', workerProfile);
      $location.path('workerPortal')
    }
  })
  .controller('empRegCtrl',function($scope,$http, workerApplication, $location){
    $scope.processFormData = function(){
      if($scope.name){
        $scope.error1 = ''
        if($scope.password1===$scope.password2 && $scope.password1){
          $scope.error2 = ''
          if($scope.email){
            $scope.submit();
          } else{$scope.error3 = 'Error: You must enter an email';}
        } else{$scope.error1 = 'Error: Your passwords do not match';}
      }else{$scope.error2 = 'Error: You must enter a company name';}
    };

    $scope.submit = function(){
      $http({
        method: 'GET',
        url: '/employer-sign-up/checkEmail', //REPLACE WITH CORRECT EMAIL
        params: {email: $scope.email}
      }).success(function(data,status){
        if(data === "true"){
          $scope.finalizeSignup();
        } else{
          $scope.error1 = 'Error: that email is already in use'
        }
      });
    };

    $scope.finalizeSignup = function(){
      employerApplication = {
        name: $scope.name,
        email: $scope.email,
        password: $scope.password1,
        phone: $scope.phone,
        comments: $scope.comments
      }
      $http.post('/employer-signup-initial', employerApplication)
        .success(function(data,status){
          $location.path('/verifyEmail');
      });
    }
  })
  .controller('wPortalCtrl'  ,function($scope, $http, $location, serialize, $rootScope){
    $rootScope.wLoggedIn = true;
    $rootScope.loggedIn = true;
    $scope.getJobData = function(){
      $http.get('/worker/jobPost').success(function(data){
        $scope.jobs = data;
      })
    };
  })
  .controller('ePortalCtrl'  ,function($scope, $http, $location, $rootScope,activeProfile){
    $scope.getJobData = function(){
      $http.get('/employer/jobPost').success(function(data){
        $scope.jobs = data;
      })
    };
    $scope.jobs = $scope.getJobData();
    $rootScope.eLoggedIn = true;
    $rootScope.loggedIn = true;
    $scope.getProfile = function(employee){
      activeProfile.active = employee
      $location.path('/workerProfile');
    }
  })
  .controller('jobListCtrl'  ,function($scope, $http, $location, serialize, activeJob){
    $scope.getJobData = function(){
      $http.get('/worker/allJobPost').success(function(data){
        $scope.jobs = data;
      })
    };

    $scope.getJob = function(job){
      activeJob.job = job;
      $location.path('/jobProfile');
    };

    $scope.search = function(){
      var loc = $scope.loc.replace(/ /g,"+");
      var range = $scope.range.split(' ')[2];
      $http.get('http://maps.googleapis.com/maps/api/geocode/json?address=' + loc +  '&sensor=true')
        .success(function(data) {
          var obj = {};
          obj.range = range;
          if($scope.positionType) obj.positionType = $scope.positionType;
          if($scope.yearsExperience) obj.yearsExperience = $scope.yearsExperience[0];
          obj.lat = data.results[0].geometry.location.lat;
          obj.lng = data.results[0].geometry.location.lng;
          console.log(obj);
          $http.get('/worker/searchJobs?'+serialize(obj), {'aa': '123'})
            .success(function(data){
              $scope.locationLookup
              $scope.jobs = data
          })
      })
    }
    $scope.jobs = $scope.getJobData();
  })
  .controller('employeeListCtrl'  ,function($scope, $http, $location, serialize){
    $scope.search = function(){
      var loc = $scope.loc.replace(/ /g,"+");
      var range = $scope.range.split(' ')[2]
      var positionType = $scope.positionType;
      $http.get('http://maps.googleapis.com/maps/api/geocode/json?address=' + loc +  '&sensor=true')
        .success(function(data) {
          var obj = {};
          obj.range = range;
          obj.lat = data.results[0].geometry.location.lat;
          obj.lng = data.results[0].geometry.location.lng;
          $http.get('/employer/searchEmployees?'+serialize(obj), {'aa': '123'})
            .success(function(data){
              console.log(data);
              $scope.employees = data
          })
      })
    }
    // $scope.jobs = $scope.getJobData();
  })
  .controller('postJobCtrl',function($scope, $http, $location){
    var job = {};
    job.experience = {};
    var longitude, latitude;

    $scope.submit = function(){
      var street = $scope.street.replace(/ /g,"+");
      var cityStateZip = $scope.cityStateZip.replace(/ /g,"+");
      $http.get('http://maps.googleapis.com/maps/api/geocode/json?address=' + street + '+' + cityStateZip + '&sensor=true')
        .success(function(data) {
          console.log('http://maps.googleapis.com/maps/api/geocode/json?address=' + street + '+' + cityStateZip + '&sensor=true');
          latitude = data.results[0].geometry.location.lat;
          longitude = data.results[0].geometry.location.lng;
          $scope.postJob();
        })
    }

    $scope.postJob = function(){
      job.positionName = $scope.positionName;
      job.yearsExperience = $scope.yearsExperience;
      job.hourlyRate = $scope.hourlyRate;
      job.cityState = $scope.cityStateZip;
      job.duties = $scope.duties;
      job.employerType = $scope.employerType;
      job.longitude = longitude;
      job.latitude = latitude;
      job.positionType = $scope.positionType;
      job.experience.education = $scope.education;
      job.experience.Alzheimers = $scope.Alzheimers;
      job.experience.Handicapped = $scope.Handicapped;
      job.experience.Hospice = $scope.Hospice
      job.experience.Gastronomy = $scope.Gastronomy
      job.experience.Breathing = $scope.Breathing;
      job.experience.Hoyer = $scope.Hoyer;
      job.experience.SpecialMeal = $scope.SpecialMeal;
      job.experience.ChildCare = $scope.ChildCare;
      job.experience.Psychiatric = $scope.Psychiatric;
      job.experience.Geriatric = $scope.Geriatric;
      job.experience.Homecare = $scope.Homecare;
      job.experience.AssistedLiving = $scope.AssistedLiving

      $http.post('/employer/jobPost',job).success(function(){
        $location.path('/employerPortal');
      }).error(function(err){
        if(err) console.log(err);
      });
    }
  })
  .controller('wProfileCtrl'  ,function($scope, $http, $location,$route,activeProfile){
      $scope.worker = activeProfile.active;
  })
  .controller('jProfileCtrl'  ,function($scope, $http, $location,$route,activeJob){
      $scope.job = activeJob.job;
  })
  .controller('adminCtrl'  ,function($scope, $http, $location,$route){
    $http.get('/adminPanel').success(function(data){
      $scope.applicants = data.applicants;
      $scope.employers = data.employers;
      $scope.posts = data.posts;
    })
    $scope.deleteItem = function(id,table){
      var data = {'id':id, 'table':table}
      $http.post('/deleteEntry',data)
      $route.reload();
    }
  })
  .controller('logoutCtrl'  ,function($scope, $http, $location,$route, $rootScope){
    $http.get('/logout');
    $rootScope.loggedIn = false;
    $rootScope.wLoggedIn = false;
    $rootScope.eLoggedIn = false;
    $location.path('/');
  })
  .controller('eJobListCtrl'  ,function($scope, $http, $location,$route, $rootScope,activeJob){
    $http.get('/employer/jobPost').success(function(data){
      console.log(data);
      $scope.jobs = data;
    })
    $scope.getJob = function(job){
      activeJob.job = job;
      $location.path('/jobProfile');
    };
  })




