
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
    if(typeof data.docEmotions == 'undefined') return console.warn('data.docEmotions empty', data);
    callback(data.docEmotions);
  });
}


//
// apply recieved data
//
function applyRank(block, data) {

  // var summ = Object.keys(data).reduce(function (previous, key) {
  //   return previous + parseFloat(data[key]);
  // }, 0);

  // if(summ <= 0) return console.warn('summ <= 0');

  var correspondence = {
    anger: 'red',
    disgust: 'violet',
    fear: 'green',
    joy: 'yellow',
    sadness: 'blue'
  };

  var obj = {};
  for (var key in data) {
    obj[correspondence[key]] = parseInt(parseFloat(data[key])/5 * 100);
  }
  console.log('obj', data, obj);
  var title = JSON.stringify(data);

  // $(block).css({'background': 'linear-gradient(to right, rgba(255,0,0,0.3) '+obj.red+'%, rgba(255,255,0,0.3) '+obj.violet+'%, rgba(0,255,0,0.3) '+obj.green+'%, rgba(255,0,255,0.3) '+obj.yellow+'%, rgba(0,0,255,0.3) '+obj.blue+'%, rgba(255,255,255,0.3) 100%)'});
  $(block)
    // .prepend('<div class="prepended" style="width: 100%; height: 3px; background: black; postition: absolute; bottom: -1px;"></div>')
    // $(block).find('.prepended')
    .prepend('<div style="width: '+obj.red+'%; height: 3px; background: red; float: left;"></div>')
    .prepend('<div style="width: '+obj.violet+'%; height: 3px; background: violet; float: left;"></div>')
    .prepend('<div style="width: '+obj.green+'%; height: 3px; background: green; float: left;"></div>')
    .prepend('<div style="width: '+obj.yellow+'%; height: 3px; background: yellow; float: left;"></div>')
    .prepend('<div style="width: '+obj.blue+'%; height: 3px; background: blue; float: left;"></div>')
    .attr('title', title);

}

