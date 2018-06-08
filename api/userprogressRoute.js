const {isAuthenticated} = require("../tools/api.js");
const translate = require("../tools/translate.js");

module.exports = function(app) {

  const {db} = app.settings;

  // Used in CodeBlock, CodeblockList, Home, Island, Level, and Slide to determine this user's list of beaten items
  // Note: "current" is used only for Home.jsx to fill in a "continue your journey" link
  app.get("/api/userprogress/mine", isAuthenticated, (req, res) => {
    db.userprogress.findAll({where: {uid: req.user.id}})
      .then(progress => {
        const returnObj = {progress};
        db.islands.findAll()
          .then(islands => {
            islands = translate(req.headers.host, "pt", islands);
            let latestIsland = -1;
            for (const up of progress) {
              const i = islands.find(i => i.id === up.level);
              if (i && i.ordering > latestIsland) {
                latestIsland = i.ordering;
              }
            }
            // This is a blocker for november's beta.  Increment this with release of each new island
            // incremented this for december island.
            // incremented this for january island
            // island 6 is city island. set latest to max out at 6 so that the "next" (current) island is always 7, the last island (clock)
            if (latestIsland >= 6) latestIsland = 6;
            const island = islands.find(i => i.ordering === latestIsland + 1);
            returnObj.current = island;
            res.json(returnObj).end();
          });
      });

  });

  // Used in CodeBlock and Slide to report when a user beats an Island or a Level, respectively
  app.post("/api/userprogress/save", isAuthenticated, (req, res) => {
    const {id: uid} = req.user;
    const {level, status} = req.body;
    db.userprogress.findOrCreate({where: {uid, level}})
      .then(userprogressRows => {
        if (userprogressRows.length) {
          const userprogressRow = userprogressRows[0];
          userprogressRow.datecompleted = db.fn("NOW");
          // Don't allow a completed level to become incomplete later.
          if (userprogressRow.status !== "completed") userprogressRow.status = status;
          return userprogressRow.save().then(() => res.json(userprogressRows).end());
        }
        else {
          return res.json({error: "Unable to update user progress."}).end();
        }
      });
  });
};
