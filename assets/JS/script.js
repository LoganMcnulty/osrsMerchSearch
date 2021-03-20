// Timer variables
var timeEl = $('.timer');
var dateAtStart = moment().unix();
timeEl.text(moment.unix(dateAtStart).format("MMM Do, YYYY, hh:mm:ss"));

// Filter by Price vars
var bidOrAsk = $('#bidOrAsk');
var priceMin = $('#priceMin');
var priceMax = $('#priceMax');
var priceNumResults = $('#priceNumResults');
var priceRangeSearchForm = $('#priceRangeSearchForm');

// Item Search vars
var itemSearchInput = $('#itemSearchInput');
var itemSearchForm = $('#itemSearchForm');

// View Stats vars
var statsNumResults = $('#statsNumResults');
var statType = $('#statType');
var maxSpread = $('#maxSpread')
var topSpreadsForm = $('#topSpreadsForm');

//Results Container
var resultsContainer = $('#resultsContainer')

// Date and time stuff
$(function () {$('#projectDate').datepicker({changeMonth: true,changeYear: true,});});
function setTime() {
  var timerInterval = setInterval(function() {
    dateAtStart += timerInterval/2
    timeEl.text(moment.unix(dateAtStart).format("MMM Do, YYYY, hh:mm:ss"));
  }, 1000);
}
setTime();

// Pull Items from the DB in order to populate autocomplete
const pullDBItems = () => {
  let requests = [fetch('/api/items').catch(err => console.log(err))]
  // Promise.all waits until all jobs are resolved
    Promise.all(requests)
    .then(responses => responses)
    .then(responses => Promise.all(responses.map(r => r.json())))
    .then(data => {
      console.log("Autofill completed")
    // Search Item Autocomplete
      $('.basicAutoComplete').autocomplete({
        source: function(request, response) {
          var results = $.ui.autocomplete.filter(data[0], request.term);
          response(results.slice(0, 10));
      }})
})
}
pullDBItems()

