var settings = {}


$.get(chrome.extension.getURL('/settings.json'), function(json) {
  settings = JSON.parse(json);
  init();
});


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
    // attributes: true
  });
}


function getContent(block) {
  var text = $(block).find('.userContentWrapper .userContent').text();
  if(text.length == 0)
    return console.warn('text is empty');
    // var text = 'test';
  processText(text, function(data) {
    console.log(text, data);
    applyRank(block, data);
  });
}


function processText(text, callback) {
  if(typeof settings == 'undefined' || typeof settings.watson === 'undefined') return console.warn('no settings provided');
  var encoded = encodeURI(text);
  $.get(settings.watson.gateway+'?apikey='+settings.watson.apikey+'&text='+encoded+'&outputMode=json', function(data){
    if(typeof data === 'undefined' || !data) return console.warn('no responce from watson');
    if(typeof data.docEmotions == 'undefined') return;
    callback(data.docEmotions);
  });
}


function applyRank(block, data) {

  var summ = 0;
  for (var key in data) {
    summ += parseFloat(data[key])
  }

  if(summ <= 0) return console.warn('summ <= 0');

  var obj = {};

  // data example: {anger: "0.23232", disgust: "0.028577", fear: "0.152354", joy: "0.640736", sadness: "0.053535"}
  var colors = ['red', 'violet', 'green', 'yellow', 'blue'];
  var index = 0;
  var j=0;
  for (var key in data) {
    obj[colors[index]] = j;
    j += parseInt(parseFloat(data[key])/summ * 100);
    index++;
  }
  console.log('obj', obj);

  $(block).css({'background': 'linear-gradient(90deg, rgba(255,0,0,0.3) '+obj.red+'%, rgba(255,255,0,0.3) '+obj.yellow+'%, rgba(0,255,0,0.3) '+obj.green+'%, rgba(0,255,255,0.3) '+obj.violet+'%, rgba(0,0,255,0.3) '+obj.blue+'%)'});

}

