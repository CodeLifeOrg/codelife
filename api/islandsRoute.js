const translate = require("../tools/translate.js");
const translateObjArray = require("../tools/translateObjArray.js");

module.exports = function(app) {

  const {db} = app.settings;

  // Used in App to retrieve all islands, then stored in redux
  app.get("/api/islands/all", (req, res) => {
    db.islands.findAll({where: req.query}).then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });
  });

  app.get("/api/islands/nested", (req, res) => {
    const {lang} = req.query;
    delete req.query.lang;
    db.islands.findAll({
      where: req.query,
      include: [{association: "levels", include: [{association: "slides"}]}]
    }).then(islands => {
      islands = islands.map(i => i.toJSON());
      islands = translateObjArray(lang, islands);
      islands.forEach(island => {
        island.levels = translateObjArray(lang, island.levels);
        island.levels.forEach(level => {
          level.slides = translateObjArray(lang, level.slides);
        });
      });
      res.json(islands).end();
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
  app.get("/api/slides/all", (req, res) => {
    db.slides.findAll({where: req.query, include: {association: "threadlist"}}).then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });
  });

};
