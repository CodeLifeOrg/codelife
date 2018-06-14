const translate = require("../tools/translate.js");

// Removes accents for alphabetization
const strip = str => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

module.exports = function(app) {

  const {db} = app.settings;

  // Public resource for glossary definitions
  app.get("/api/glossary/all", (req, res) => {
    const {lang} = req.query;
    db.glossarywords.findAll().then(words => {
      if (lang === "pt") words = translate("pt.", "pt", words);
      words = words.map(word => word.toJSON()).sort((a, b) => strip(a.word) < strip(b.word) ? -1 : 1);
      return res.json(words).end();
    });
  });
    
};
