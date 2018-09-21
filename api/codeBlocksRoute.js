const {isAuthenticated, isRole} = require("../tools/api.js");
const Op = require("sequelize").Op;
const fs = require("fs");
const mkdirp = require("mkdirp");
const path = require("path");
const Xvfb = require("xvfb");
const screenshot = require("electron-screenshot-service");
const FLAG_COUNT_HIDE = process.env.FLAG_COUNT_HIDE;
const FLAG_COUNT_BAN = process.env.FLAG_COUNT_BAN;

/**
 * codeBlocksRoute is the API endpoint used for fetching and editing codeblocks.
 * It also makes use of electron-screenshot-service to generate screenshots on save
 */

/**
 * Given the logged-in user and a codeblock, this function "flattens" the object by reaching
 * into the associated tables queries (such as reports and likes) and bubbling them up to a top-level prop
 * This type of function is really only used here and in projectsRoute.  As codelife development progressed,
 * the pattern shifted more to expect the nested nature of sequelize queries, meaning flattening wasn't necessary.
 * @param {string} user The currently logged in user, as specified by datawheel-canon
 * @param {Object} cb The codeblock to flatten
 * @returns {Object} The "flattened" codeblock, ready to be returned to the requester
 */
function flattenCodeBlock(user, cb) {
  cb.username = cb.user ? cb.user.username : "";
  cb.sharing = cb.userprofile ? cb.userprofile.sharing : "false";
  cb.likelist = cb.likelist.filter(l => l.type === "codeblock" || l.type === null);
  cb.likes = cb.likelist.length;
  cb.reports = cb.reportlist.filter(r => r.status === "new" && r.type === "codeblock").length;
  cb.hidden = cb.reports >= FLAG_COUNT_HIDE || cb.status === "banned" || cb.sharing === "false";
  if (cb.reports >= FLAG_COUNT_BAN || cb.status === "banned" || cb.sharing === "false") cb.studentcontent = "This content has been disabled";
  if (user) {
    cb.reported = Boolean(cb.reportlist.find(r => r.uid === user.id));
    cb.liked = Boolean(cb.likelist.find(l => l.uid === user.id));
  }
  return cb;
}

// Include to be used in the sequelize query below
const cbIncludes = [
  // Users can have their sharing turned off by an admin
  {association: "userprofile", attributes: ["sharing"]},
  // Get the username to display
  {association: "user", attributes: ["username"]},
  // Get all likes and reports for this cb
  {association: "likelist"},
  {association: "reportlist"}
];

