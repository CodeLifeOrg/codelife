const translate = require("../tools/translate.js");
const translateObjArray = require("../tools/translateObjArray.js");

/**
 * Master route for fetching islands, levels and slides.
 * Note: The original version of this was designed before making heavy use 
 * of associations in sequelize. Notice that islands/levels/slides are retrieved as 
 * table-specific lists, for compilation at at the jsx level.
 * A later iteration (/nested) would more properly fetch a hierarchical nesting of content objects. 
 */ 

module.exports = function(app) {

  const {db} = app.settings;

  /**
   * Used in App to retrieve all islands, then stored in redux
   * @param {Object} req.query query string containing constraints to pass to sequelize
   * @returns {Object[]} A list of translated island objects
   */
  app.get("/api/islands/all", (req, res) => {
    db.islands.findAll({where: req.query}).then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });
  });

  /**
   * Used in IslandLevel and Slide to get specific level by lid (island id)
   * @param {Object} req.query query string containing constraints to pass to sequelize
   * @returns {Object[]} A list of translated level objects
   */
  app.get("/api/levels/all", (req, res) => {
    db.levels.findAll({where: req.query}).then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });
  });

  /**
   * Used by Slide to get specific slide set by mlid (level id)
   * @param {Object} req.query query string containing constraints to pass to sequelize
   * @returns {Object[]} A list of translated slide objects and any associated discussions
   */
  app.get("/api/slides/all", (req, res) => {
    db.slides.findAll({where: req.query, include: {association: "threadlist"}}).then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });
  });

  /**
   * Used in LessonPlan to fetch the entirety of the translated content in a hierarchy
   * As mentioned above, it would probably be prudent to change this to the sole form of 
   * Island querying, thus relying on sequelize table structuring, as opposed to compiling 
   * the island hierarchy client side.
   * @param {Object} req.query query string containing language from locale
   * @returns {Object[]} A list of translated island objects, with nested level and slide arrays
   */
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

};
