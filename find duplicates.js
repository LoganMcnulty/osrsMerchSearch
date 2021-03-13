var duplicates = []

var findCleanDeleteDuplicates = function (itemName){
    var result = db.getCollection('osrs_items').aggregate([
    {$group: {
        _id: "$name",
        uniqueIds: {$addToSet: "$_id"},
        count: {$sum: 1}
        }
    },
    {$match: { 
        count: {"$gt": 1}
        }
    },
    {$sort: {
        count: -1
        }
    }
])
}

var results = db.getCollection('osrs_items').aggregate([
    {$group: {
        _id: "$name",
        uniqueIds: {$addToSet: "$_id"},
        count: {$sum: 1}
        }
    },
    {$match: { 
        count: {"$gt": 1}
        }
    },
    {$sort: {
        count: -1
        }
    }
])
    
results = results['_batch'] 
for (let i=0; i < results.length; i++){
    let itemName = results[i]._id
//     findCleanDeleteDuplicates (itemName)
}

