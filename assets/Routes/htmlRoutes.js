const path = require('path');

// ROUTING
module.exports = (app) => {

// If no matching route is found default to home
  app.get('*', (req, res) => {
    // console.log('oops')
    res.sendFile(path.join(__dirname, '../HTML/index.html'));
  });

};
