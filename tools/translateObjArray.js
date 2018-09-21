/**
 * When requests come in to the Codelife API, their locale/language comes in as well.
 * The columns in the islands/levels/slides tables are structured such that any given column,
 * such as title, has a sister column lang_title, in this case, pt_title. In the object that
 * is about to be returned to the requester, pave all of the normal columns with the content
 * of the pt_column (if one exists). 
 * This is a sister function of translate, but this one is for an array of objects (not a promise resp)
 */
module.exports = function(lang, objArray) {
  const translatedArray = objArray.map(obj => {
    for (const k in obj) {
      if (obj[`${lang}_${k}`]) obj[k] = obj[`${lang}_${k}`];
    }
    return obj;
  });
  return translatedArray.sort((a, b) => a.ordering - b.ordering);
};
