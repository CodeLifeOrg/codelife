import css from "css";

/**
 * In order to check a student's codebase, each InputCode or Codeblock has its own set 
 * of rules. These are things like "CONTAINS h1" (html contains h1) or "JS_EQUALS total 10"
 * (a running of the js results in the variable total being set to 10). When checking the 
 * student's code in CodeEditor, it makes use of these helper functions to determine whether
 * the student has successfully passed this rule.
 */

/**
 * Given a rule and a block of code, check the Javascript and perform an exact match
 * check on the regex. Used for things like "code must contain getElementById"
 */ 
export const cvMatch = (rule, payload) => {
  const haystack = payload.theJS;
  return haystack.search(new RegExp(rule.regex)) >= 0;
};

/**
 * Given a rule and a block of code, check that a given tag is nested inside another
 * tag. Used for things like "html nests body." Note that this does not currently
 * account for subsequent occurences (only checks for first occurences)
 */
export const cvNests = (rule, payload) => {
  const haystack = payload.theText;
  // get positions of the outer and inner tags, and ensure that they are in order
  const reOuter = new RegExp(`<${rule.outer}[^>]*>`, "g");
  const outerOpen = haystack.search(reOuter);
  const outerClose = haystack.indexOf(`</${rule.outer}>`);
  const reInner = new RegExp(`<${rule.needle}[^>]*>`, "g");
  const innerOpen = haystack.search(reInner);
  const innerClose = haystack.indexOf(`</${rule.needle}>`);
  return  outerOpen !== -1 && outerClose !== -1 && innerOpen !== -1 && innerClose !== -1 &&
          outerOpen < innerOpen && innerOpen < innerClose && innerClose < outerClose && outerOpen < outerClose;
};

/**
 * Given a rule and a block of code, use a hard-coded regex to check for a SPECIFIC
 * pattern. Example include a for block "for (;;) {}", ifelse "if () {} else {}"
 * or a generic invocation of a function "functionName(){}"
 */
export const cvUses = (rule, payload) => {
  const haystack = payload.theJS;
  let re;
  if (rule.needle === "for") {
    re = new RegExp("for\\s*\\([^\\)]*;[^\\)]*;[^\\)]*\\)\\s*{[^}]*}", "g");
  }
  else if (rule.needle === "ifelse") {
    re = new RegExp("if\\s*\\([^\\)]*\\)\\s*{[^}]*}[\\n\\s]*else\\s*{[^}]*}", "g");
  }
  else {
    re = new RegExp(`${rule.needle}\\s*\\([^\\)]*\\)\\s*{[^}]*}`, "g");
  }

  return haystack.search(re) >= 0;
};

/**
 * Given a needle (like h1), an attribute (like color), a value (like red), and a JSON
 * representation of the code as prepared by himalaya (HTML parser), recursively climb
 * down the nested json tree, testing at each node for the presence of the needle,
 * and if provided, whether that node has an attribute, and, if provided, whether that 
 * attribute's value exactly matches the provided value.
 */
export const attrCount = (needle, attribute, value, json) => {
  let count = 0;
  if (json.length === 0) return 0;
  if (attribute === "class") attribute = "className";
  for (const node of json) {
    if (node.type === "Element" && node.tagName === needle && node.attributes[attribute]) {
      // if we have been provided a value, we must compare against it for a match
      if (value) {
        if (attribute === "className") {
          if (node.attributes.className && node.attributes.className.includes(value)) count++;
        }
        else if (String(node.attributes[attribute]) === String(value)) count++;
      }
      // if we were not provided a value, then this is checking for attribute only, and we can pass
      else {
        count++;
      }
    }
    if (node.children !== undefined) {
      count += attrCount(needle, attribute, value, node.children);
    }
  }
  return count;
};

/**
 * Given a rule and a block of code, search for a self closing tag such as <img />
 * Optionally run attrCount to check for extra rules (such as requiring "src")
 */
export const cvContainsSelfClosingTag = (rule, payload) => {
  const html = payload.theText;
  const json = payload.theJSON;
  const re = new RegExp(`<${rule.needle}[^>]*\/>`, "g");
  const open = html.search(re);

  let hasAttr = true;
  if (rule.attribute) hasAttr = attrCount(rule.needle, rule.attribute, rule.value, json) > 0;

  return open !== -1 && hasAttr;
};

/**
 * Given a rule and a block of code, ensure that the given needle (such as <html>)
 * occurs once and only once in the code (useful for tags like body, head, html)
 */
export const cvContainsOne = (rule, payload) => {
  const html = payload.theText;
  const re = new RegExp(`<${rule.needle}[^>]*>`, "g");
  const match = html.match(re);
  const count = match ? match.length : -1;
  return count === 1;
};

/**
 * Given a rule and a block of code, check if a given tag (such as <p>) is included in the 
 * code. Optionally, use attrCount to match any provided attributes or values in the rule.
 */
export const cvContainsTag = (rule, payload) => {
  const html = payload.theText;
  const json = payload.theJSON;
  const re = new RegExp(`<${rule.needle}[^>]*>`, "g");
  const open = html.search(re);
  const close = html.indexOf(`</${rule.needle}>`);
  const tagClosed = open !== -1 && close !== -1 && open < close;

  let hasAttr = true;
  if (rule.attribute) hasAttr = attrCount(rule.needle, rule.attribute, rule.value, json) > 0;

  return tagClosed && hasAttr;
};

/**
 * Given a rule and a block of code, using the "css" module to turn the css into a crawlable
 * object. Fold over that generated parsed object and drill down to check if the rule's property
 * matches the property and value of the css entered by the student.
 */
export const cvContainsStyle = (rule, payload) => {
  const haystack = payload.theJSON;
  const needle = rule.needle;
  const property = rule.property;
  const value = rule.value;
  let head, html, style = null;
  let styleContent = "";
  // First, crawl through the students html to find the style tag
  if (haystack) html = haystack.find(e => e.tagName === "html");
  if (html) head = html.children.find(e => e.tagName === "head");
  if (head) style = head.children.find(e => e.tagName === "style");
  // Grab the CSS out of the style tag and parse it
  if (style && style.children && style.children[0]) styleContent = style.children[0].content;
  if (!styleContent) styleContent = "";
  const obj = css.parse(styleContent, {silent: true});
  let found = 0;
  for (const r of obj.stylesheet.rules) {
    if (r.selectors && r.selectors.includes(needle)) {
      if (property) {
        if (r.declarations) {
          for (const d of r.declarations) {
            if (d.property === property) {
              if (value) {
                // regex to remove spaces from between parens
                const re = new RegExp("\\s+(?=[^()]*\\))", "g");
                const userValue = d.value.replace(re, "");
                const ruleValue = value.replace(re, "");
                if (userValue === ruleValue) found++;
              }
              else {
                found++;
              }
            }
          }
        }
      } 
      else {
        found++;
      }
    }
  }
  return found > 0 && obj.stylesheet.parsingErrors.length === 0;
};
