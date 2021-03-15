const fetch = require("node-fetch");
const apiPath = 'https://prices.runescape.wiki/osrs/latest'
const db = require("../../models");
const pageCount = 1
const fs = require('fs')

const updateItemPrices = () => {
    console.log("Pulling Items from OSRS RuneLite API");
    var numInserted = 0

    let urls = []
    for (let i=1; i <= pageCount; i++){
        urls.push(apiPath +'?page=' + i)
    }
    console.log(urls)
    let requests = urls.map(url => fetch(url).catch(err => console.log(err)));

// Promise.all waits until all jobs are resolved
    Promise.all(requests)
    .then(responses => Promise.all(responses.map(r => r.json())))
    // .then(data => data.map(d => d._items))
    .then(data => {
        console.log('price data retrieved')
        let testData = data[0]
        var numUpdated = 0
        let promiseLoop = () => { for(var key in testData){

            let uniqueIDKey = key
            let dataKey = testData[key]

            db.Item.updateOne({'uniqueID':uniqueIDKey},
                {"$set":{
                    'stats.high':dataKey.high,
                    'stats.highTime':dataKey.highTime,
                    'stats.low':dataKey.low,
                    'stats.lowTime':dataKey.lowTime
                }
                },{upsert: true}).exec(function(err, item){
                if(err) {
                    console.log(err);
                    // res.status(500).send(err);
                } else {
                    numUpdated+=1
                    // console.log('update successful')
                        //  res.status(200).send(item);
                }
             });


        }}
        Promise.all([promiseLoop()])
        .then(console.log("Item prices updated"))
        .catch(err => console.log(err))

    })
}

module.exports = updateItemPrices
