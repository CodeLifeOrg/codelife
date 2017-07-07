module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/lessons", (req, res) => {

    db.lessons.findAll({where: req.query}).then(u => res.json(u).end());

  });

  app.get("/api/minilessons", (req, res) => {

    db.minilessons.findAll({where: {lid: req.query.lid}}).then(u => res.json(u).end());

  });

  app.get("/api/slides", (req, res) => {

    db.slides.findAll({where: {mlid: req.query.mlid}}).then(u => res.json(u).end());

  });

};
