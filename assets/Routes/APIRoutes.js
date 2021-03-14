// LOAD DATA
sendRequestHTML = require('../JS/sendRequestHTML.js');
updateItems = require('../JS/updateItems.js')
updateItemPrices = require('../JS/updateItemPrices.js')
const db = require("../../models");
masterDelete = require('../JS/duplicates.js');

// ROUTING
module.exports = (app) => {

  app.get('/api/updateItems', (req,res) => {
    updateItems()
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(sendRequestHTML('Pulling latest item list from osrsbox into Mongo DB.'))
  })

  app.get('/api/deleteDupes', (req,res) => {
    masterDelete()
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(sendRequestHTML('Removing duplicates from the DB.'))
  })

  app.get('/api/updateItemPrices', (req,res) => {
    updateItemPrices()
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(sendRequestHTML('Pulling latest item prices from RuneLite'))
    })

  app.get('/api/itemPrices', (req,res) => {

    })

  app.get('/api/itemPrices/:item', (req,res) => {

    })

  app.get('/api/items', (req,res) => {
    const dbItems = db.Item.find({}, function(err, docs){return docs});
    Promise.all([dbItems])
    .then(data => data[0].map(d => d.name))
    .then(data => {
      let uniqueData = [...new Set(data)];
      console.log('Database Item Pull Finished!')
      res.json(uniqueData)
    })
    .catch(err => console.log(err))
  })

  app.get('/api/items/:item', (req, res) => {
    let item = req.params.item
    item = item.charAt(0).toUpperCase() + item.slice(1)
    console.log(item)
    db.Item.find({
        name: item
    }).then((item) => res.json(item));
  });

  app.get('/api/masterDelete', (req, res) => {
    db.Item.deleteMany({}, function(err, result) {
      if (err) {
        console.err(err);
      } else {
        res.json(result);
      }
    });
    // res.json({ ok: true });
  });

};
