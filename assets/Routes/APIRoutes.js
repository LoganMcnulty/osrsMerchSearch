// LOAD DATA
sendRequestHTML = require('../JS/sendRequestHTML.js');
updateItems = require('../JS/updateItems.js')
updateItemPrices = require('../JS/updateItemPrices.js')
masterDelete = require('../JS/duplicates.js');
const db = require("../../models");
const passport = require('../../server/passport/setup')

// ROUTING
module.exports = (app) => {

  app.post("/user", (req, res, next) =>{
    passport.authenticate("local", function(err, user, info){
      console.log(user)
        if (err){
            return res.status(400).json({errors:err});
        }
        if (!user){
            return res.status(400).json({errors: info});
        }
        req.logIn(user,function(err){
            if (err) {
                return res.status(400).json({errors:err})
            }
            var isAuthenticated = require("../middleware/isAuthenticated");
            console.log(isAuthenticated)
            return res.status(200).json({user:user})
        })
    })(req, res, next);
})

  // app.use("/api/auth", auth);
  app.get("/api/goodMorning", (req, res) => res.send("Good morning"));

  app.get('/api/itemStats/:statType/:limit/:maxSpread', (req,res) => {
    const requestParams = req.params
    var statParam = requestParams.statType
    const limit = requestParams.limit
    const maxSpread = requestParams.maxSpread

    if (statParam = 'Bid less Ask'){
      statParam = "BidAskSpread"
    }
    else if(statParam = 'High Alch less Ask'){
      statParam = "HAAskSpread"
    }
    else if(statParam = 'Bid/Ask Ratio'){
      statParam = "BidAskRatio"
    }
    else{
      console.log('Something went wrong')
    }

    console.log(req.params)

    var statType = {}
    statType[statParam] = -1

    var statLTEGTEParam = {}
    statLTEGTEParam[statParam] = {$lt: parseFloat(maxSpread)}

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
      {$match:statLTEGTEParam},
      {$project:{
           _id:1,
          name:1,
          uniqueID:1,
          stats:1,
          HAAskSpread: 1,
          BidAskSpread: 1,
          BidAskRatio:1
      }},
      {$sort: statType},
      {$limit: parseFloat(limit)}
  ])
    .then((item) => res.json(item));
  })

  app.get('/api/priceRange/:bidOrAsk/:limit/:minPrice/:maxPrice', (req,res) => {
    const requestParams = req.params
    var bidOrAskParam = requestParams.bidOrAsk
    const limitParam = requestParams.limit
    const minPriceParam = requestParams.minPrice
    const maxPriceParam = requestParams.maxPrice

    if (bidOrAskParam == 'Bid'){
      bidOrAskParam = 'stats.high'
    }
    else if(bidOrAskParam == 'Ask'){
      bidOrAskParam = 'stats.low'
    }
    else{
      console.log('Something went wrong')
    }

    var statType = {}
    statType[bidOrAskParam] = -1

    var bidAskLTEGTEParam = {}
    bidAskLTEGTEParam[bidOrAskParam] = {$lt:parseFloat(maxPriceParam), $gte:parseFloat(minPriceParam)}

    console.log(requestParams)
    console.log(statType)
    console.log(bidAskLTEGTEParam)
  

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
      {$match:bidAskLTEGTEParam},
      {$project:{
           _id:1,
          name:1,
          stats:1,
          HAAskSpread: 1,
          BidAskSpread: 1,
          BidAskRatio:1
      }},
      {$sort: statType},
      {$limit: parseFloat(limitParam)}
  ])
    .then((item) => {
      res.json(item)
    }
      );
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
