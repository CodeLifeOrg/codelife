const {isAuthenticated, isRole} = require("../tools/api.js");

module.exports = function(app) {

  const {db} = app.settings;

  app.post("/api/contest", isAuthenticated, (req, res) => {
    const payload = Object.assign({}, req.body);
    payload.uid = req.user.id;
    payload.timestamp = Date.now();
    db.contestentries.upsert(payload).then(u => {
      res.json(u).end();
    });
  });

  app.get("/api/contest/status", isAuthenticated, (req, res) => {
    db.contestentries.findOne({where: {uid: req.user.id}}).then(u => {
      res.json(u).end();
    });
  });

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
