const faker = require("faker");
// sets locale to Brazil
faker.locale = "pt_BR";
const bcrypt = require("bcrypt");
const request = require("request");
const path = require("path");
const fs = require("fs");

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/unseed", (req, res) => {
    db.projects.destroy({
      where: {
        uid: {$ilike: "fakeUser%"}
      }
    }).then(() => {
      db.snippets.destroy({
        where: {
          uid: {$ilike: "fakeUser%"}
        }
      }).then(() => {
        db.userprofiles.destroy({
          where: {
            uid: {$ilike: "fakeUser%"}
          }
        }).then(() => {
          db.users.destroy({
            where: {
              id: {$ilike: "fakeUser%"}
            }
          }).then(() => res.json({success: "All fake items deleted."}));
        });
      });
    });
  });

  app.get("/api/seed", (req, res) => {
    const numFakeUsers = 50;
    db.users.findAll({where: {id: {$ilike: "fakeUser%"}}}).then(users => {
      if (users.length) {
        return res.json({fail: "Fake items not added. Run /api/unseed to remove current fake data and then run again."});
      }
      for (let i = 0; i < numFakeUsers; i++) {
        const salt = bcrypt.genSaltSync(10);
        const uid = `fakeUser${i}`;
        const fakeName = faker.name.findName();
        const newUser = {
          id: uid,
          username: faker.internet.userName(),
          email: faker.internet.email(),
          name: fakeName,
          password: bcrypt.hashSync(faker.internet.password(), salt),
          salt
        };
        db.users.upsert(newUser).then(() => {
          const userProfile = {
            uid,
            bio: "I'm a fake user!",
            img: `user${uid}.jpg`,
            gid: "4mg030000",
            sid: "31006238",
            coins: faker.random.number(1000),
            streak: faker.random.number(55),
            dob: "2001-01-05"
          };
          db.userprofiles.create(userProfile);
          request.get({url: faker.image.avatar(), encoding: "binary"}, (err, response, body) => {
            const imgPath = path.join(process.cwd(), "/static/uploads", `user${uid}.jpg`);
            fs.writeFile(imgPath, body, "binary", err => {
              if (err) {
                console.log(err);
              }
              else {
                console.log(`Downloaded file at ${imgPath}!`);
              }
            });
          });
          for (let ii = 0; ii < faker.random.number(10); ii++) {
            const newProject = {
              name: faker.lorem.slug(3),
              studentcontent: `<html><head></head><body><h1>${faker.lorem.words(6)}</h1><p>${faker.lorem.paragraphs(10)}</p></body></html>`,
              uid
            };
            db.projects.create(newProject);
          }
          for (let iii = 1; iii < 4; iii++) {
            const newSnippet = {
              snippetname: `Snippet ${iii} do ${fakeName}`,
              studentcontent: `<html><head></head><body><h1>${faker.lorem.words(6)}</h1><p>${faker.lorem.paragraphs(10)}</p></body></html>`,
              likes: faker.random.number(10000),
              lid: `island-${iii}`,
              uid
            };
            db.snippets.create(newSnippet);
          }
        });
      }
      return res.json({success: "Done creating fake data."});
    });
  });

};
