const collections = require('../config/collections');
const { getDatabase } = require('../config/connection');
const db = require('../config/connection');
const bcrypt = require('bcrypt');

module.exports = {
  dosignin: async (facualty) => {
    try {
      const db = getDatabase();
      const user = await db.collection(collections.FACUALTY).findOne({ username: facualty.username });

      console.log(user);

      if (!user) {
        return { status: false, message: 'Invalid username ' };
      }

      const matched = await bcrypt.compare(facualty.password, user.password);

      if (matched) {
        delete user.password;
        console.log("User found");
        return { status: true, user: user };
      } else {
        return { status: false, message: 'Invalid password' };
      }
    } catch (err) {
      console.log(err);
      return { status: false, message: err };
    }
  },
  fetchFacualty: async (Department) => {
    try {
      const db = getDatabase();
      responseObj = await db.collection(collections.FACUALTY).find({ Department: Department }).toArray();
      return responseObj
    }
    catch (err) {
      console.log(err);
      return { status: false, message: 'department chech err' };
    }
  },
  assignedSubjects: async (assigned) => {
    try {
      const db = getDatabase();
      const findOneAssigned = await db.collection(collections.ASSIGNEDSUBJECTS).findOne({ id: assigned.id });

      if (findOneAssigned) {
        // Document with the same ID exists, update the existing document
        const updateResponse = await db.collection(collections.ASSIGNEDSUBJECTS).updateOne(
          { id: assigned.id },
          {
            $push: {
              batch: { batch: assigned.batch },
              subjects: { semester: assigned.semester },
              semester: { subject: assigned.subject },
              Hour: { hour: assigned.hour }
            }
          }
        );

        if (updateResponse.modifiedCount > 0) {
          console.log('Subject assigned successfully');
          return true;
        } else {
          console.log('Failed to update subject');
          return false;
        }
      } else {
        // Document with the same ID doesn't exist, insert a new document
        const insertResponse = await db.collection(collections.ASSIGNEDSUBJECTS).insertOne({
          batch: [{ batch: assigned.batch }],
          subjects: [{ semester: assigned.semester }],
          semester: [{ subject: assigned.subject }],
          Hour: [{ hour: assigned.hout }],
          id: assigned.id
        });

        if (insertResponse) {
          console.log('Subject assigned successfully');
          return true;
        } else {
          console.log('Failed to insert subject');
          return false;
        }
      }

    }
    catch (err) {
      console.log(err);
    }
  },
  fetchAssignbatches: async (Id) => {
    try {
      const db = getDatabase();
      const response = await db.collection(collections.ASSIGNEDSUBJECTS).findOne({ id: Id });
      if (response) {
        return response.batch || [];
      }
    }
    catch (err) {
      console.log(err);
      return { status: false, message: 'asiign  check err' };
    }
  },
  fetchStudentforAttendance: async (batch, department) => {
    try {
      const db = getDatabase();
      responseObj = await db.collection(collections.STUDENT).aggregate([
        {
          $match: {
            year: batch,
            Department: department
          }
        },
        {
          $project: {
            _id: "$_id",
            name: "$fullname",
            rollno: "$RollNo"
          }
        }
      ]).toArray();

      console.log(responseObj);
      return { status: true, responseObj };
    }
    catch (err) {
      console.log(err);
      return { status: false, message: 'department chech err' };
    }
  },
  fetchAttendanceDetails: async (batch, Id) => {
    try {
      const db = getDatabase();
      responseObj = await db.collection(collections.ASSIGNEDSUBJECTS).aggregate([
        {
          $match: {
            "batch.batch": batch,
            id: Id
          }
        },
        {
          $project: {
            semester: {
              $arrayElemAt: ["$subjects", {
                $indexOfArray: ["$batch.batch", batch]
              }]
            },
            hour: {
              $arrayElemAt: ["$Hour", {
                $indexOfArray: ["$batch.batch", batch]
              }]
            },
            subjects: {
              $arrayElemAt: ["$semester", {
                $indexOfArray: ["$batch.batch", batch]
              }]
            }
          }
        }
      ]).toArray();


      console.log(responseObj);
      return responseObj;
    }
    catch (err) {
      console.log(err);
      return { status: false, message: 'department chech err' };
    }
  },
  submitAttendance: async (Attendance) => {
    try {
      const db = getDatabase();
      responseObj = await db.collection(collections.ATTENDANCE).insertOne(Attendance);
      if (responseObj) {
        console.log(responseObj);
        return responseObj;
      }
      else {
        return false;
      }
    }
    catch (err) {
      console.log(err);
      return { status: false, message: 'department chech err' };
    }
  },
}