const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: 'localbite-coba',
  keyFilename: 'localbite-coba-f3288e9c5909.json',
});

module.exports = db;
