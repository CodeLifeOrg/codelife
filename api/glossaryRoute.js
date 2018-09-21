const translate = require("../tools/translate.js");

/**
 * This route is specifically for the canon "needs" version of the glossary
 * It has a lang switch because the glossary needs to be rendered server side
 * for SEO optimization.
 */

// Removes accents for alphabetization
const strip = str => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

module.exports = function(app) {

  const {db} = app.settings;

  /**
   * Used by Glossary to fetch a canon need so the page renders server-side the first time
   * @param {string} req.query Object containing the string lang for translation
   * @returns {Object[]} A list of translated glossary words
   */
  app.get("/api/glossary/all", (req, res) => {
    const {lang} = req.query;
    db.glossarywords.findAll().then(words => {
      if (lang === "pt") words = translate("pt.", "pt", words);
      words = words.map(word => word.toJSON()).sort((a, b) => strip(a.word) < strip(b.word) ? -1 : 1);
      return res.json(words).end();
    });
  });
    
};
