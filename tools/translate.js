module.exports = function (host, lang, resp) {
  if (host.includes(`${lang}.`)) {
    for (const r of resp) {
      const data = r.dataValues;
      for (const k in data) {
        if (data[`${lang}_${k}`]) data[k] = data[`${lang}_${k}`];
      }
    }
  }
  return resp;
}