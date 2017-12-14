const {isAuthenticated} = require("../tools/api.js");
const translate = require("../tools/translate.js");

module.exports = function(app) {

  const {db} = app.settings;

  // Used in App to retrieve all islands, then stored in redux
  app.get("/api/islands/all", (req, res) => {
    db.islands.findAll({where: req.query}).then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });
  });

  // Used in Level and Slide to get specific level by lid
  app.get("/api/levels/all", (req, res) => {
    db.levels.findAll({where: req.query}).then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });
  });

  // Used by Slide to get all slides for a given mlid (level id)
  app.get("/api/slides/all", isAuthenticated, (req, res) => {
    db.slides.findAll({where: {mlid: req.query.mlid}}).then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });
  });

};
