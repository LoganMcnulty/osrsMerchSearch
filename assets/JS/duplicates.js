// let stuff = []
const db = require("../../models");

const masterDelete = () =>{
const duplicates = []
const buyLimits = []
db.Item.
    aggregate([
    {$group: {
            _id: '$name',
            uniqueIds: {$addToSet: "$name"},
            count: {$sum: 1}
    }},
    {$match: { 
        count: {$gt: 1}
        }
    },
    {$sort: {
        count: -1
        }
    }
]).then(data => {
    for (let i=0; i < data.length; i++){duplicates.push(data[i]._id)}
    console.log('Num duplicates ' + duplicates.length)
    return duplicates
})
.then(data => {

    let promiseItems = []

    for (let i=0; i < data.length; i++){
        var stringName = data[i]
        let func = () => {db.Item.
            find({name: stringName, "stats.buy_limit":{$ne:null}
        }).then(data => {
            try {
                buyLimits.push(data[0].name)
            }
            catch{
                console.log("No results")
            }
        }).catch(err => console.log(err))
        return
    }
        promiseItems.push(func)
    }

    Promise.all([promiseItems])
    .then(console.log(buyLimits))
    .catch(err => console.log(err))
})



    // var duplicates = db.Item.aggregate([
    //     {$group: {
    //         _id: "$name",
    //         uniqueIds: {$addToSet: "$_id"},
    //         count: {$sum: 1}
    //         }
    //     },

    // ])
    // duplicates = duplicates['_batch']
    // var duplicateNames = duplicates.map(duplicate => duplicate._id)
    // print("Num duplicates " + duplicateNames.length)
    
    // for (let i=0; i < duplicateNames.length; i++){
    //     print(duplicateNames[i])
    //     var butLimitItem = db.getCollection('osrs_items').aggregate([
    //         {$match:{
    //         name:duplicateNames[i],
    //         "stats.buy_limit":{'$ne': null}
    //         }
    //         }
    //     ])
    
    //     print(butLimitItem._batch)
    //     if (butLimitItem._batch.length > 0){
    //       buyLimitTrue.push(butLimitItem._batch[0])
    //     }
    // }
    
    // print(buyLimitTrue)
    // var goodItems = []
    
    // for (let i =0; i < buyLimitTrue.length; i++){
    //     var goodItem = {
    //         name:buyLimitTrue[i].name,
    //         uniqueID:buyLimitTrue[i].uniqueID,
    //         stats:buyLimitTrue[i].stats,
    //     }
    //     goodItems.push(goodItem)
        
    //     var stringName = '"' + goodItem.name + '"'
    //     print(stringName)
    // //     db.getCollection('osrs_items').deleteMany({name:stringName})
    // }
    
    // for (let i =0; i < goodItems.length; i++){
    //     db.getCollection('osrs_items').insert(goodItems[i])
    // }

}

module.exports = masterDelete



