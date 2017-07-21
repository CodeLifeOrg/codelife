module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/profile/:username", (req, res) => {
    const {username} = req.params;
    db.users.findOne({
      attributes: ["id", "name", "email"],
      where: {username}
    }).then(user => {
      if (!user) {
        return res.json({error: "No user matched that username."});
      }
      return res.json({email: user.email, name: user.name});
    });
  });

};
