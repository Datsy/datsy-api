var Faker = require('Faker');
var fs = require('fs');
var _ = require('underscore');

var longitude = -122.419678 + (Math.random()*2-1)*69.078/50
var latitude = 37.7756 + (Math.random()*2-1)*47.259/50
// var hourlyRateArr = ["$10.00-$12.00"]

var makeJobPost = function(){
  var jobPost = {
    employerID: parseInt(Math.random()*10000000000000),
    positionName: Faker.Lorem.words().join(' '),
    duties: Faker.Lorem.paragraph(),
    longitude: -122.419678 + (Math.random()*2-1)*69.078/50,
    latitude: 37.7756 + (Math.random()*2-1)*47.259/50,
    hourlyRate: '$10.00-$12.00',
    employerType: Math.random() > .5 ? 'Agency' : 'Facility',
    yearsExperience: ~~(Math.random()*5),
    positionType: Math.random() > .5 ? 'Full Time' : 'Part Time',
    coords: [], 
    experience: {
      education: String,
      Alzheimers: Math.random() > .5 ? true : false,
      Handicapped: Math.random() > .5 ? true : false,
      Hospice: Math.random() > .5 ? true : false,
      Gastronom: Math.random() > .5 ? true : false,
      Breathing: Math.random() > .5 ? true : false,
      Hoyer: Math.random() > .5 ? true : false,
      SpecialMeal: Math.random() > .5 ? true : false,
      ChildCare: Math.random() > .5 ? true : false,
      Psychiatric: Math.random() > .5 ? true : false,
      Geriatric: Math.random() > .5 ? true : false,
      Homecare: Math.random() > .5 ? true : false,
      AssistedLiving: Math.random() > .5 ? true : false
    }
  }
  jobPost.coords = [jobPost.longitude, jobPost.latitude];
  return jobPost;
}

