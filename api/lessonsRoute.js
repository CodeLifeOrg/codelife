const translate = require("../tools/translate.js");

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/lessons", (req, res) => {

    db.lessons.findAll({where: req.query}).then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });

  });

  app.get("/api/minilessons", (req, res) => {

    db.minilessons.findAll({where: {lid: req.query.lid}}).then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });

  });

  app.get("/api/minilessons/all", (req, res) => {

    db.minilessons.findAll({where: req.query}).then(u => {
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
