const translate = require("../tools/translate.js");

module.exports = function(app) {

  const {db} = app.settings;

  // Public resource for glossary definitions
  app.get("/api/glossary/all", (req, res) => {
    db.glossarywords.findAll().then(u => {
      u = translate(req.headers.host, "pt", u);
      return res.json(u).end();
    });
  });
    
};
