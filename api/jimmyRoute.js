module.exports = function(app) {

  const {db} = app.settings;

  app.get("/jimmy", (req, res) => {

    db.jimmytable.findAll({where: req.query}).then(u => res.json(u).end());

  });

};
