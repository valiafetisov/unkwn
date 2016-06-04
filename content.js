var settings = {}


$.get(chrome.extension.getURL('/settings.json'), function(json) {
  settings = JSON.parse(json);
  init();
});


// linear-gradient(top right, rgba(0,255,0,0.1) 10%, rgba(255,0,0,0.1) 20%, rgba(0,0,255,0.1) 100%);
// $('.mbm').css({'background': 'linear-gradient(-90deg, rgba(255,255,255,0.3) 10%, yellow 10%,blue 20%,green 50%)'});

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
    // anger: "0.23232", disgust: "0.028577", fear: "0.152354", joy: "0.640736", sadness: "0.053535"
    // $(block).css({'background': 'linear-gradient(-90deg, rgba(255,255,255,0.3) 10%, yellow 10%, blue 20%, green 50%)'});
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

