module.exports = function(app) {

  const {db} = app.settings;

  // Public resource for glossary definitions
  app.get("/api/glossary/all", (req, res) => {
    db.glossarywords.findAll().then(u => res.json(u).end());
  });
    
};
