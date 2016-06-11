
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

  // var dataSorted = Object.keys(data).sort(function(a,b){
  //   console.log('')
  //   return data[a]-data[b]
  // })
  // console.log('dataSorted', dataSorted)
  var correspondence = {
    anger: 'red',
    disgust: 'violet',
    fear: 'green',
    joy: 'yellow',
    sadness: 'blue'
  };

  var obj = {};
  var colors = {};
  var titleArray = [];
  for (var key in data) {
    var percentage = parseInt(parseFloat(data[key])/5 * 100);
    obj[correspondence[key]] = percentage;
    titleArray.push('<span style="color:'+correspondence[key]+'">' + key + ': ' + percentage + '%</span>');
  }
  var title = titleArray.join(', ');
  console.log('obj', data, obj, title);

  $(block)
    .prepend('<div style="width: '+obj.red+'%; height: 3px; background: red; float: left;"></div>')
    .prepend('<div style="width: '+obj.violet+'%; height: 3px; background: violet; float: left;"></div>')
    .prepend('<div style="width: '+obj.green+'%; height: 3px; background: green; float: left;"></div>')
    .prepend('<div style="width: '+obj.yellow+'%; height: 3px; background: yellow; float: left;"></div>')
    .prepend('<div style="width: '+obj.blue+'%; height: 3px; background: blue; float: left;"></div>')
    .tooltipster({
      content: $(title),
      theme: 'tooltipster-light',
      position: 'top'
    });

}