var makeEmployee = function(){
  var employee = {
      name: Faker.Name.findName(),
      email: Faker.Internet.email(),
      password: Faker.Internet.domainWord(),
      account: Faker.Internet.userName(),
      phone: Faker.PhoneNumber.phoneNumber(),
      accountCreated: Math.random() > .5 ? true : false,
      coords: [], //WHAT TO DO HERE????
      preferences: {
        hourlyRate: '$10.00-$12.00', 
        dailyRate: '$10.00-$12.00',
        jobType: {
          caregiver: Math.random() > .5 ? true : false,
          CHHA: Math.random() > .5 ? true : false,
          STNA: Math.random() > .5 ? true : false,
          PCA: Math.random() > .5 ? true : false,
          LPN: Math.random() > .5 ? true : false,
          CNA: Math.random() > .5 ? true : false
        },
        fullTime: Math.random() > .5 ? true : false,
        longitude: -122.419678 + (Math.random()*2-1)*69.078/50, 
        latitude: 37.7756 + (Math.random()*2-1)*47.259/50, 
        partTime: Math.random() > .5 ? true : false,
        dayShift: Math.random() > .5 ? true : false,
        nightShift: Math.random() > .5 ? true : false,
        weekDays: Math.random() > .5 ? true : false,
        weekEnds: Math.random() > .5 ? true : false,
        homeCare: Math.random() > .5 ? true : false,
        facilityCare: Math.random() > .5 ? true : false,
        workRadius: 10,
        catsOk: Math.random() > .5 ? true : false,
        dogsOk: Math.random() > .5 ? true : false,
        smokeOk: Math.random() > .5 ? true : false,
        lift25ok: Math.random() > .5 ? true : false,
        carAvailable: Math.random() > .5 ? true : false,
        education: Faker.Lorem.sentence(),
        yearsExperience: ~~(Math.random()*5),
        previousEmployerName: Faker.Lorem.words()[0],
        certifications:{
          PCA: Math.random() > .5 ? true : false,
          CHHA: Math.random() > .5 ? true : false,
          CNA: Math.random() > .5 ? true : false,
          LPN: Math.random() > .5 ? true : false
        },
        languages:{
          Arabic: Math.random() > .5 ? true : false,
          Chinese_Cantonese: Math.random() > .5 ? true : false,
          Chinese_Mandarin: Math.random() > .5 ? true : false,
          Farsi: Math.random() > .5 ? true : false,
          Filipino: Math.random() > .5 ? true : false,
          French: Math.random() > .5 ? true : false,
          Greek: Math.random() > .5 ? true : false,
          Hebrew: Math.random() > .5 ? true : false,
          Hindu: Math.random() > .5 ? true : false,
          Italian: Math.random() > .5 ? true : false,
          Japanese: Math.random() > .5 ? true : false,
          Korean: Math.random() > .5 ? true : false,
          Polish: Math.random() > .5 ? true : false,
          Russian: Math.random() > .5 ? true : false,
          Spanish: Math.random() > .5 ? true : false,
          Swahili: Math.random() > .5 ? true : false,
          Vietnamese: Math.random() > .5 ? true : false
        },
        specializations:{
          Alzheimers: Math.random() > .5 ? true : false,
          Handicapped: Math.random() > .5 ? true : false,
          Hospice: Math.random() > .5 ? true : false,
          Gastronomy: Math.random() > .5 ? true : false,
          Breathing: Math.random() > .5 ? true : false,
          Hoyer: Math.random() > .5 ? true : false,
          SpecialMeal: Math.random() > .5 ? true : false,
          ChildCare: Math.random() > .5 ? true : false,
          Psychiatric: Math.random() > .5 ? true : false,
          Geriatric: Math.random() > .5 ? true : false,
          Homecare: Math.random() > .5 ? true : false,
          AssistedLiving: Math.random() > .5 ? true : false,
          Fingerprints: Math.random() > .5 ? true : false,
          AHCALevel2: Math.random() > .5 ? true : false,
          CPR: Math.random() > .5 ? true : false,
          FirstAid: Math.random() > .5 ? true : false,
          BLS: Math.random() > .5 ? true : false,
          TBTest: Math.random() > .5 ? true : false
        },
        idealPatient: Faker.Lorem.sentence(),
        idealWorkEnvironment: Faker.Lorem.paragraph(),
        interests: Faker.Lorem.paragraph(),
        patientMatchScore: ~~(Math.random()*5),
        scheduleMatchScore: ~~(Math.random()*5),
        workCloseToHomeScore: ~~(Math.random()*5),
        workEnvironmentScore: ~~(Math.random()*5),
        employer: Math.random() > .5 ? true : false
      }
  }

  employee.coords = [employee.preferences.longitude, employee.preferences.latitude];
  return employee;
}

// var stream1 = fs.createWriteStream("./fakeJobPost.js");
// stream1.once('open', function(fd) {
//   var temp = {};
  
//   for (var i = 0; i < 100; i++){
//     temp = makeJobPost();
//     stream1.write(JSON.stringify(temp) + "\n");
//   }
//   stream1.end();
// });

var stream2 = fs.createWriteStream("./fakeEmployee.js");
stream2.once('open', function(fd) {
  var temp = {};
  
  for (var i = 0; i < 100; i++){
    temp = makeEmployee();
    stream2.write(JSON.stringify(temp) + "\n");
  }
  stream2.end();
});


//sudo mongoimport -h ds053198.mongolab.com:53198 -d heroku_app18999126 -c jobposts -u heroku_app18999126 -p 41vq5c4pe0bar40m3s7j47hv91 --file fakeJobPost.js 
//sudo mongoexport -h ds053198.mongolab.com:53198 -d heroku_app18999126 -c emailtokens -u heroku_app18999126 -p 41vq5c4pe0bar40m3s7j47hv91 -o emailtokens.json


//mongoimport -h ds053198.mongolab.com:53198 -d heroku_app18999126 -c jobapplicants -u heroku_app18999126 -p 41vq5c4pe0bar40m3s7j47hv91 --file fakeEmployee.js



