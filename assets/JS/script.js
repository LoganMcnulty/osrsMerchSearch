var timeEl = $('.timer');
var dateAtStart = moment().unix();
timeEl.text(moment.unix(dateAtStart).format("MMM Do, YYYY, hh:mm:ss"));
var instantBuyOrSell = $('#instantBuyOrSell');
var priceMin = $('#priceMin');
var priceMax = $('#priceMax');
var itemSearchInput = $('#itemSearchInput');
var priceRangeSearchForm = $('#priceRangeSearchForm');
var itemSearchForm = $('#itemSearchForm');
let allItems
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

  search = {
    instantBuyOrSell: instantBuyOrSell.val(),
    priceMin: priceMin.val(),
    priceMax: priceMax.val(),
  }
  console.log(search)

  // search = cleanSearch(search)
  priceRangeSearchForm.trigger('reset')
  // hitLOC_API(search)

  };
priceRangeSearchForm.on('submit',handlePriceFormSubmit);

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
    "<h5 class='text text-dark'> Buy Limit: " + itemData.stats.buy_limit + "</h5>", 
    "<h5 class='text text-dark'> High Alch Price: " + itemData.stats.highalch + "</h5>", 
    "<a target=_blank href="+itemData.stats.wiki_url+">Wiki URL</a>"]
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