const mongoose = require("mongoose");

const Schema = mongoose.Schema;

var itemStatsSchema = new Schema({
  tradeable:{
    type: Boolean,
    required:false,
    unique:false
  },
  linked_ID_Placeholder: {
    type: String,
    required: false,
    unique:false,
  }
    ,
  highalch: {
    type: Number,
    required: false,
    unique:false,
  },
  buy_limit: {
    type: Number,
    required: false,
    unique:false,
  },
  wiki_url: {
    type: String,
    required: false,
    unique:false,
  }
}, { _id : false })

var itemSchema = new Schema({
  uniqueID: {
    index:true,
    type: String
  },
  name: {
    type: String,
    trim: true,
    required: "Enter a name for item"
  },
  stats: itemStatsSchema
});

var Item = mongoose.model("OSRS_Items", itemSchema);

module.exports = Item;
