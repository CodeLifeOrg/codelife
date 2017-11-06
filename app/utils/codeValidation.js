import css from "css";

export const cvContainsSelfClosingTag = (rule, payload) => {
  const haystack = payload.theText;
  const needle = rule.needle;
  const open = haystack.indexOf(`<${needle}`);
  const close = haystack.indexOf("/>");
  return open !== -1 && close !== -1 && open < close;
};

export const cvContainsTag = (rule, payload) => {
  const haystack = payload.theText;
  const needle = rule.needle;
  const open = haystack.indexOf(`<${needle}>`);
  const close = haystack.indexOf(`</${needle}>`);
  return open !== -1 && close !== -1 && open < close;
};

export const cvContainsOne = (rule, payload) => {
  /* 
  TODO: REPLACE WITH THIS:

  const html = payload.theText;
  const re = new RegExp(`<${rule.needle}[^>]*>`, "g");
  const open = html.search(re);
  const open2 = html.indexOf(`<${rule.needle}>`, open + 1);
  const reClose = new RegExp(`<${rule.needle}[^>]*>`, "g");
  const close = html.search(reClose);
  const close2 = html.indexOf(`</${rule.needle}>`, close + 2);

  */


  const haystack = payload.theText;
  const needle = rule.needle; 
  const open = haystack.indexOf(`<${needle}>`);
  const open2 = haystack.indexOf(`<${needle}>`, open + 1);
  const close = haystack.indexOf(`</${needle}>`);
  const close2 = haystack.indexOf(`</${needle}>`, close + 2);
  return open2 === -1 && close2 === -1;
};

export const cvNests = (rule, payload) => {
  const haystack = payload.theText;
  const outer = rule.outer;
  const needle = rule.needle;
  const outerOpen = haystack.indexOf(`<${outer}`);
  const outerClose = haystack.indexOf(`</${outer}>`);
  const innerOpen = haystack.indexOf(`<${needle}`);
  const innerClose = haystack.indexOf(`</${needle}>`);
  return  outerOpen !== -1 && outerClose !== -1 && innerOpen !== -1 && innerClose !== -1 && 
          outerOpen < innerOpen && innerOpen < innerClose && innerClose < outerClose && outerOpen < outerClose;
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
