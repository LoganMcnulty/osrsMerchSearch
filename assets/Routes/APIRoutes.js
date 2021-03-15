// LOAD DATA
sendRequestHTML = require('../JS/sendRequestHTML.js');
updateItems = require('../JS/updateItems.js')
updateItemPrices = require('../JS/updateItemPrices.js')
masterDelete = require('../JS/duplicates.js');

const db = require("../../models");

// ROUTING
module.exports = (app) => {
  app.get('/api/itemStats/:statType/:limit', (req,res) => {
    const requestParams = req.params
    const statParam = requestParams.statType
    const limit = requestParams.limit
    var statType = {}
    statType[statParam] = -1
    console.log(statType)
    db.Item.aggregate([
      {$match: {
          "stats.highTime": {$ne: null},
          "stats.low": {$nin: [null, 0]},
          "stats.high": {$nin: [null, 0]},
          "stats.buy_limit": {$ne:null},
          "stats.highalch": {$ne:null}
          }},
      {$addFields:{
          HAAskSpread: { $subtract: [ "$stats.highalch", "$stats.low" ] },
          BidAskSpread: {$subtract: [ "$stats.high", "$stats.low" ] },
          BidAskRatio: {$divide: ["$stats.low", "$stats.high"]},
          }},
      {$project:{
           _id:1,
          name:1,
          stats:1,
          HAAskSpread:1,
          BidAskSpread:1,
          BidAskRatio:1
      }},
      {$sort: statType},
      {$limit: parseFloat(limit)}
  ])
    .then((item) => res.json(item));

  })

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
  });

};