// view top spreads form submit
var handleStatsFormSubmit = function (event) {
  event.preventDefault();
  let search = {
    numResults: statsNumResults.val(),
    statType: statType.val(),
    maxSpread: maxSpread.val()
  }

  if(!search.maxSpread){
    console.log("Default max spread to 50000")
    search.maxSpread = 50000
  }

  if(!search.numResults){
    console.log("Default results to 100")
    search.numResults = 100
  }

  if (search.statType === 'Bid less Ask'){
    search.statType = 'BidAskSpread'
  }
  else if (search.statType === 'High Alch less Ask'){
    search.statType = 'HAAskSpread'
  }
  else{
    search.statType = 'BidAskRatio'
  }

  let urlSpreadStats = '/api/itemstats/' + search.statType + '/' + search.numResults + '/' + search.maxSpread
  console.log(urlSpreadStats)
  console.log("Searching For: " + search.statType)
  let requests = [fetch(urlSpreadStats).catch(err => console.log(err))]
  resultsContainer.html('')

  // Promise.all waits until all jobs are resolved
    Promise.all(requests)
    .then(responses => responses)
    .then(responses => Promise.all(responses.map(r => r.json())))
    .then(data => {
      console.log("Top spreads and ratios retrieved")
      var dataTable = $('<table>').attr('id','dataTable').addClass('table table-striped table-dark data-toggle m-0 p-0').attr('data-toggle','table')
      var tableBody = $('<tBody>').addClass('m-0 p-0 col-lg-8 col-sm-12')
      var tableHead = $('<thead>')
      var tableRow = $('<tr>')
      var columnHeader1 = $('<th>').attr('scope','col').html('Item')
      var columnHeader7 = $('<th>').addClass('scope','col').html('Save')
      var columnHeader2 = $('<th>').addClass('scope','col').html('Ask')
      var columnHeader3 = $('<th>').addClass('scope','col').html('Bid - Ask')
      var columnHeader4 = $('<th>').addClass('scope','col').html('HA - Ask')
      var columnHeader5 = $('<th>').addClass('scope','col').html('Bid / Ask')
      var columnHeader6 = $('<th>').addClass('scope','col').html('Buy Limit')

      tableRow.append(columnHeader1, columnHeader7, columnHeader2, columnHeader3, columnHeader4, columnHeader5, columnHeader6)
      tableHead.append(tableRow)
      dataTable.append(tableHead, tableBody)

      const tableData = data[0]
      console.log(tableData)

      for(let i=0; i < tableData.length; i++){

        let itemRow = $('<tr>')
        let itemNameCell = $('<th>').attr('scope','row').html(titleCase(tableData[i]['name']))
        let itemPriceCell = $('<td>').attr('scope','row').html(numberWithCommas(tableData[i]['stats']['low']))
        let bidAskSpreadCell = $('<td>').html(numberWithCommas(tableData[i]['BidAskSpread']))
        let haAskSpreadCell = $('<td>').html(numberWithCommas(tableData[i]['HAAskSpread']))
        let bidAskRatioCell = $('<td>').html(Math.round(tableData[i]['BidAskRatio'] * 100)/100)
        let buyLimitCell = $('<td>').html(numberWithCommas(tableData[i]['stats']['buy_limit']))
        let saveIcon = $('<i>').addClass('fas fa-save').attr('style','color:gold')
        let saveButton = $('<button>').addClass('btn saveItemButton').attr('uniqueID',tableData[i]['uniqueID']).html(saveIcon)
        let saveCell = $('<td>').html(saveButton).addClass('text-align-center justify-content-center')

        itemRow.append(itemNameCell, saveCell, itemPriceCell, bidAskSpreadCell, haAskSpreadCell, bidAskRatioCell, buyLimitCell)
        dataTable.append(itemRow)
      }
      resultsContainer.append(dataTable)
      $('#dataTable').bootstrapTable({
        pagination: true,
        search: true,
        pageSize: 20
      })
      $('#expandOne').trigger('click')
      $('.fixed-table-body').attr('style','height:auto; overflow:auto')
      $('.fixed-table-pagination').addClass('bg-warning px-2 mb-4 rounded')
      $('.fixed-table-toolbar').addClass('bg-warning px-2 rounded mt-4')
      $('.fixed-table-toolbar').append($('<button>').addClass('btn btn-lg btn-danger mt-1').attr('style','float:left; vertical-align:middle').text('Clear')).attr('id','clearResultsTable')
      listenDelete('clearResultsTable')
      listenSave()

      // $('.saveItemButton').on('click', function(){
      //   console.log($(this).html().attr('id'))
      // })

    })

  topSpreadsForm.trigger('reset')

  };
  topSpreadsForm.on('submit',handleStatsFormSubmit);

// search item form submit
var handleItemFormSubmit = function (event) {
  event.preventDefault();
  let search = itemSearchInput.val()
  console.log("Searching For: " + search)
  let requests = [fetch('/api/items/' + search).catch(err => console.log(err))]
  // Promise.all waits until all jobs are resolved
    Promise.all(requests)
    .then(responses => responses)
    .then(responses => Promise.all(responses.map(r => r.json())))
    .then(data => {
      console.log("Item Info Retrieved")
      displayItemCard(cleanMultiItemData(data))
    })
  itemSearchForm.trigger('reset')

  };
itemSearchForm.on('submit',handleItemFormSubmit);

// ensure data returned is clean
function cleanMultiItemData(data){
  var goodData
  for(let i =0; i < data.length; i++){
    let tryData = data[0][i]
    try {if(tryData.stats.buy_limit !== null){
      console.log('Good data found')
      goodData = tryData
      break
    }}
    catch{
      console.log("no buy limit")
      goodData = tryData
    }
  }
  return goodData
}

