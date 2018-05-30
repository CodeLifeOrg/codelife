const translate = require("../tools/translate.js");

module.exports = function(app) {

  const {db} = app.settings;

  // Public resource for glossary definitions
  app.get("/api/glossary/all", (req, res) => {
    const {lang} = req.query;
    db.glossarywords.findAll().then(u => {
      if (lang === "pt") u = translate("pt.", "pt", u);
      return res.json(u).end();
    });
  });
    
};
