import css from "css";

export const cvMatch = (rule, payload) => {
  const haystack = payload.theJS;
  return haystack.search(new RegExp(rule.regex)) >= 0;
};

export const cvNests = (rule, payload) => {
  const haystack = payload.theText;
  const reOuter = new RegExp(`<${rule.outer}[^>]*>`, "g");
  const outerOpen = haystack.search(reOuter);
  const outerClose = haystack.indexOf(`</${rule.outer}>`);
  const reInner = new RegExp(`<${rule.needle}[^>]*>`, "g");
  const innerOpen = haystack.search(reInner);
  const innerClose = haystack.indexOf(`</${rule.needle}>`);
  return  outerOpen !== -1 && outerClose !== -1 && innerOpen !== -1 && innerClose !== -1 &&
          outerOpen < innerOpen && innerOpen < innerClose && innerClose < outerClose && outerOpen < outerClose;
};

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

export const cvContainsSelfClosingTag = (rule, payload) => {
  const html = payload.theText;
  const json = payload.theJSON;
  const re = new RegExp(`<${rule.needle}[^>]*\/>`, "g");
  const open = html.search(re);

  let hasAttr = true;
  if (rule.attribute) hasAttr = attrCount(rule.needle, rule.attribute, rule.value, json) > 0;

  return open !== -1 && hasAttr;
};

export const cvContainsOne = (rule, payload) => {
  const html = payload.theText;
  const re = new RegExp(`<${rule.needle}[^>]*>`, "g");
  const match = html.match(re);
  const count = match ? match.length : -1;
  return count === 1;
};

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

export const cvContainsStyle = (rule, payload) => {
  const haystack = payload.theJSON;
  const needle = rule.needle;
  const property = rule.property;
  const value = rule.value;
  let head, html, style = null;
  let styleContent = "";
  if (haystack) html = haystack.find(e => e.tagName === "html");
  if (html) head = html.children.find(e => e.tagName === "head");
  if (head) style = head.children.find(e => e.tagName === "style");
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
