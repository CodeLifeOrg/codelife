module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/sitecontents", (req, res) => {

    db.sitecontents.findAll({where: req.query}).then(u => res.json(u).end());

  });

};
