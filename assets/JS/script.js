var timeEl = $('.timer');
var dateAtStart = moment().unix();
timeEl.text(moment.unix(dateAtStart).format("MMM Do, YYYY, hh:mm:ss"));

// Filter by Price vars
var bidOrAsk = $('#bidOrAsk');
var priceMin = $('#priceMin');
var priceMax = $('#priceMax');
var priceNumResults = $('#priceMax');
var priceRangeSearchForm = $('#priceRangeSearchForm');

// Item Search vars
var itemSearchInput = $('#itemSearchInput');
var itemSearchForm = $('#itemSearchForm');

// View Stats vars
var topSpreadNumResults = $('#topSpreadNumResults');
var statType = $('#statType');
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

var handlePriceFormSubmit = function (event) {
  event.preventDefault();
  let search = {
    bidOrAsk: bidOrAsk.val(),
    priceMin: parseFloat(priceMin.val()),
    priceMax: parseFloat(priceMax.val()),
    numResults: parseFloat(priceNumResults.val())
  }
  console.log(search)

  // search = cleanSearch(search)
  priceRangeSearchForm.trigger('reset')
  // hitLOC_API(search)

  };
  priceRangeSearchForm.on('submit',handlePriceFormSubmit);
priceRangeSearchForm

var handleStatsFormSubmit = function (event) {
  event.preventDefault();

  let search = {
    numResults: topSpreadNumResults.val(),
    statType: statType.val()
  }
  console.log(search)

  topSpreadsForm.trigger('reset')
  // hitLOC_API(search)

  };
  topSpreadsForm.on('submit',handleStatsFormSubmit);

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

function cleanMultiItemData(data){
  resultsContainer.empty()
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

function displayItemCard(itemData){
  console.log(itemData)
  let listDataArray = [
    // moment.unix(itemData.stats.highTime).format("MMM Do, hh:mm:ss")
  // Bid, Ask, AsofDates
    `<div class='d-flex flex-row justify-content-around align-items-center'><h4 class='text text-dark' >Bid: ${numberWithCommas(itemData.stats.high)}</h4><h4 class='text '>Ask: ${numberWithCommas(itemData.stats.low)}</h4></div><div class='d-flex flex-row justify-content-around align-items-center'><h6 class='text text-dark'>${moment.unix(itemData.stats.highTime).format("hh:mm:ss")}</h6> <h6 class='text'>${moment.unix(itemData.stats.lowTime).format("hh:mm:ss")}</h6></div>`
    ,
    `<div class='d-flex flex-row justify-content-around align-items-center pt-2'><h5 class='text text-dark'>Bid/Ask Spread: ${numberWithCommas(itemData.stats.high - itemData.stats.low)}</h5></div>`
    ,
  // High Alch Price / Spread
    `<div class='d-flex flex-row justify-content-around align-items-center'><h5 class='text text-dark'> HA/Ask Spread: ${numberWithCommas(itemData.stats.highalch - itemData.stats.low)} </h5></div>`
    ,
  
  // WIki URL, buy limit
    `<div class='d-flex flex-row justify-content-around align-items-center'><a target=_blank href=${itemData.stats.wiki_url}>Wiki URL</a><h6 class='text text-dark'>Buy Limit: ${numberWithCommas(itemData.stats.buy_limit)}</h6></div>`,
  
  ]
  let itemModal = createModal(itemData, listDataTrue=true, listData=listDataArray, listDataHeader=itemData.name)
  resultsContainer.append(itemModal)
  $("#modalWindow").modal('show');
  let closeModal = $('.closeModal')
  closeModal.on('click', (e) => {
    console.log(e.target)
    $("#modalWindow").modal('hide')
  });
}

const createModal = (data, listDataTrue='', listData = '', listDataHeader='') => {
  var modalMain = $('<div>').addClass('modal text-dark mt-5').attr('style','width:15rem').attr('id','modalWindow').attr('tabindex','-1').attr('role','dialog').attr('style','overflow:auto').attr('aria-hidden','true')
  var modalDialog = $('<div>').addClass('modal-dialog').attr('role','document')
  var modalContent = $('<div>').addClass('modal-content')
  var modalheader = $('<div>').addClass('modal-header')
  var closeButton = $('<button>').addClass('close closeModal').attr('type','button').attr('data-dismass','modal').attr('aria-label','Close')
  var buttonSpan = $('<span>').addClass('fas fa-window-close').attr('aria-hidden','true')

  var modalBody = $('<div>').addClass('modal-body card-body')

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