// display search item card
function displayItemCard(itemData){
  console.log(itemData)

  try{
    $("#modalWindow").remove()
  }
  catch{
    console.log(err)
  }
  
  try{
    var listDataArray = [
      // moment.unix(itemData.stats.highTime).format("MMM Do, hh:mm:ss")
    // Bid, Ask, AsofDates
      `<div class='d-flex flex-row justify-content-around align-items-center'><h4 class='text text-dark' >Bid: ${numberWithCommas(itemData.stats.high)}</h4><h4 class='text '>Ask: ${numberWithCommas(itemData.stats.low)}</h4></div><div class='d-flex flex-row justify-content-around align-items-center'><h6 class='text text-dark'>${moment.unix(itemData.stats.highTime).format("hh:mm:ss")}</h6> <h6 class='text'>${moment.unix(itemData.stats.lowTime).format("hh:mm:ss")}</h6></div>`
      ,
      `<div class='d-flex flex-row justify-content-around align-items-center pt-2'><h5 class='text text-dark'>Bid-Ask: ${numberWithCommas(itemData.stats.high - itemData.stats.low)}</h5></div>`
      ,
    // High Alch Price / Spread
      `<div class='d-flex flex-row justify-content-around align-items-center'><h5 class='text text-dark'> HA-Ask: ${numberWithCommas(itemData.stats.highalch - itemData.stats.low)} </h5></div>`
      ,
    
    // WIki URL, buy limit
      `<div class='d-flex flex-row justify-content-around align-items-center'><a target=_blank href=${itemData.stats.wiki_url}>Wiki URL</a><h6 class='text text-dark'>Buy Limit: ${numberWithCommas(itemData.stats.buy_limit)}</h6></div>`,
    
    ]
  }
  catch{
    alert('Something went wrong, try searching for another item')
    return
  }

  let itemModal = createModal(itemData, listDataTrue=true, listData=listDataArray, listDataHeader=titleCase(itemData.name))
  $('body').append(itemModal)
  $("#modalWindow").modal('show');
  
  let closeModal = $('.closeModal')
  closeModal.on('click', (e) => {
    console.log(e.target)
    console.log('close modal')
    $("#modalWindow").modal('hide')
    $("#modalWindow").remove()
  });

}

// filter by bid or ask form submit
var handlePriceFormSubmit = function (event) {
  event.preventDefault();

  let search = {
    bidOrAsk: bidOrAsk.val(),
    priceMin: parseFloat(priceMin.val()),
    priceMax: parseFloat(priceMax.val()),
    numResults: parseFloat(priceNumResults.val())
  }
  console.log(search)

  if(!search.numResults){
    console.log("Default results to 100")
    search.numResults = 100
  }

  let urlPriceStats = '/api/priceRange/' + search.bidOrAsk + '/' + search.numResults + '/' + search.priceMin + '/' + search.priceMax
  console.log(urlPriceStats)
  console.log(`Searching For: ${search.bidOrAsk} less than ${search.priceMax} and greater than ${search.priceMin}`)
  let requests = [fetch(urlPriceStats).catch(err => console.log(err))]
  resultsContainer.html('')
  priceRangeSearchForm.trigger('reset')

  Promise.all(requests)
  .then(responses => responses)
  .then(responses => Promise.all(responses.map(r => r.json())))
  .then(data => {
    console.log("Price filter data retrieved")
    var dataTable = $('<table>').attr('id','dataTable').addClass('table table-striped table-dark data-toggle m-0 p-0').attr('data-toggle','table')
    var tableBody = $('<tBody>').addClass('m-0 p-0').attr('id','statsTableBody')
    var tableHead = $('<thead>')
    var tableRow = $('<tr>')
    var columnHeader1 = $('<th>').attr('scope','col').html('Item')
    var columnHeader7 = $('<th>').addClass('scope','col').html('Save')

    if (search.bidOrAsk == 'Bid'){
      var columnHeader2 = $('<th>').addClass('scope','col').html('Bid')
    }
    else{
      var columnHeader2 = $('<th>').addClass('scope','col').html('Ask')
    }
    
    var columnHeader3 = $('<th>').addClass('scope','col').html('Bid - Ask')
    var columnHeader4 = $('<th>').addClass('scope','col').html('HA - Ask')
    var columnHeader5 = $('<th>').addClass('scope','col').html('Bid / Ask')
    var columnHeader6 = $('<th>').addClass('scope','col').html('Buy Limit')

    tableRow.append(columnHeader1, columnHeader7, columnHeader2, columnHeader3, columnHeader4, columnHeader5, columnHeader6)
    tableHead.append(tableRow)
    dataTable.append(tableHead, tableBody)

    const tableData = data[0]
    console.log(tableData)

    for(let i=0; i < tableData.length; i++){

      let itemRow = $('<tr>')
      let itemNameCell = $('<th>').attr('scope','row').html(titleCase(tableData[i]['name']))

      if (search.bidOrAsk == 'Bid'){
        var itemPriceCell = $('<td>').attr('scope','row').html(numberWithCommas(tableData[i]['stats']['high']))
      }
      else{
        var itemPriceCell = $('<td>').attr('scope','row').html(numberWithCommas(tableData[i]['stats']['low']))
      }

      let bidAskSpreadCell = $('<td>').html(numberWithCommas(tableData[i]['BidAskSpread']))
      let haAskSpreadCell = $('<td>').html(numberWithCommas(tableData[i]['HAAskSpread']))
      let bidAskRatioCell = $('<td>').html(Math.round(tableData[i]['BidAskRatio'] * 100)/100)
      let buyLimitCell = $('<td>').html(numberWithCommas(tableData[i]['stats']['buy_limit']))
      let saveIcon = $('<i>').addClass('fas fa-save').attr('style','color:gold')
      let saveButton = $('<button>').addClass('btn saveItemButton').attr('uniqueID',tableData[i]['uniqueID']).html(saveIcon)
      let saveCell = $('<td>').html(saveButton).addClass('text-align-center justify-content-center')

      itemRow.append(itemNameCell, saveCell, itemPriceCell, bidAskSpreadCell, haAskSpreadCell, bidAskRatioCell, buyLimitCell)
      dataTable.append(itemRow)
    }
    resultsContainer.append(dataTable)
    $('#dataTable').bootstrapTable({
      pagination: true,
      search: true,
      pageSize: 20
    })

    $('#expandTwo').trigger('click')
    $('.fixed-table-body').attr('style','height:auto; overflow:auto')
    $('.fixed-table-pagination').addClass('bg-warning px-2 mb-4 rounded')
    $('.fixed-table-toolbar').addClass('bg-warning px-2 rounded mt-4')
    $('.fixed-table-toolbar').append($('<button>').addClass('btn btn-lg btn-danger mt-1').attr('style','float:left; vertical-align:middle').text('Clear')).attr('id','clearResultsTable')
    listenDelete('clearResultsTable')
    listenSave()
  })

  };
