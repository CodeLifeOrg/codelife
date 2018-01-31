const {isAuthenticated} = require("../tools/api.js");
const sequelize = require("sequelize");
// const translate = require("../tools/translate.js");

const threadInclude = [
  { 
    association: "commentlist", 
    include: [
      {
        association: "user", 
        attributes: ["name", "username", "id", "role"]
      },
      {
        association: "userprofile", 
        attributes: ["img"]/*, 
        include: [
          {association: "threads"}, 
          {association: "comments"}
        ]*/
      }
    ]
  },
  {
    association: "user", 
    attributes: ["name", "username", "id", "role"]
  },
  // {association: "userprofile", attributes: ["img"], include: [{association: "threads", attributes: [[sequelize.fn("COUNT", sequelize.col("threads.id")), "threadCount"]]}, {association: "comments"}]}
  {
    association: "userprofile", 
    attributes: ["img"]/*, 
    include: [
      {association: "threads", attributes: [[sequelize.fn("COUNT", sequelize.col("threads.id")), "threadCount"]]}, 
      {association: "comments"}
    ]*/
  }
];

module.exports = function(app) {

  const {db} = app.settings;

  // Used in Discussion to retrieve threads for a given entity id
  app.get("/api/threads/all", (req, res) => {
    db.threads.findAll({
      where: req.query,
      include: threadInclude
    }).then(threads => {
      threads.sort((a, b) => b.date < a.date ? 1 : -1);
      res.json(threads).end();
    });
  });

  // Used in Discussion to start a new thread
  app.post("/api/threads/new", isAuthenticated, (req, res) => {
    db.threads.create({
      title: req.body.title, 
      content: req.body.content, 
      date: db.fn("NOW"),
      subject_type: req.body.subject_type,
      subject_id: req.body.subject_id,
      uid: req.user.id
    }).then(newThread => {
      db.threads.findAll({
        where: {
          subject_type: req.body.subject_type,
          subject_id: req.body.subject_id
        },
        include: threadInclude
      }).then(threads => {
        threads.sort((a, b) => b.date < a.date ? 1 : -1);
        res.json({newThread, threads}).end();
      });
    });
  });

  app.post("/api/comments/new", isAuthenticated, (req, res) => {
    db.comments.create({
      title: req.body.title,
      content: req.body.content,
      date: db.fn("NOW"),
      thread_id: req.body.thread_id,
      uid: req.user.id
    }).then(newComment => {
      db.threads.findAll({
        where: {
          subject_type: req.body.subject_type,
          subject_id: req.body.subject_id
        },
        include: threadInclude
      }).then(threads => {
        threads.sort((a, b) => b.date < a.date ? 1 : -1);
        res.json(threads).end();
      });
    });
  });

};
