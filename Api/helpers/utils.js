module.exports.setNestedValue = (obj, path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const newObj = keys.reduce((acc, key) => {
    acc[key] = acc[key] || {};
    return acc[key];
  }, obj);
  newObj[lastKey] = value;
  return obj;
};

module.exports.intersection = (a = [], b = []) => {
  b = new Set(b);
  return [...new Set(a)].filter(e => b.has(e));
};
