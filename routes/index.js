var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.hbs',{layout :'layout'});
});




router.get('/admin', function(req, res, next) {
  var message = req.query.message;
  res.render('Sign-in/admin-sign-in.hbs',{layout :'layout',message});
});

router.get('/student_sign_in', function(req, res, next) {
  res.render('Sign-in/student-sign-in.hbs',{layout :'layout'});
});

router.get('/facualty_sign_in', function(req, res, next) {
  res.render('Sign-in/facualty-sign-in.hbs',{layout :'layout'});
});


module.exports = router;
