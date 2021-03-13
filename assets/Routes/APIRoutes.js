// LOAD DATA
sendRequestHTML = require('../JS/sendRequestHTML.js');
pullItems = require('../JS/pullItems.js')
pullItemPrices = require('../JS/pullItemPrices.js')

// ROUTING
module.exports = (app) => {

  app.get('/api/items', (req, res) => res.json(items));
  app.get('/api/itemPrices', (req, res) => res.json(itemPrices));

  app.get('/api/pullItems', (req,res) => {
    pullItems()
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(sendRequestHTML('Pulling latest item list from osrsbox. \nCheck Data/items.json for Results'))
  })

  app.get('/api/pullItemPrices', (req,res) => {
  
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(sendRequestHTML('Pulling latest item prices from RuneLite'))
    })


  app.post('/api/clear', (req, res) => {
    // Empty out the arrays of data
    items.length = 0;
    itemPrices.length = 0;

    res.json({ ok: true });
  });

};
