const sequelize = require("sequelize");
const {isAuthenticated} = require("../tools/api.js");

/*
const q = `SELECT * FROM searches WHERE document @@ to_tsquery('${query}')`;
db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());
where: { document: { $ts: sequelize.fn('to_tsquery', query) } }
*/

module.exports = function(app) {

  const {db} = app.settings;


  app.get("/api/searchusers", isAuthenticated, (req, res) => {
    const query = req.query.query;
    db.userprofiles.findAll({
      attributes: ["uid", "gid", "sid", "img"],
      include: [
        {
          association: "user", 
          attributes: ["id", "username", "name"],
          where: 
            {
              [sequelize.Op.or]: 
                [
                  {username: {[sequelize.Op.iLike]: `%${query}%`}}, 
                  {name: {[sequelize.Op.iLike]: `%${query}%`}}
                ]
            } 
        },
        {
          association: "geo"
        },
        {
          association: "school"
        }
      ]
    }).then(users => {
      res.json(users).end();
    });
  });



  app.get("/api/search", isAuthenticated, (req, res) => {
    const query = req.query.query;
    const searchid = req.query.searchid;
    db.users.findAll({
      where: {
        [sequelize.Op.or]: [
          {username: {[sequelize.Op.iLike]: `%${query}%`}}, 
          {name: {[sequelize.Op.iLike]: `%${query}%`}}
        ]},
      attributes: ["id", "username", "name"]

    }).then(users => {
      users = users.map(u => {
        u = u.toJSON();
        u.type = "user";
        return u;
      });
      db.projects.findAll({
        where: {
          name: {[sequelize.Op.iLike]: `%${query}%`}
        },
        include: [{association: "user"}, {association: "userprofile"}]
      }).then(projects => {
        projects = projects.map(p => {
          p = p.toJSON();
          p.type = "project";
          return p;
        });
        res.json({users, projects, searchid}).end();
      });
    });

  });

};
