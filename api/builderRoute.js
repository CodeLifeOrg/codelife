module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/builder/lessons", (req, res) => {

    db.lessons.findAll({where: req.query}).then(u => {
      res.json(u).end();
    });

  });

  app.get("/api/builder/minilessons", (req, res) => {

    db.minilessons.findAll({where: {lid: req.query.lid}}).then(u => {
      res.json(u).end();
    });

  });

  app.get("/api/builder/minilessons/all", (req, res) => {

    db.minilessons.findAll({where: req.query}).then(u => {
      res.json(u).end();
    });

  });

  app.get("/api/builder/slides", (req, res) => {

    db.slides.findAll({where: {mlid: req.query.mlid}}).then(u => {
      res.json(u).end();
    });

  });

  app.get("/api/builder/slides/all", (req, res) => {

    db.slides.findAll({where: req.query}).then(u => {
      res.json(u).end();
    });

  });  

};
