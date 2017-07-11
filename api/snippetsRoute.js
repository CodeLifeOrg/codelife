module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/snippets", (req, res) => {

    db.snippets.findAll({where: req.query}).then(u => res.json(u).end());

  });

};
