const sequelize = require("sequelize");
const {isAuthenticated} = require("../tools/api.js");

/**
 * searchRoute handles searches in the bar at the top of the site. Though datawheel
 * has used stemming and postgres search in the past, this is not relevant for usernames
 * and project names, which are exact match only. As such, the queries here are accomplished
 * using trigrams enabled on the columns searched. See ops.md for more info. 
 */

module.exports = function(app) {

  const {db} = app.settings;

  /**
   * Used by Projects to search users to collaborate with. The large sequelize associative
   * include is necessary so the front-end can sort by school or location.
   * @param req.query query string from user input
   * @returns {Object[]} list of users that match the search input
   */
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

  /**
   * Used by the generalized search bar at the top of the page
   * @param req.query query string from user input
   * @returns {Object[]} list of users that match the search input
   */
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
