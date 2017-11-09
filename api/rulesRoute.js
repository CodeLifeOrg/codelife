const {isAuthenticated, isRole} = require("../tools/api.js");
const translate = require("../tools/translate.js");

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/rules", (req, res) => {

    db.rules.findAll().then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();

    });

  });

  app.get("/api/rules/all", (req, res) => {

    db.rules.findAll().then(u => {
      res.json(u).end();
    });

  });

  app.post("/api/rules/save", (req, res) => {

    db.rules.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u).end());

  });

};
