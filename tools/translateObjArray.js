module.exports = function(lang, objArray) {
  const translatedArray = objArray.map(obj => {
    obj = obj.toJSON();
    for (const k in obj) {
      if (obj[`${lang}_${k}`]) obj[k] = obj[`${lang}_${k}`];
    }
    return obj;
  });
  return translatedArray.sort((a, b) => a.ordering - b.ordering);
};
