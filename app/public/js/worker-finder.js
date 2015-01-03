
var itemsInBunch = 100;

var items = [];
var nBunches;

var re;
var working = false;
var newQuery = false;
var bunches;

var findABunch = function () {
  var i;
  var item;
  var bunch = [];
  var start = bunches * itemsInBunch;
  var end = start + Math.min(itemsInBunch, items.length - start);
  for (i = start; i < end; i += 1) {
    item = items[i];
    re.test(item.slug) && bunch.push(i);
  }
  postMessage(bunch);

  // next iteration
  bunches += 1;
  bunches < nBunches ? setTimeout(findABunch) : postMessage('done');
};

var find = function (string) {
  if (string.length < 3) {
    return;
  }
  var query = string.toLowerCase();
  re = new RegExp(query.replace(/ /g, '.+'));
  bunches = 0;
  setTimeout(findABunch);
};

onmessage = function (e) {
  var message = e.data;
  if (Object.prototype.toString.call(message) === '[object String]') {
    find(message);
  } else {
    items = message;
    nBunches = Math.ceil(items.length / itemsInBunch);
  }
};


