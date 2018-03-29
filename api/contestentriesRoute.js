const {isAuthenticated} = require("../tools/api.js");

module.exports = function(app) {

  const {db} = app.settings;

  app.post("/api/contest", isAuthenticated, (req, res) => {
    db.contestentries.upsert(req.body).then(u => {
      res.json(u).end();
    });
  });

  app.get("/api/contest/status", isAuthenticated, (req, res) => {
    db.contestentries.findOne({where: {uid: req.user.id}}).then(u => {
      res.json(u).end();
    });
  });

};
