var express = require('express');
var router = express.Router();
var session = require('express-session');
const facualtyHelpers = require('../helpers/facualtyHelpers');
const bodyParser = require('body-parser');
const { log } = require('console');
router.use(bodyParser.json());


router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

const verifylogIn=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }
  else{
    res.redirect('/facualty_sign_in')
  }
}

router.post('/sign_in', async (req, res) => {
    console.log(req.body);
    facualtyHelpers.dosignin(req.body).then((response) => {
      message = response.message
      console.log(message);
      if (response.status == true) {
        req.session.loggedIn = true
        req.session.user = response.user
        user = response.user
        if (user.position == 'HOD'){
        user.HOD = true
        }
        else{
          user.HOD = false
        }
        console.log(response.user);
        res.render('Facualty/facualty-home.hbs', { layout: 'Facualty/facualty-layout', user })
      }
      else {
        res.redirect('/facualty_sign_in?message=' + encodeURIComponent(message));
      }
    })
  })
  router.get('/asign_subjects',verifylogIn ,async function (req, res, next) {
    user = req.session.user;
    facualty = await facualtyHelpers.fetchFacualty(user.Department)
    console.log(user);
    console.log(facualty);
    res.render('Facualty/facualty-asign-subject.hbs', { layout: 'Facualty/facualty-layout', user,facualty });
  });

  router.post('/asign_subject/:id',verifylogIn, async(req,res)=>{
    let facId = req.params.id
    subjectAssigned = req.body
    subjectAssigned.id = facId;
    console.log(subjectAssigned);
    console.log(subjectAssigned);
    responsereturned = await facualtyHelpers.assignedSubjects(subjectAssigned);
    if(responsereturned){
      res.redirect('/facualty/asign_subjects')
    }
    else{
    res.status(500).send('Internal Server Error');
    }
  })
  
  router.get('/mark_attendance',verifylogIn ,async function (req, res, next) {
    user = req.session.user;
    console.log(user);
    assignedBatches = await facualtyHelpers.fetchAssignbatches(user._id);
    if (req.session.students){
      if(req.session.batchdetails){
        students = req.session.students;
        batchdetails = req.session.batchdetails;
        console.log(batchdetails);
        res.render('Facualty/facualty-mark-attendance.hbs', { layout: 'Facualty/facualty-layout', user,assignedBatches,students,batchdetails});
      }else{
        res.status(500).send('Error occured to fetch student details');
      }
    }
    else{
       res.render('Facualty/facualty-mark-attendance.hbs', { layout: 'Facualty/facualty-layout', user,assignedBatches});
    }
  });
 
  router.post('/fetchStudents',verifylogIn, async(req,res)=>{
    department = req.session.user.Department;
    batch = req.body.batch;
    students = await facualtyHelpers.fetchStudentforAttendance(batch,department);
    if(students.status){
      batchdetails = await facualtyHelpers.fetchAttendanceDetails(batch,req.session.user._id);
      if (batchdetails){
        assignedBatches = await facualtyHelpers.fetchAssignbatches(user._id);
        req.session.students = students.responseObj;
        req.session.batchdetails = batchdetails[0];
        req.session.batch = batch;
        res.redirect('/facualty/mark_attendance')
      }
    }
    else{
      res.status(500).send('Error occured to fetch student details');
    }
  });

  router.post('/submit_attendance',verifylogIn, async (req,res)=>{
    console.log(req.body);
    let date = req.body.date;
    delete req.body.date;
    Attendance = {
      facualtyId : req.session.user._id,
      facualtyname : req.session.user.fullname,
      department : req.session.user.Department,
      batch : req.session.batch,
      info : {
        semester : req.session.batchdetails.semester.semester,
        hour : req.session.batchdetails.hour.hour,
        subject : req.session.batchdetails.subjects.subject,
        date : date
      },
      attendance : req.body
    }
    console.log(Attendance);
    responses = await facualtyHelpers.submitAttendance(Attendance);
    if(responses){
      delete req.session.batchdetails;
      delete req.session.students;
      delete req.session.batch;
      res.redirect('/facualty/mark_attendance')
    }
    else{
      res.status(500).send('Error occured to mark attendance');
    }
  })
module.exports = router