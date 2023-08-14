var express = require('express');
var router = express.Router();
var session = require('express-session')
var adminHelpers = require('../helpers/adminHelpers')
const multer = require('multer');
const upload = multer();
const fs = require('fs');
const fileUpload = require('express-fileupload');
const { log } = require('console');



const verifylogIn=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }
  else{
    res.redirect('/admin')
  }
}

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

router.post('/sign_up_admin', async (req, res) => {
  console.log(req.body);
  try {
    const response = await adminHelpers.dosignup(req.body);
    if (response.status) {
    } else {
      res.redirect('/sign_up_admin');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/sign_in_admin', async (req, res) => {
  adminHelpers.dosignin(req.body).then((response) => {
    message = response.message
    console.log(message);
    if (response.status == true) {
      req.session.loggedIn = true
      req.session.user = response.user
      console.log(response.user);
      user = response.user
      res.render('Admin/admin-home.hbs', { layout: 'Admin/admin-layout', user })
    }
    else {
      res.redirect('/admin?message=' + encodeURIComponent(message));
    }
  })
})


router.get('/profile', verifylogIn, function (req, res, next) {
  user = req.session.user
  console.log(user);
  res.render('Admin/admin-profile.hbs', { layout: 'Admin/admin-layout', user });
});

router.get('/student_registraion',verifylogIn,async function (req, res, next) {
  user = req.session.user
  departments = await adminHelpers.fetchDepartment();
  console.log(user);
  res.render('Admin/admin-student-registration.hbs', { layout: 'Admin/admin-layout', user,departments });
});


router.post('/register_student', async (req, res) => {
  console.log(req.body);
  const photo = req.files.photo;
  const sign = req.files.sign;
  responseObject = await adminHelpers.registerStudent(req.body);
  console.log(responseObject.id);
  if(responseObject.status){
  photo.mv('./public/student/photo/' + responseObject.id + 'photo.jpg', (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Photo uploaded successfully');
      sign.mv('./public/student/sign/' + responseObject.id + 'sign.jpg', (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Sign uploaded successfully');

          res.redirect('/admin/student_registraion');
        }
      });
    }
  });
}
else{
  res.status(500).send('Admission No alredy exisit');
}
});


router.get('/department_registration',verifylogIn, function (req, res, next) {
  user = req.session.user
  console.log(user);
  res.render('Admin/admin-add-department.hbs', { layout: 'Admin/admin-layout', user });
});

router.post('/register_department',async (req,res)=>{
  console.log(req.body);
  responseObject = await adminHelpers.registetdepartent(req.body);
  console.log(responseObject);
  if(responseObject.status){
      res.redirect('/admin/department_registration')
  }
  else{
  res.status(500).send(responseObject.message);
  }
})


router.get('/facualty_registration',verifylogIn,async function (req, res, next) {
  user = req.session.user
  console.log(user);
  departments = await adminHelpers.fetchDepartment();
  res.render('Admin/admin-facualty-registration.hbs', { layout: 'Admin/admin-layout', user,departments });
});

router.post('/register_facualty', async (req, res) => {
  console.log(req.body);
  const photo = req.files.photo;
  const sign = req.files.sign;
  responseObject = await adminHelpers.registerStudent(req.body);
  console.log(responseObject.id);
  if(responseObject.status){
  photo.mv('./public/facualty/photo/' + responseObject.id + 'photo.jpg', (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Photo uploaded successfully');
      sign.mv('./public/facualty/sign/' + responseObject.id + 'sign.jpg', (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Sign uploaded successfully');

          res.redirect('/admin/facualty_registration');
        }
      });
    }
  });
}
else{
  res.status(500).send(responseObject.message);
}
});


module.exports = router;