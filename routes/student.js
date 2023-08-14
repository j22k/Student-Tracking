var express = require('express');
var router = express.Router();
var session = require('express-session')
var studentHelpers = require('../helpers/studentHelpers')
const Handlebars = require('handlebars');

const verifylogIn = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  }
  else {
    res.redirect('/student_sign_in')
  }
}

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

router.post('/sign_in', async (req, res) => {
  console.log(req.body);
  studentHelpers.dosignin(req.body).then((response) => {
    message = response.message
    console.log(message);
    if (response.status == true) {
      req.session.loggedIn = true
      req.session.user = response.user
      console.log(response.user);
      user = response.user
      res.render('Student/student-home.hbs', { layout: 'Student/student-layout', user })
    }
    else {
      res.redirect('/student_sign_in?message=' + encodeURIComponent(message));
    }
  })
})

router.get('/profile', verifylogIn, async function (req, res, next) {
  user = req.session.user
  console.log(user);
  res.render('Student/student-profile.hbs', { layout: 'Student/student-layout', user });
});

Handlebars.registerHelper('eq', function (a, b, options) {
  return a == b ? options.fn(this) : options.inverse(this);
});

router.get('/view_attendance_by_date', verifylogIn, async function (req, res, next) {
  user = req.session.user
  console.log(user);
  
  attendance = await studentHelpers.fetchAttendance(req.session.user.year, req.session.user.Department, req.session.user._id);
  console.log(attendance);
 
  console.log(attendance[1].att);
  attendance.forEach(element => {
    element.att.forEach(item => {
      if (item.hour) {
        if (!element[item.hour]) {
          element[item.hour] = {};
        }
        element[item.hour][item.hour + '.name'] = item.facualtyname;
        element[item.hour][item.hour + '.subject'] = item.subject;
        element[item.hour][item.hour + '.check'] = item.atte;
        delete item.hour;
      }
    });
    delete attendance.att;
  });
  
  console.log(attendance[1].att);

  console.log(attendance);
  
  if (attendance) {
    res.render('Student/student-view-attendance.hbs', { layout: 'Student/student-layout', user, attendance });
  }
  else {
    res.status(500).send('Could not fetch attendance from server');
  }
});

router.get('/view_attendance_by_hour',verifylogIn ,async (req,res,next)=>{
  id = req.session.user._id;

  result = await studentHelpers.fetchAttByHour(id);
  let attendance ={}

  result.forEach(element =>{
    attendance.total = element.total;
    attendance.attended = element.final;
    attendance.percentage = (element.final/element.total)*100;
  })
  console.log(attendance);
  if(attendance){
    res.render('Student/student-view-attendance-hour.hbs',{ layout: 'Student/student-layout',attendance})
  }
})
module.exports = router;