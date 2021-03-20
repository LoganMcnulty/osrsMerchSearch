const fetch = require("node-fetch");
const apiPath = 'https://api.osrsbox.com/items'
const db = require("../../models");
const pageCount = 966

const cleanDataFunc = (arr) => {
    let result = [];
    for (let i = 0; i < arr.length; i++) {
        var currItem = arr[i];
        let newItem = {
            uniqueID: currItem.id,
            name: currItem.name,
            stats:{
                tradeable: currItem.tradeable,
                linked_id_placeholder: currItem.linked_id_placeholder,
                highalch: currItem.highalch,
                buy_limit: currItem.buy_limit,
                wiki_url: currItem.wiki_url
            }
        }

        if ((newItem.stats.tradeable == undefined) || (newItem.stats.tradeable === false || (newItem.stats.tradeable === 'false'))){
            // console.log('untradeable item' + ' ' + newItem.name + ' ' + newItem.tradeable )
            continue
        }
        else{
            result.push(newItem)
        }
    }
    return result;
  };

const updateItems = () => {
    console.log("Pulling Items from OSRS Box API");
    var numInserted = 0

    let urls = []
    for (let i=1; i <= pageCount; i++){
        urls.push(apiPath +'?page=' + i)
    }
    console.log(urls)
    let requests = urls.map(url => fetch(url).catch(err => console.log(err)));

// Promise.all waits until all jobs are resolved
    Promise.all(requests)
    .then(responses => responses)
    .then(responses => Promise.all(responses.map(r => r.json())))
    .then(data => data.map(d => d._items))
    .then(data => {
        let promiseLoop = () => { for(let z=0; z < data.length; z++){
            let cleanData = cleanDataFunc(data[z])
            numInserted += cleanData.length
            db.Item.insertMany(cleanData)
            .then(console.log('Item Data Inserted to DB'))
            .catch(err => console.log(err))
        }}
        Promise.all([promiseLoop()])
        .then(console.log("All set. Num Inserted 👉 " + numInserted))
    })
}

module.exports = updateItems
