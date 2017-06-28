module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/snippets", (req, res) => {

    db.testsnippets.findAll({where: req.query}).then(u => res.json(u).end());

  });

};
