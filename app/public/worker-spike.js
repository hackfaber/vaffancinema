var i = 0;

function timedCount() {
    i = i + 1;
    postMessage(i);
    setTimeout("timedCount()",500);
}

onmessage = function (e) {
  console.log(e);
  i = e.data;
  timedCount();
};

