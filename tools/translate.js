/**
 * When requests come in to the Codelife API, their locale/language comes in as well.
 * The columns in the islands/levels/slides tables are structured such that any given column,
 * such as title, has a sister column lang_title, in this case, pt_title. In the object that
 * is about to be returned to the requester, pave all of the normal columns with the content
 * of the pt_column (if one exists). 
 */
module.exports = function(host, lang, resp) {
  if (host.includes(`${lang}.`)) {
    for (const r of resp) {
      const data = r.dataValues;
      for (const k in data) {
        if (data[`${lang}_${k}`]) data[k] = data[`${lang}_${k}`];
      }
    }
  }
  return resp;
};
