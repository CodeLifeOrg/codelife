
module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/userprogress/", (req, res) => {

    db.userprogress.findAll({where: {uid: req.user.id}})
      .then(progress => {
        const returnObj = {progress};
        db.islands.findAll()
          .then(islands => {
            let latestIsland = -1;
            for (const up of progress) {
              const i = islands.find(i => i.id === up.level);
              if (i && i.ordering > latestIsland) {
                latestIsland = i.ordering;
              }
            }
            const island = islands.find(i => i.ordering === latestIsland + 1);
            returnObj.current = island;
            res.json(returnObj).end();
          });
      });

  });

  app.post("/api/userprogress/save", (req, res) => {
    const {id: uid} = req.user;
    const {level} = req.body;

    // db.userprogress.create({where: {uid, level}}).then(u => res.json(u).end());
    
    db.userprogress.findOrCreate({where: {uid, level}})
      .then(userprogressRows => {
        if (userprogressRows.length) {
          const userprogressRow = userprogressRows[0];
          userprogressRow.datecompleted = db.fn("NOW");
          return userprogressRow.save().then(() => res.json(userprogressRows).end());
        }
        else {
          return res.json({error: "Unable to update user progress."}).end();
        }
      });

  });

};
