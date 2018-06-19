const {isRole, isAuthenticated} = require("../tools/api.js");
const Op = require("sequelize").Op;

/**
 * statsRoute is used by both Leaderboard and the Admin Panel to retrieve the current
 * list of users on the site, their metadata, and how far they have progressed in the content
 */

module.exports = function(app) {

  const {db} = app.settings;

  /**
   * Used by admins to get a full list of users on the site and their progress
   * @returns {Object[]} list of users 
   */
  app.get("/api/stats", isRole(2), (req, res) => {
    
    // Exclude users from before the beta
    const launch = new Date(1511499600 * 1000);

    const params = {
      include: [
        {association: "user", where: {createdAt: {[Op.gt]: launch}}, attributes: ["id", "name", "email", "username", "createdAt", "updatedAt"]}, 
        {association: "school", attributes: [["name", "schoolname"]], include: [{association: "geo", attributes: [["name", "geoname"]]}]},
        {association: "userprogress"}
      ],
      order: [[{model: db.users, as: "user"}, "createdAt", "DESC"]]
    };
    
    return db.userprofiles.findAll(params)
      .then(users => {
        if (!users.length) {
          return res.json({error: "No users matched that location."});
        } 
        else {
          const flatusers = users.map(u => {
            const user = u.toJSON();
            user.geoname = user.school && user.school.geo ? user.school.geo.geoname : null;
            user.schoolname = user.school ? user.school.schoolname : null;
            user.id = user.user ? user.user.id : "";
            user.name = user.user ? user.user.name : "";
            user.email = user.user ? user.user.email : "";
            user.username = user.user ? user.user.username : "";
            user.createdAt = user.user ? user.user.createdAt : "";
            return user;
          });        
          return res.json(flatusers).end();  
        }
        
      });
  });

  /**
   * Used by public leaderboard page page to retrieve new user and site activity data
   * @returns {Object[]} list of users 
   */
  app.get("/api/stats/public", isAuthenticated, (req, res) => {
    
    const launch = new Date(1511499600 * 1000);

    const params = {
      include: [
        {association: "user", where: {createdAt: {[Op.gt]: launch}}, attributes: ["id", "name", "username", "createdAt", "updatedAt"]}, 
        {association: "school", attributes: [["name", "schoolname"]], include: [{association: "geo", attributes: [["name", "geoname"]]}]},
        {association: "userprogress"}
      ],
      order: [[{model: db.users, as: "user"}, "createdAt", "DESC"]]
    };
    
    return db.userprofiles.findAll(params)
      .then(users => {
        if (!users.length) {
          return res.json({error: "No users matched that location."});
        } 
        else {
          const flatusers = users.map(u => {
            const user = u.toJSON();
            user.geoname = user.school && user.school.geo ? user.school.geo.geoname : null;
            user.schoolname = user.school ? user.school.schoolname : null;
            user.id = user.user ? user.user.id : "";
            user.name = user.user ? user.user.name : "";
            user.email = user.user ? user.user.email : "";
            user.username = user.user ? user.user.username : "";
            user.createdAt = user.user ? user.user.createdAt : "";
            user.updatedAt = user.user ? user.user.updatedAt : "";
            return user;
          });        
          return res.json(flatusers).end();  
        }
        
      });
  });

};
