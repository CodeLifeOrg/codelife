module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/profile/:username", (req, res) => {
    const {username} = req.params;
    const dbFields = ["id", "name", "email"];

    if (req.user.username === username) {
      dbFields.concat(["userprofiles.*"]);
    }

    const q = `SELECT ${dbFields}
      FROM userprofiles, users
      WHERE userprofiles.uid = users.id AND
      users.username = '${username}';`;

    db.query(q, {type: db.QueryTypes.SELECT}).then(user => {
      if (!user) {
        return res.json({error: "No user matched that username."});
      }
      return res.json(user).end();
    });
  });

};
