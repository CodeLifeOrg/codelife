module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/projects", (req, res) => {

    db.testprojects.findAll({where: req.query}).then(u => res.json(u).end());

  });

};
