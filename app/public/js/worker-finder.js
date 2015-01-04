
var itemsInBunch = 200;

var items = [];
var nBunches;

var re;
// var working = false;
// var newQuery = false;
var bunches;

var findABunch = function () {
  // if (!(newQuery ^ working)) {
  //   return;
  // }
  // newQuery = false;

  var i;
  var item;
  var bunch = [];
  var start = bunches * itemsInBunch;
  var end = start + Math.min(itemsInBunch, items.length - start);
  for (i = start; i < end; i += 1) {
    item = items[i];
    re.test(item.slug) && bunch.push(item);
  }
  postMessage(bunch);

  // next iteration
  bunches += 1;
  if (bunches < nBunches) {
    // working = true;
    setTimeout(findABunch, 30);
  } else {
    postMessage('done');
    // working = false;
  }
};

var find = function (string) {
  if (string.length < 4) {
    return;
  }
  var query = string.toLowerCase();
  re = new RegExp(query.replace(/ /g, '.+'));
  bunches = 0;
  // newQuery = true;
  findABunch();
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


