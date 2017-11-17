const {isAuthenticated, isRole} = require("../tools/api.js");

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/siteconfigs", (req, res) => {
    db.siteconfigs.findAll().then(configs => {
      const obj = {};
      for (const c of configs) obj[c.config_key] = isNaN(c.config_value) ? c.config_value : Number(c.config_value);
      res.json(obj).end();
    });
  });

};
