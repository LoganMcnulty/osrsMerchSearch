// Timer variables
var timeEl = $('.timer');
var dateAtStart = moment().unix();
timeEl.text(moment.unix(dateAtStart).format("MMM Do, YYYY, hh:mm:ss"));

// Date and time stuff
$(function () {$('#projectDate').datepicker({changeMonth: true,changeYear: true,});});
function setTime() {
  var timerInterval = setInterval(function() {
    dateAtStart += timerInterval
    timeEl.text(moment.unix(dateAtStart).format("MMM Do, YYYY, hh:mm:ss"));
  }, 1000);
}
setTime();