/**
 * Sandbox is the special landing page where student content is rendered. It is currently
 * hosted on codelife.tech/[filename].html, where [filename] is the URL from which the 
 * request is coming, with dashes instead of dots (e.g., codelife.com -> codelife-com.html).
 * The Long List of files you see in this directory are unique landing pages for each of the 
 * possible URL iterations of Codelife. The reason we need a landing page for each of these
 * is because the remote rendering makes use of the HTML method postMessage(), which allows
 * a payload to be sent across URLs. postMessage requires that the host be explicitly set -
 * each landing page listens ONLY for requests from its host, and uses this file to render
 * the code in an iframe. postMessage is also used to return status messages to the requester, 
 * so that the CodeEditor can show which rules are passing and which are failing based on the
 * remote execution of the javascript code. 
 */

// loopProtect is an open source library that catches infinite loops in js code.
loopProtect.alias = 'protect';

window.loopProtect = loopProtect;

var source = null;

loopProtect.hit = function (line) {
  if (source) source.postMessage(["catch", "Potential Infinite Loop found on line " + line], host);
}

// isNode, isElement, and isNodeList are all catches for when the user attempts to console.log
// an html element. postMessage cannot directly transmit html Nodes, so they must be stringified
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

// listen for postMessage()
window.addEventListener("message", receiveMessage, false);

/**
 * For a full understanding of what's happening here, check CodeEditor.jsx. Before the 
 * students code is sent via postMessage, it is edited. One of the edits made is that 
 * a series of "parent.myPost()" functions are injected to the end of the student's js.
 * By the time the student's code arrives HERE and is actually executed, parent.myPost
 * will refer to THIS function. The job of this function is to receive the arguments
 * from that injected javascript, and use postMessage to send the results of that function
 * BACK to the react side. 
 * As an example - say rule 3 is that the user's javascript sets the value of "total" 
 * to 10. Before we send the students code here to be rendered in an iframe, we edit the code:
 * --------------------------
 * total = undefined;
 * [ original student code goes here]
 * parent.myPost(rule3, total === 10)
 * --------------------------
 * This way, the ACTUAL value of total in the VM can be tested. When the injected student code calls
 * parent.myPost, it invokes this function, which then sends the results of that BACK THROUGH
 * postMessage to the original window - so that we can tell the student if they are correct or not.
 */
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
  // remember - host is determined by which html file (e.g. codelife-com.html) is embedding sandbox.html
  source.postMessage(payload, host);
}

/**
 * Listen for messages from the React host. Most of these will be complete web pages made
 * by students, so the default behavior is to just inject it directly into an iframe
 */
function receiveMessage(event) {
  if (event.origin !== host) return;

  source = event.source;

  /**
   * It takes some time for the iframe to "wake up" and finish being embedded on the page.
   * There was no way on the React side to detect when the iframe was ready for writing,
   * so for the first second or two, React sends wakeup messages every ~50ms or so until it
   * receives "awake" back from this page. Once that has happened, simply dump the code
   * into an iframe every time.
   */
  if (event.data === "wakeup") {
    source.postMessage("awake", host); 
  } 
  else {
    var isScreenshot = window.location.href.indexOf("screenshot=true") > 0;

    var win = document.getElementById('if').contentWindow;
    var doc = win.document;
    
    win.protect = loopProtect;

    // if URL is requested with ?screenshot=true, hide scrollbars (smile for the camera!)
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