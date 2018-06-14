const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const {isRole} = require("../tools/api.js");

/**
 * Builder Route is the admin-only API for interacting directly with the lesson content in the CMS
 */

module.exports = function(app) {

  const {db} = app.settings;

  /**
   * Used by LessonBuilder to fetch all islands, levels, or slides from the islands table.
   * @param {string} query The query string of the request, used to limit the findAll query
   * @returns {Object[]} An array of the island, level, or slide objects
   */

  app.get("/api/builder/islands/all", isRole(1), (req, res) => {
    db.islands.findAll({where: req.query}).then(u => {
      res.json(u).end();
    });
  });

  app.get("/api/builder/levels/all", isRole(1), (req, res) => {
    db.levels.findAll({where: req.query}).then(u => {
      res.json(u).end();
    });
  });

  app.get("/api/builder/slides/all", isRole(1), (req, res) => {
    db.slides.findAll({where: req.query}).then(u => {
      res.json(u).end();
    });
  });  

  /**
   * Used by LessonBuilder to add a new island, level, or slide to its respective table
   * @param {Object} req.body The updated entity
   * @returns {Object} The new row from the table
   */
  app.post("/api/builder/islands/new", isRole(1), (req, res) => {  
    db.islands.create(req.body).then(u => {
      res.json(u).end();
    });
  });

  app.post("/api/builder/levels/new", isRole(1), (req, res) => {
    db.levels.create(req.body).then(u => {
      res.json(u).end();
    });
  });

  app.post("/api/builder/slides/new", isRole(1), (req, res) => {
    db.slides.create(req.body).then(u => {
      res.json(u).end();
    });
  });

  /**
   * Used by IslandEditor, LevelEditor, and SlideEditor to save an updated island/level/slide
   * @param {Object} req.body The updated island/level/slide
   * @returns {number} The number of affected rows (hopefully 1)
   */
  app.post("/api/builder/islands/save", isRole(1), (req, res) => {
    db.islands.update(req.body, {where: {id: req.body.id}}).then(u => {
      res.json(u).end();
    });
  });  

  app.post("/api/builder/levels/save", isRole(1), (req, res) => {
    db.levels.update(req.body, {where: {id: req.body.id}}).then(u => {
      res.json(u).end();
    });
  });

  app.post("/api/builder/slides/save", isRole(1), (req, res) => {
    db.slides.update(req.body, {where: {id: req.body.id}}).then(u => {
      res.json(u).end();
    });
  });

  /**
   * Used by LessonBuilder to delete an island, level, or slide from its respective table
   * @param {number} id The id of the island/level/slide to delete
   * @returns {number} The number of affected rows (hopefully 1)
   */
  app.delete("/api/builder/islands/delete", isRole(1), (req, res) => {
    db.islands.destroy({where: {id: req.query.id}}).then(u => {
      res.json(u).end();
    });    
  });

  app.delete("/api/builder/levels/delete", isRole(1), (req, res) => {
    db.levels.destroy({where: {id: req.query.id}}).then(u => {
      res.json(u).end();
    });    
  });

  app.delete("/api/builder/slides/delete", isRole(1), (req, res) => {
    db.slides.destroy({where: {id: req.query.id}}).then(u => {
      res.json(u).end();
    });    
  });

  app.get("/api/builder/glossary/all", isRole(1), (req, res) => {
    db.glossarywords.findAll({where: req.query}).then(u => {
      res.json(u).end();
    });
  });  

  app.post("/api/builder/glossary/save", isRole(1), (req, res) => {
    db.glossarywords.update(req.body, {where: {id: req.body.id}}).then(u => {
      res.json(u).end();
    });
  });

  app.post("/api/builder/glossary/new", isRole(1), (req, res) => {
    db.glossarywords.create(req.body).then(u => {
      res.json(u).end();
    });
  });

  app.delete("/api/builder/glossary/delete", isRole(1), (req, res) => {
    db.glossarywords.destroy({where: {id: req.query.id}}).then(u => {
      res.json(u).end();
    });    
  });


  const upload = multer({
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error("Only image files are allowed!"));
      }
      return callback(null, true);
    }
  });

  const imgUpload = upload.single("file");

  app.post("/api/slideImgUpload/", isRole(1), (req, res) => {
    imgUpload(req, res, err => {
      if (err) return res.json({error: err});

      if (!req.file) {
        return res.json({error: "No file."});
      }

      const sampleFile = req.file;
      const title = req.body.title;
      const newFileName = `${title}.jpg`;
      const imgPath = path.join(process.cwd(), "/static/slide_images", newFileName);

      return sharp(sampleFile.buffer)
        .toFormat(sharp.format.jpeg)
        .toFile(imgPath, (uploadErr, info) => {
          if (uploadErr) {
            return res.status(500).send(uploadErr);
          }
          else {
            return res.json(info);
          }
        });

    });
  });

};
