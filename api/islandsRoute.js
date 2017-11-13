const {isAuthenticated, isRole} = require("../tools/api.js");
const translate = require("../tools/translate.js");

module.exports = function(app) {

  const {db} = app.settings;

  // Used in App, Home, Level, UserCodeBlocks and CodeBlockList to retrieve all islands
  app.get("/api/islands", (req, res) => {
    db.islands.findAll({where: req.query}).then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });
  });

  // Used in Level and Slide to get specific level by lid
  app.get("/api/levels", isAuthenticated, (req, res) => {
    db.levels.findAll({where: {lid: req.query.lid}}).then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });
  });

  // Used by Slide to get all slides for a given mlid (level id)
  app.get("/api/slides", isAuthenticated, (req, res) => {
    db.slides.findAll({where: {mlid: req.query.mlid}}).then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });
  });

  // Deprecated by builderRoute
  app.get("/api/levels/all", isRole(1), (req, res) => {
    db.levels.findAll({where: req.query}).then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });
  });

  // Deprecated by builderRoute
  app.get("/api/slides/all", isRole(1), (req, res) => {
    db.slides.findAll({where: req.query}).then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });
  });

};
