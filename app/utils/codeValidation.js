import css from "css";

export const cvGetMeanings = () => {
  const meanings = [];
  meanings.CONTAINS = [];
  meanings.CSS_CONTAINS = [];
  meanings.CONTAINS.html = "<html> surrounds your whole codeblock and tells the computer this is a webpage.";
  meanings.CONTAINS.head = "<head> is where your metadata is stored, such as your <title>.";
  meanings.CONTAINS.title = "<title> is the title of your page! Make sure it's inside a <head> tag.";
  meanings.CONTAINS.body = "<body> is where you put the content you want everyone to see.";
  meanings.CONTAINS.h1 = "<h1> is a header tag, where you can write really large text.";
  meanings.CONTAINS.h2 = "<h2> is a header tag, where you can write kind of large text.";
  meanings.CONTAINS.h3 = "<h3> is a header tag, where you can write large text.";
  meanings.CONTAINS.h4 = "<h4> is a header tag, where you can write small text.";
  meanings.CONTAINS.h5 = "<h5> is a header tag, where you can write kind of small text.";
  meanings.CONTAINS.h6 = "<h6> is a header tag, where you can write really small text.";
  meanings.CONTAINS.style = "<style> is where you customize your page with cool colors and fonts.";
  meanings.CONTAINS.p = "<p> is a paragraph tag, write sentences in here.";
  meanings.CSS_CONTAINS.h1 = "h1 within a <style> tag is how you customize your header tags.";
  meanings.CSS_CONTAINS.p = "p within a <style> tag is how you customize your <p> tags";
  return meanings;
};

export const cvTagCountOld = (needle, haystack) => {
  let count = 0;
  if (haystack.length === 0) return 0;
  for (const h of haystack) {
    if (h.type === "Element") {
      if (h.tagName === needle) {
        count++;
      } if (h.children !== null) {
        count += cvTagCountOld(needle, h.children);
      }
    }
  }
  return count;
};

export const cvContainsTagOld = (rule, haystack) => cvTagCountOld(rule.needle, haystack) > 0;

export const cvContainsTag = (rule, haystack) => {
  const needle = rule.needle;
  const open = haystack.indexOf(`<${needle}>`);
  const close = haystack.indexOf(`</${needle}>`);
  return open !== -1 && close !== -1 && open < close;
};

export const cvContainsStyle = (rule, haystack) => {
  const needle = rule.needle;
  const property = rule.property;
  const value = rule.value;
  let head, html, style = null;
  let styleContent = "";
  if (haystack) html = haystack.find(e => e.tagName === "html");
  if (html) head = html.children.find(e => e.tagName === "head");
  if (head) style = head.children.find(e => e.tagName === "style");
  if (style && style.children && style.children[0]) styleContent = style.children[0].content;
  const obj = css.parse(styleContent, {silent: true});
  let found = 0;
  for (const r of obj.stylesheet.rules) {
    if (r.selectors.includes(needle)) {
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
