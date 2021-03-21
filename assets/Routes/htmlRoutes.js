const path = require('path');

// ROUTING
module.exports = (app) => {
// About Page
  app.get('/About', (req, res) => {
    // console.log('oops')
    res.sendFile(path.join(__dirname, '../HTML/About.html'));
  });

// Home page
  app.get('/', (req, res) => {
    // console.log('oops')
    res.sendFile(path.join(__dirname, '../HTML/index.html'));
  });

  app.get('*', (req, res) => {
// console.log('oops')
    res.sendFile(path.join(__dirname, '../HTML/index.html'));
  });

};
