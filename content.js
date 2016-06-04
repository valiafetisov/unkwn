
//
// Get settings
//
var settings = {}
$.get(chrome.extension.getURL('/settings.json'), function(json) {
  settings = JSON.parse(json);
  init();
});


//
// initialise by parsing existing content
// and starting DOM observer
//
function init(){
  var contents = $('.mbm').each(function(){
    getContent(this);
  });

  MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  var observer = new MutationObserver(function(mutations, observer) {
    mutations.forEach(function(mutation){
      if(mutation.addedNodes && $(mutation.addedNodes).hasClass('mbm'))
        // console.log('mutations', mutation.addedNodes[0]);
        getContent(mutation.addedNodes);
    });
  });
  observer.observe(document, {
    subtree: true,
    childList: true
  });
}


//
// Get block content by element
//
function getContent(block) {
  var text = $(block).find('.userContentWrapper .userContent').text();
  if(text.length == 0)
    return console.warn('text is empty');
  processText(text, function(data) {
    // console.log(text, data);
    applyRank(block, data);
  });
}


//
// send text to watson and fire a callback on success
//
function processText(text, callback) {
  if(typeof settings == 'undefined' || typeof settings.watson === 'undefined') return console.warn('no settings provided');
  var encoded = encodeURI(text);
  $.get(settings.watson.gateway+'?apikey='+settings.watson.apikey+'&text='+encoded+'&outputMode=json', function(data){
    if(typeof data === 'undefined' || !data) return console.warn('no responce from watson');
    if(typeof data.docEmotions == 'undefined') return;
    callback(data.docEmotions);
  });
}


//
// apply recieved data
//
function applyRank(block, data) {

  var summ = Object.keys(data).reduce(function (previous, key) {
    return previous + parseFloat(data[key]);
  }, 0);

  if(summ <= 0) return console.warn('summ <= 0');

  var correspondence = {
    anger: 'red',
    disgust: 'violet',
    fear: 'green',
    joy: 'yellow',
    sadness: 'blue'
  };

  var obj = {};
  var index = 0;
  var padding = 0;
  for (var key in data) {
    obj[correspondence[key]] = padding;
    padding += parseInt(parseFloat(data[key])/summ * 100);
    index++;
  }
  console.log('obj', data, obj, summ);

  $(block).css({'background': 'linear-gradient(to right, rgba(255,0,0,0.3) '+obj.red+'%, rgba(255,255,0,0.3) '+obj.violet+'%, rgba(0,255,0,0.3) '+obj.green+'%, rgba(255,0,255,0.3) '+obj.yellow+'%, rgba(0,0,255,0.3) '+obj.blue+'%)'});

}

