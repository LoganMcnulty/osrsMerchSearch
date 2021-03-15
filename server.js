const express = require('express');
var mongoose = require("mongoose");
const htmlRouter = require('./assets/Routes/htmlRoutes.js');
const apiRouter = require('./assets/Routes/APIRoutes.js');
const fetch = require("node-fetch");

const PORT = process.env.PORT || 8080;

// Sets up the Express App
const app = express();

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static directory
app.use(express.static('assets'));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/OSRS_Merch_Search", {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology:true
});

// Invoke routes
apiRouter(app);
htmlRouter(app);

// Syncing our sequelize models and then starting our Express app
app.listen(PORT, () => console.log(`Listening on localhost:${PORT}`));

function updateItemPrices() {
  const itemInterval = setInterval(function() {
    console.log('Fetching Item Prices')
    let requests = [fetch('http://localhost:8080/api/updateItemPrices').catch(err => console.log(err))]
    // Promise.all waits until all jobs are resolved
      Promise.all(requests)
      .then(console.log('Item Price Data Updated Successfully'))
      .catch(err => console.log(err))

  }, 60000);
}
updateItemPrices();

