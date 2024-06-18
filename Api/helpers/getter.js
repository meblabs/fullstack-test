const paginator = require('./paginator');

module.exports = async (Model, initQuery, req, res, fields = Model.getFields('listing')) => {
  const { sorter = '-createdAt', count = false, nextKey: recivedNextKey = 'null', limit = 0 } = req.query;

  const { paginatedQuery, nextKeyFn, paginatedSorter } = paginator(initQuery, sorter, JSON.parse(recivedNextKey));
  const data = await Model.find(paginatedQuery, fields, {
    sort: paginatedSorter,
    limit: +limit
  });

  const nextKey = JSON.stringify(nextKeyFn(data));
  res.set('x-next-key', nextKey);
  if (count) res.set('x-total-count', await Model.countDocuments(initQuery));

  return data;
};
