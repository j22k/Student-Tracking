const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'student_track';

let client = null;

async function connectToDatabase() {
  try {
    client = await MongoClient.connect(uri);
    console.log('Connected successfully to database');
  } catch (err) {
    console.log(err);
    throw new Error('Unable to connect to database');
  }
}

function getDatabase() {
  if (!client || !client.topology.isConnected()) {
    throw new Error('Database connection is not established');
  }

  return client.db(dbName);
}

module.exports = {
  connectToDatabase,
  getDatabase,
};
