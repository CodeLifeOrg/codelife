const translate = require("../tools/translate.js");

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/islands", (req, res) => {

    db.islands.findAll({where: req.query}).then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });

  });

  app.get("/api/levels", (req, res) => {

    db.levels.findAll({where: {lid: req.query.lid}}).then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });

  });

  app.get("/api/levels/all", (req, res) => {

    db.levels.findAll({where: req.query}).then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });

  });

  app.get("/api/slides", (req, res) => {

    db.slides.findAll({where: {mlid: req.query.mlid}}).then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });

  });

  app.get("/api/slides/all", (req, res) => {

    db.slides.findAll({where: req.query}).then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });

  });  

};
