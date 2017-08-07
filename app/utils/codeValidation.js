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

export const cvTagCount = (needle, haystack) => {
  let count = 0;
  if (haystack.length === 0) return 0;
  for (const h of haystack) {
    if (h.type === "Element") {
      if (h.tagName === needle) {
        count++;
      } if (h.children !== null) {
        count += cvTagCount(needle, h.children);
      }
    }
  }
  return count;
};

export const cvContainsTag = (needle, haystack) => cvTagCount(needle, haystack) > 0;
