loopProtect.alias = 'protect';

window.loopProtect = loopProtect;

var source = null;

loopProtect.hit = function (line) {
  if (source) source.postMessage(["catch", "Potential Infinite Loop found on line " + line], host);
}

function isNode(o) {
  return (
    typeof Node === "object" ? o instanceof Node : 
    o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
  );
}

function isElement(o){
  return (
    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
  );
}

function isNodeList(nodes) {
  var stringRepr = Object.prototype.toString.call(nodes);

  return typeof nodes === 'object' &&
      /^\[object (HTMLCollection|NodeList|Object)\]$/.test(stringRepr) &&
      (typeof nodes.length === 'number') &&
      (nodes.length === 0 || (typeof nodes[0] === "object" && nodes[0].nodeType > 0));
}

window.addEventListener("message", receiveMessage, false);

window.myPost = function() {
  const payload = [];
  for (const a of arguments) {
    const arg = a && a.message ? a.message : a;
    if (isNode(arg) || isElement(arg)) {
      payload.push(arg.outerHTML);
    }
    else if (isNodeList(arg)) {
      payload.push(arg.toString());
    }
    else {
      payload.push(arg);
    }
  }
  source.postMessage(payload, host);
}

function receiveMessage(event) {
  if (event.origin !== host) return;

  source = event.source;

  if (event.data === "wakeup") {
    source.postMessage("awake", host); 
  } 
  else {
    var isScreenshot = window.location.href.indexOf("screenshot=true") > 0;

    var win = document.getElementById('if').contentWindow;
    var doc = win.document;
    
    win.protect = loopProtect;

    var code = event.data;
    if (isScreenshot) {
      if (code.indexOf("<body") >= 0) {
        if (code.match(/\<body[^\>]+style/g)) {
          code = code.replace(/\<body([^\>]+)style([\s]*)\=([\s]*)(['|"])/g, "<body$1style$2=$3$4overflow: hidden !important; ");
        }
        else {
          code = code.replace(/\<body/g, "<body style='overflow: hidden !important;'");
        }
      }
      else {
        code = "<body style='overflow: hidden !important;'>" + code + "</body>";
      }
    }

    doc.open();
    doc.write(code);

    doc.close();
  }
  
}