module.exports = function(app) {

  const {db} = app.settings;
  
  /**
   * Used by Island.jsx to get this user's codeblocks
   * @returns {Object} The codeblocks made by this user
   */
  app.get("/api/codeBlocks/mine", isAuthenticated, (req, res) => {
    db.codeblocks.findAll({where: {uid: req.user.id}}).then(u => res.json(u).end());
  });

  /**
   * Admin route to generate a screenshot for a given codeblock
   * @param {string} id The id of the codeblock
   * @returns {Object} The codeblock itself (though unchanged)
   */
  app.post("/api/codeBlocks/generateScreenshot", isRole(2), (req, res) => {
    const id = req.body.id;
    db.codeblocks.findOne({where: {id}}).then(codeblock => {
      const plainCodeblock = codeblock.toJSON();
      db.users.findOne({where: {id: plainCodeblock.uid}}).then(user => {
        user = user.toJSON();
        // Prepare a link to the public-facing share page for this codeblock. ?screenshot=true is very important
        // because the Share page will RENDER DIFFERENTLY in preparation for the screenshot, see more details at Share.jsx
        const url = `${req.headers.origin}/codeBlocks/${user.username}/${plainCodeblock.slug ? plainCodeblock.slug : plainCodeblock.snippetname}?screenshot=true`;
        const width = 600;
        const height = 315;
        const page = true;
        const delay = 5000;
        // Give the React page time to load
        const xvfb = new Xvfb({timeout: 5000});
        // The ubuntu server requires the startSync command, but it breaks localhost
        const isLocal = ["localhost:3300", "en.localhost:3300", "pt.localhost:3300"].includes(req.headers.host);
        if (!isLocal) xvfb.startSync();
        screenshot({url, width, height, page, delay}).then(img => {
          // Save the image in static/cb_images/username/id_of_codeblock.png
          const folder = `/static/cb_images/${user.username}`;
          const folderPath = path.join(process.cwd(), folder);
          const imgPath = path.join(process.cwd(), folder, `${plainCodeblock.id}.png`);
          mkdirp(folderPath, err => {
            console.log("mkdir err", err);
            fs.writeFile(imgPath, img.data, err => {
              console.log("fs err", err);
              if (!isLocal) xvfb.stopSync();
            });
          });
        });
      });
      res.json(codeblock).end();
    });
  });

  /**
   * Used by CodeblockEditor.jsx to save a new codeblock.
   * @param {Object} req.body The post object with new codeblock data
   * @returns {Object} The newly inserted codeblock object
   */
  app.post("/api/codeBlocks/new", isAuthenticated, (req, res) => {
    db.codeblocks.create({studentcontent: req.body.studentcontent, snippetname: req.body.name, uid: req.body.uid, lid: req.body.iid})
      .then(u => {
        const plainObj = u.toJSON();
        db.users.findOne({where: {id: plainObj.uid}}).then(user => {
          user = user.toJSON();
          // See above for explanation of this screenshot generator.  TODO: compile these into single function
          const url = `${req.headers.origin}/codeBlocks/${user.username}/${plainObj.slug ? plainObj.slug : req.body.name}?screenshot=true`;
          const width = 600;
          const height = 315;
          const page = true;
          const delay = 5000;
          const xvfb = new Xvfb({timeout: 5000});
          const isLocal = ["localhost:3300", "en.localhost:3300", "pt.localhost:3300"].includes(req.headers.host);
          if (!isLocal) xvfb.startSync();
          screenshot({url, width, height, page, delay}).then(img => {
            const folder = `/static/cb_images/${user.username}`;
            const folderPath = path.join(process.cwd(), folder);
            const imgPath = path.join(process.cwd(), folder, `${plainObj.id}.png`);
            mkdirp(folderPath, err => {
              console.log("mkdir err", err);
              fs.writeFile(imgPath, img.data, err => {
                console.log("fs err", err);
                if (!isLocal) xvfb.stopSync();
              });
            });
          });
          res.json(u).end();
        });
      });
  });

  /**
   * Used by CodeblockEditor.jsx to update a codeblock.
   * @param {Object} req.body The post object with updated codeblock data
   * @returns {Object} The updated codeblock object
   */
  app.post("/api/codeBlocks/update", isAuthenticated, (req, res) => {
    // individualHooks:true is super important here. The SequelizeSlugify module (see db/codeBlocks.js) will not update codeblock slugs unless this is set to true
    db.codeblocks.update({studentcontent: req.body.studentcontent, snippetname: req.body.name}, {where: {uid: req.body.uid, lid: req.body.iid}, returning: true, individualHooks: true})
      .then(u => {
        const plainObj = u[1][0].toJSON();
        db.users.findOne({where: {id: plainObj.uid}}).then(user => {
          user = user.toJSON();
          const url = `${req.headers.origin}/codeBlocks/${user.username}/${plainObj.slug ? plainObj.slug : req.body.name}?screenshot=true`;
          const width = 600;
          const height = 315;
          const page = true;
          const delay = 5000;
          const xvfb = new Xvfb({timeout: 5000});
          const isLocal = ["localhost:3300", "en.localhost:3300", "pt.localhost:3300"].includes(req.headers.host);
          if (!isLocal) xvfb.startSync();
          screenshot({url, width, height, page, delay}).then(img => {
            const folder = `/static/cb_images/${user.username}`;
            const folderPath = path.join(process.cwd(), folder);
            const imgPath = path.join(process.cwd(), folder, `${plainObj.id}.png`);
            mkdirp(folderPath, err => {
              console.log("mkdir err", err);
              fs.writeFile(imgPath, img.data, err => {
                console.log("fs err", err);
                if (!isLocal) xvfb.stopSync();
              });
            });
          });
          res.json(plainObj).end();
        });
      });
  });

  /**
   * Used by ReportBox and ReportViewer to ban or allow codeblocks, Admin Only
   * @param {Object} req.body The post object containing id and status
   * @returns {number} The number of rows affected
   */
  app.post("/api/codeBlocks/setstatus", isRole(2), (req, res) => {
    const {status, id} = req.body;
    db.codeblocks.update({status}, {where: {id}}).then(u => {
      db.reports.update({status}, {where: {type: "codeblock", report_id: id}}).then(() => res.json(u).end());
    });
  });

  /**
   * Used by CodeblockCard and ProjectCard to feature codeblocks, Admin Only
   * @param {Object} req.body The post object containing id and featured value
   * @returns {number} The number of rows affected
   */
  app.post("/api/codeBlocks/setfeatured", isRole(2), (req, res) => {
    const {featured, id} = req.body;
    db.codeblocks.update({featured}, {where: {id}}).then(u => res.json(u).end());
  });

  /**
   * Used by Home.jsx to grab featured codeblocks for the homepage
   * @returns {Object[]} Featured codeblocks
   */
  app.get("/api/codeBlocks/featured", (req, res)  => {
    db.codeblocks.findAll({
      where: {featured: true},
      include: cbIncludes
    })
      .then(cbRows =>
        res.json(cbRows
          .map(cb => flattenCodeBlock(req.user, cb.toJSON()))).end()
      );
  });

  /**
   * Used by UserCodeBlocks.jsx to get codeblock list for profile page
   * @param {Object} req.query the URL query with the id to search on
   * @returns {Object[]} The given user's codeblocks
   */
  app.get("/api/codeBlocks/byuser", isAuthenticated, (req, res) => {
    db.codeblocks.findAll({
      // Clone the existing include object, but add a restraint to it
      include: cbIncludes.map(i => i.association === "user" ? Object.assign({}, i, {where: {id: req.query.uid}}) : i)
    })
      .then(cbRows =>
        res.json(cbRows
          .map(cb => flattenCodeBlock(req.user, cb.toJSON()))
          .filter(cb => !cb.hidden)
          .sort((a, b) => a.id - b.id))
          .end()
      );
  });

  /**
   * Used by Share.jsx to publicly share code
   * @param {Object} req.query the username and filename from the URL of the share page
   * @returns {Object} The codeblock that matches the query params
   */
  app.get("/api/codeBlocks/byUsernameAndFilename", (req, res) => {
    db.codeblocks.findAll({
      where: {
        // Slugs were added later in development. Some codeblocks may not have slugs, so try both.
        [Op.or]: [{slug: req.query.filename}, {snippetname: req.query.filename}]
      },
      include: cbIncludes.map(i => i.association === "user" ? Object.assign({}, i, {where: {username: req.query.username}}) : i)
    })
      .then(cbRows =>
        res.json(cbRows
          .map(cb => flattenCodeBlock(req.user, cb.toJSON())))
          .end()
      );
  });

  /**
   * Used by CodeblockList and IslandLevel to get a list of all codeblocks.
   * @param {Object} req.query Any query restraints to pass in (such as the island id they belong to)
   * @returns {Object[]} A list of codeblocks that matches the query params
   */
  app.get("/api/codeBlocks/all", isAuthenticated, (req, res) => {
    db.codeblocks.findAll({
      where: req.query,
      include: cbIncludes
    })
      .then(cbRows =>
        res.json(cbRows
          .map(cb => flattenCodeBlock(req.user, cb.toJSON()))
          .filter(cb => !cb.hidden)
          .sort((a, b) => b.likes - a.likes || b.id - a.id))
          .end()
      );
  });

};
