const {isAuthenticated} = require("../tools/api.js");
const translate = require("../tools/translate.js");

module.exports = function(app) {

  const {db} = app.settings;

  // Used in App to retrieve all islands, then stored in redux
  app.get("/api/threads/all", (req, res) => {
    db.threads.findAll({
      where: req.query,
      include: [{association: "commentlist"}]})
    .then(u => {
      res.json(u).end();
    });
  });

};
