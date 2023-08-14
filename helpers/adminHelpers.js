const { response } = require('express');
const collections = require('../config/collections');
const { getDatabase } = require('../config/connection');
const db = require('../config/connection');
const bcrypt = require('bcrypt');

module.exports = {
  dosignup: async (adminData) => {
    var status = false;
    try {
      const salt = await bcrypt.genSalt(10);
      const hashpass = await bcrypt.hash(adminData.password, salt);
      adminData.password = hashpass;

      const db = getDatabase();
      const response = await db.collection(collections.ADMIN).insertOne(adminData);

      if (response.insertedCount === 1) {
        console.log('New account for admin created successfully');
        status = true;
        return true;
      } else {
        console.log("Couldn't create account");
        return false;
      }
    } catch (err) {
      console.log(err);
      throw new Error('Unable to create account');
    }
  },
  dosignin: async (adminData) => {
    try {
      const db = getDatabase();
      const user = await db.collection(collections.ADMIN).findOne({ username: adminData.username });

      if (!user) {
        return { status: false, message: 'Invalid username ' };
      }

      const matched = await bcrypt.compare(adminData.password, user.password);

      if (matched) {
        delete user.password;
        console.log("User found");
        return { status: true, user: user };
      } else {
        return { status: false, message: 'Invalid password' };
      }
    } catch (err) {
      console.log(err);
      throw new Error('Unable to sign in');
    }
  },

  registerStudent: async (studentData, callback) => {
    var checkadmissionno = false;
    let response = {}
    try {
      const db = getDatabase();
      //ckecks if there any addmission no with same 

      try {
        checkadmissionno = await db.collection(collections.STUDENT).findOne({ admissionnumber: studentData.admissionnumber })
        console.log(checkadmissionno);
      }
      catch (err) {
        console.log(err);
        throw new Error('adminsiono chech err ');
      }
      if (checkadmissionno) {
        console.log("Adminssio number already exisit");
        response.status = false
        console.log(response);
        return response;
      }
      else {
        //Add Roll No 

        let RollNo = 1;
        const RetrieveRollNo = await db.collection(collections.STUDENT).aggregate([
          {
            $match: { year: studentData.year, Department: studentData.Department }
          },
          {
            $group: { _id: { year: "$year", Department: "$Department" }, RollNo: { $max: "$RollNo" } }
          }
        ]).toArray();

        if (RetrieveRollNo && RetrieveRollNo.length > 0) {
          RollNo = RetrieveRollNo[0].RollNo;
          console.log(`Retrieved RollNo: ${RollNo}`);
          RollNo += 1;
        } else {
          console.log("No RollNo found for the given criteria.");
        }
        studentData.RollNo = RollNo;
        console.log(RollNo)
        console.log(studentData);

        //add username and password

        studentData.username = studentData.admissionnumber

        //bcrypt password

        const salt = await bcrypt.genSalt(10);
        const hashpass = await bcrypt.hash(studentData.admissionnumber, salt);
        studentData.password = hashpass;

        console.log(studentData);
        // register studetnt

        const student = await db.collection(collections.STUDENT).insertOne(studentData);
        console.log(student);
        response.id = student.insertedId;
        response.status = true;
        console.log(response);
        if (student) {
          return response;
        }
        else {
          console.log("unable to register");
        }
      }
    }
    catch (err) {
      console.log(err);
      throw new Error('Unable to register Student ');
    }
  },
  registetdepartent: async (departmentData) => {
    var ckeckdepartment = false;
    var status = false;
    try {
      const db = getDatabase();
      ckeckdepartment = await db.collection(collections.DEPARTMENTS).findOne({ departmentname: departmentData.departmentname })
      console.log(ckeckdepartment);
    }
    catch (err) {
      console.log(err);
      return {status : false ,message : 'department chech err'};
    }
    if (ckeckdepartment) {
      console.log("department number already exisit");
      return {status,message : 'department number already exisit'}
    } else {
      try {
        const db = getDatabase();
        const response = await db.collection(collections.DEPARTMENTS).insertOne(departmentData);
        console.log(response);

        if (response ) {
          console.log('department added successfully');
          return {status : true,message : 'department added successfully'};
        } else {
          console.log("Couldn't add department");
          return {status : false,message : 'Couldnt add department'};
        }
      } catch (err) {
        console.log(err);
        return {status : false,message : 'Unable to add department'}
      }
    }
  },
  fetchDepartment : async()=>{
    try {
      const db = getDatabase();
      responseObj = await db.collection(collections.DEPARTMENTS).find({}).toArray();
      console.log(responseObj);
      return responseObj
    }
    catch (err) {
      console.log(err);
      return {status : false ,message : 'department chech err'};
    }
  },
  registerStudent: async (facualtyData, callback) => {
    var checkafacualtyno = false;
    let response = {}
    try {
      const db = getDatabase();
      //ckecks if there any addmission no with same 

      try {
        checkafacualtyno = await db.collection(collections.FACUALTY).findOne({ facualtynumber: facualtyData.facualtynumber })
        console.log(checkafacualtyno);
      }
      catch (err) {
        console.log(err);
        throw new Error('adminsiono chech err ');
      }
      if (checkafacualtyno) {
        console.log("Adminssio number already exisit");
        response.status = false
        response.message = 'Admission number already exist'
        console.log(response);
        return response;
      }
      else {
       

        //add username and password

        facualtyData.username = facualtyData.phoneNo

        //bcrypt password

        const salt = await bcrypt.genSalt(10);
        const hashpass = await bcrypt.hash(facualtyData.facualtynumber, salt);
        facualtyData.password = hashpass;

        console.log(facualtyData);
        // register studetnt

        const facualty = await db.collection(collections.FACUALTY).insertOne(facualtyData);
        console.log(facualty);
        response.id = facualty.insertedId;
        response.status = true;
        console.log(response);
        if (facualty) {
          return response;
        }
        else {
          console.log("unable to register");
          response.status = false
          response.message = 'unable to register'
          return response;
        }
      }
    }
    catch (err) {
      console.log(err);
      throw new Error('Unable to register Student ');
    }
  },
};



