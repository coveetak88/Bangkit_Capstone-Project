const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: 'xxxxx',
  keyFilename: 'xxxxxx',
});

module.exports = db;
