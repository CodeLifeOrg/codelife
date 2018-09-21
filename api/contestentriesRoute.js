const {isAuthenticated, isRole} = require("../tools/api.js");

/**
 * contestentriesRoute is the API endpoint used for managing the (currently postponed) project contest
 */

module.exports = function(app) {

  const {db} = app.settings;

  /**
   * Used by ContestSignup to sign a user up for the contest
   * @returns {Object} The inserted contest entry object
   */
  app.post("/api/contest", isAuthenticated, (req, res) => {
    const payload = Object.assign({}, req.body);
    payload.uid = req.user.id;
    payload.timestamp = Date.now();
    db.contestentries.upsert(payload).then(u => {
      res.json(u).end();
    });
  });

  /**
   * Used by ContestSignup and Contest to fetch this logged-in user's submission object
   * @returns {Object} The currently logged in user's submission object
   */
  app.get("/api/contest/status", isAuthenticated, (req, res) => {
    db.contestentries.findOne({where: {uid: req.user.id}}).then(u => {
      res.json(u).end();
    });
  });

  /**
   * Used by ContestViewer to view current entrants (admin only)
   * @returns {Object[]} A list of all contest entrants with user details 
   */
  app.get("/api/contest/admin", isRole(1), (req, res) => {
    db.contestentries.findAll({
      include: [
        {association: "user", attributes: ["username", "email", "name"]},
        {association: "userprofile", attributes: ["dob", "gid", "sid", "cpf"], include: [{association: "geo"}, {association: "school"}]},
        {association: "project", attributes: ["id", "name"]}
      ]
    }).then(u => {
      res.json(u).end();
    });
  });

};
