const {isAuthenticated} = require("../tools/api.js");

module.exports = function(app) {

  const {db} = app.settings;

  // Used by CodeBlockCard to actually process the like
  app.post("/api/likes/save", isAuthenticated, (req, res) => {
    const uid = req.user.id;
    const {liked, likeid, type} = req.body;

    if (!liked) {
      db.likes.destroy({where: {uid, likeid, type}}).then(u => res.json(u).end());
    }
    else {
      db.likes.findOrCreate({where: {uid, likeid, type}}).then(u => res.json(u).end());
    }

  });

};
