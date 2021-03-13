var timeEl = $('.timer');
var dateAtStart = moment().unix()
timeEl.text(moment.unix(dateAtStart).format("MMM Do, YYYY, hh:mm:ss"))
var instantBuyOrSell = $('#instantBuyOrSell')
var priceMin = $('#priceMin')
var priceMax = $('#priceMax')
var itemSearchInput = $('#itemSearchInput')
var priceRangeSearchForm = $('#priceRangeSearchForm')
var itemSearchForm = $('#itemSearchForm')

// var resultsContainer = $('#resultsContainer')

function setTime() {
  // Sets interval in variable
  var timerInterval = setInterval(function() {
    dateAtStart += timerInterval
    timeEl.text(moment.unix(dateAtStart).format("MMM Do, YYYY, hh:mm:ss"));
    
  }, 1000);
}
setTime();

// Date dropdown for Modal
$(function () {
$('#projectDate').datepicker({
  changeMonth: true,
  changeYear: true,
});
});

var hitGEAPI = function(search){
  apiURL = 'https://www.loc.gov/' + paramOne + '/?q=' + paramTwo + '&sb=' + paramThree 
  
  fetch(apiURL).then(function (response) {
      return response.json();
    }).then(function (data) {
      projectData(data, search);
    });
    
}

var hitItemAPI = function(search){
  apiURL = 'https://www.loc.gov/' + paramOne + '/?q=' + paramTwo + '&sb=' + paramThree 
  
  fetch(apiURL).then(function (response) {
      return response.json();
    }).then(function (data) {
      projectData(data, search);
    });
    
}

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
  search = itemSearchInput.val()
  console.log(search)
  // search = {
  //   buyOrSell: buyOrSell.val(),
  //   priceRange: priceRange.val(),
  // }

  // search = cleanSearch(search)
  itemSearchForm.trigger('reset')
  // hitLOC_API(search)

  };
itemSearchForm.on('submit',handleItemFormSubmit);

function cleanSearch(search){

  console.log(search)

  if (x == y){
  }
  else{
    console.log('Something went wrong')
  }

  return search
}


function projectData(data, search){
  resultsContainer.empty()
  console.log(data)
  console.log(search)
  console.log(data.results.length)


}
