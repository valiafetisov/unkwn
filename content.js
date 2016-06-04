var settings = {}


$.get(chrome.extension.getURL('/settings.json'), function(json) {
  settings = JSON.parse(json);
  getContent();
});


function getContent() {
  var contents = $('.userContentWrapper .userContent').each(function(each){
    var text = $(this).text();
    if(text.length == 0)
      // return console.warn('text is empty');
      var text = 'test';
    processText(text, function(data) {
      console.log(text, data);
    });
  });
}


function processText(text, callback) {
  if(typeof settings == 'undefined' || typeof settings.watson === 'undefined') return console.warn('no settings provided');
  var encoded = encodeURI(text);
  $.get(settings.watson.gateway+'?apikey='+settings.watson.apikey+'&text='+encoded+'&outputMode=json', function(data){
    if(typeof data === 'undefined' || !data) return console.warn('no responce from watson');
    callback(data.docEmotions);
  });
}

