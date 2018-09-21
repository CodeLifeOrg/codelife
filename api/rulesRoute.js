const {isRole} = require("../tools/api.js");
const translate = require("../tools/translate.js");

/**
 * rulesRoute is for getting and setting the rules that are used to verify whether 
 * a codeblock is passing or not. There are different rulesets for different languages,
 * because the javascript variables (such as numberOfApples for example) is different,
 * and therefore needs to be checked against a translated variable
 */

module.exports = function(app) {

  const {db} = app.settings;

  /**
   * Used by CodeEditor to get rule language.  No restrictions because you can view codeblocks when not logged in.
   * @returns {Object[]} list of rules objects, translated
   */
  app.get("/api/rules", (req, res) => {
    db.rules.findAll().then(u => {
      u = translate(req.headers.host, "pt", u);
      res.json(u).end();
    });
  });

  /**
   * Used by RuleBuilder and RulePicker to list all rules, admin only. Note that these are not
   * translated, because this is used by the admin panel to SET the translations themselves
   * @returns {Object[]} list of rules objects, translated
   */
  app.get("/api/rules/all", isRole(1), (req, res) => {
    db.rules.findAll().then(u => {
      res.json(u).end();
    });
  });

  /**
   * Used by Rulebuilder to save rule text, admin only
   * @param {Object} req.body object containing id and updated fields to write to db
   * @returns {number} Affected Rows
   */
  app.post("/api/rules/save", isRole(1), (req, res) => {
    db.rules.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u).end());
  });

};