priceRangeSearchForm.on('submit',handlePriceFormSubmit);

// create simple modal function
const createModal = (data, listDataTrue='', listData = '', listDataHeader='') => {
  var modalMain = $('<div>').addClass('modal text-dark mt-5').attr('style','width:15rem').attr('id','modalWindow').attr('tabindex','-1').attr('role','dialog').attr('style','overflow:auto').attr('aria-hidden','true')
  var modalDialog = $('<div>').addClass('modal-dialog').attr('role','document')
  var modalContent = $('<div>').addClass('modal-content')
  var modalheader = $('<div>').addClass('modal-header')
  var closeButton = $('<button>').addClass('close closeModal').attr('type','button').attr('data-dismass','modal').attr('aria-label','Close')
  var buttonSpan = $('<span>').addClass('fas fa-window-close').attr('aria-hidden','true')

  var modalBody = $('<div>').addClass('modal-body card-body p-0')

  if (listDataTrue){
    var listHeader = $('<ul>').addClass('list-group list-group-flush').html("<h3 class='card-title text-center text-light bg-dark w-80 p-3 rounded'>" + listDataHeader + "</h3>")
    for(let i=0; i < listData.length; i++){
      var listItem = $('<li>').addClass('list-group-item').html(listData[i]).attr('listID',i)
      listHeader.append(listItem)
    }
    modalBody.append(listHeader)
  }

  closeButton.append(buttonSpan)
  modalheader.append(closeButton)

  modalContent.append(modalheader, modalBody)
  modalDialog.append(modalContent)
  modalMain.append(modalDialog)
  return modalMain
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function titleCase(str) {
  return str.toLowerCase().split(' ').map(function(word) {
    return word.replace(word[0], word[0].toUpperCase());
  }).join(' ');
}

let listenDelete = (buttonID) => {
  $(`#${buttonID}`).on('click', function(e){
    e.preventDefault()
    console.log('Empty Results Container')
    resultsContainer.empty()
  })
}

var userItems = []

const checkSavedItems = () => {
  var storedItems = JSON.parse(localStorage.getItem("OSRS_Merch"));
  console.log(storedItems)
  console.log(`User Items from local storage: ${storedItems}`)
  if (storedItems.length > 0) {
    userItems = storedItems;
    let requests = [fetch('/api/uniqueids/' + userItems).catch(err => console.log(err))]
    // Promise.all waits until all jobs are resolved
      Promise.all(requests)
      .then(responses => responses)
      .then(responses => Promise.all(responses.map(r => r.json())))
      .then(data => {
        console.log("User saved item info retrieved from MongoDB")
        console.log(data)
        renderStoredItems(data)
      })
  }
  else{
    $('#savedItemsTable').html(`<p class='text mt-2'>Add items to your watch list</p>`)
  }
}
checkSavedItems()

const listenSave = () => {
  $('.saveItemButton').on('click', function(e){
    e.preventDefault()
    var saveItem = $(this).attr('uniqueid')
    console.log('Saveing item ' + saveItem)
    userItems.push(saveItem);
    localStorage.setItem("OSRS_Merch", JSON.stringify(userItems));
    checkSavedItems()
  })
}

const listenClearSaved = () => {
  $('.clearSaved').on('click', function(e){
    localStorage.setItem("OSRS_Merch", JSON.stringify([]));
    userItems = []
    $('#savedItemsTable').html(`<p class='text mt-2'>Add items to your watch list</p>`)
  })
}

const listenRemoveOne = () => {
  $('.deleteItemButton').on('click', function(e){
    let deleteThis = $(this).attr('uniqueid')
    console.log(deleteThis)
    // localStorage.setItem("OSRS_Merch", JSON.stringify([]));
    userItems = userItems.filter(function(item) {
      return item !== deleteThis
  })
  localStorage.setItem("OSRS_Merch", JSON.stringify(userItems));
  checkSavedItems()
  })
}

const renderStoredItems = (data) => {

  $('#savedItemsTable').html('')
  let renderStored = data[0]
  var trTemp = `<tr>
  <th>Item</th>
  <th>Bid - Ask</th>
  <th>HA - Ask</th>
  <th>Remove</th>
  <tr>`
  let newTable = $('<table>').addClass('table table-striped table-dark rounded mb-2 p-0')
  newTable.append($('<thead>').append(trTemp))
  newTable.append(`<tbody id='savedItemTableBody'></tbody>`)
  let deleteGhost = $('<div>').append($("<button>").addClass('btn btn-lg btn-danger p-2 my-1 clearSaved').text('Clear Saved').append($('<i>').addClass("fa fa-trash-alt m-2")))
  $('#savedItemsTable').append(deleteGhost)
  $('#savedItemsTable').append(newTable)

  for(let i=0; i < renderStored.length; i++){
    let itemRow = $('<tr>')
    let itemNameCell = $('<th>').attr('scope','row').html(titleCase(renderStored[i]['name']))
    let bidAskSpreadCell = $('<td>').html(numberWithCommas(renderStored[i]['stats']['high'] - renderStored[i]['stats']['low']))
    let haAskSpreadCell = $('<td>').html(numberWithCommas(renderStored[i]['stats']['highalch'] - renderStored[i]['stats']['low']))
    // let bidAskRatioCell = $('<td>').html(Math.round((renderStored[i]['stats']['high']/renderStored[i]['stats']['low']) * 100)/100)
    let deleteIcon = $('<i>').addClass('fas fa-backspace')
    let deleteButton = $('<button>').addClass('btn btn-danger deleteItemButton').attr('uniqueid',renderStored[i]['uniqueID']).html(deleteIcon)
    let deleteCell = $('<td>').html(deleteButton).addClass('text-align-center justify-content-center')
    itemRow.append(itemNameCell, bidAskSpreadCell, haAskSpreadCell,
      //  bidAskRatioCell,
      deleteCell)
    $('#savedItemTableBody').append(itemRow)
  }

  listenRemoveOne()
  listenClearSaved()
}