db.osrs_items.aggregate([
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
{$sort:{HAAskSpread:1}},
{$limit: 100}
],{ allowDiskUse: true })

