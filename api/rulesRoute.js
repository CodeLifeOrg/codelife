const {isAuthenticated, isRole} = require("../tools/api.js");
const translate = require("../tools/translate.js");

module.exports = function(app) {

  const {db} = app.settings;

  // Used by CodeEditor to get rule language
  app.get("/api/rules", (req, res) => {
    db.rules.findAll().then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });
  });

  // Used by RuleBuilder and RulePicker to list all rules, admin only
  app.get("/api/rules/all", isRole(1), (req, res) => {
    db.rules.findAll().then(u => {
      res.json(u).end();
    });
  });

  // Used by Rulebuilder to save rule text, admin only
  app.post("/api/rules/save", isRole(1), (req, res) => {
    db.rules.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u).end());
  });

};
