const collections = require('../config/collections');
const { getDatabase } = require('../config/connection');
const db = require('../config/connection');
const bcrypt = require('bcrypt');

module.exports = {
    dosignin: async (student) => {
        try {
          const db = getDatabase();
          const user = await db.collection(collections.STUDENT).findOne({ username: student.username });
    
          if (!user) {
            return { status: false, message: 'Invalid username ' };
          }
    
          const matched = await bcrypt.compare(student.password, user.password);
    
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
      fetchAttendance: async (batch, department, Id) => {
        try {
          const db = getDatabase();
          const attendance = await db.collection(collections.ATTENDANCE).aggregate([
            {
              $match: {
                department: department,
                batch: batch
              }
            },
            {
              $group: {
                _id: "$info.date",
                att: {
                  $push: {
                    hour: "$info.hour",
                    subject: "$info.subject",
                    facualtyname: "$facualtyname",
                    atte: {
                      $cond: [
                        { $eq: ["$attendance." + Id, "present"] },
                        true,
                        false
                      ]
                    }
                  }
                }
              }
            },
            {
              $sort: {
                "_id": 1
              }
            }
          ]).toArray();


           // Convert the cursor to an array of documents
          console.log(attendance);
          console.log(attendance.att);
          return attendance;
        } catch (err) {
          console.error(err);
          throw err;
        }
      },
    fetchAttByHour: async (Id) => {
        try {
          const db = getDatabase();
          const result = await db.collection(collections.ATTENDANCE).aggregate([
            {
              $match: {
                [`attendance.${Id}`]: { $exists: true }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                final: {
                  $sum: {
                    $cond: [
                      { $eq: [`$attendance.${Id}`, "present"] },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ]).toArray();
          
          if(result){
            return result;
          }
          
        
        } catch (err) {
          console.log(err);
          throw new Error('Unable to  fetch details');
        }
      },
      

}