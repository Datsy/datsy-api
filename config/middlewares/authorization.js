var JobApplicant = require('../../app/models/jobApplicant');

exports.isAuthenticated = function (req, res, next){
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect("/worker-login");
    }
}

exports.jobApplicantExist = function(req, res, next) {
    JobApplicant.count({
        email: req.body.email
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            res.redirect("/worker-signup");
        }
    });
}