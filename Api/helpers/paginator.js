const dayjs = require('dayjs');
const {
  Types: { ObjectId }
} = require('mongoose');

module.exports = (query, sorter, nextKey, aggregationQuery = false) => {
  const sortField = sorter && sorter.startsWith('-') ? sorter.slice(1) : sorter;
  let paginatedSorter = sorter;
  if (sorter) {
    paginatedSorter = `${sorter} ${sorter.startsWith('-') ? '-' : ''}_id`;
  }

  const nextKeyFn = items => {
    if (!items.length) {
      return null;
    }

    const item = items.at(-1);

    if (!sortField) {
      return { _id: item._id };
    }

    const itemSortField = sortField.split('.').reduce((a, b) => a[b], item);
    return { _id: item._id, [sortField]: itemSortField };
  };

  if (!nextKey) {
    return { paginatedQuery: query, nextKeyFn, paginatedSorter };
  }

  let paginatedQuery = query;

  if (!sorter) {
    paginatedQuery._id = { $gt: nextKey._id };
    return { paginatedQuery, nextKeyFn, paginatedSorter };
  }

  const sortOperator = sorter.startsWith('-') ? '$lt' : '$gt';

  let sortingField = nextKey[sortField];

  if (aggregationQuery && sortingField)
    if (dayjs(sortingField).isValid()) {
      sortingField = new Date(sortingField);
    } else if (!Number.isNaN(+sortingField)) {
      sortingField = +sortingField;
    } else if (ObjectId.isValid(sortingField)) {
      sortingField = new ObjectId(sortingField);
    }

  const paginationQuery = [
    { [sortField]: { [sortOperator]: sortingField } },
    {
      $and: [{ [sortField]: sortingField }, { _id: { [sortOperator]: new ObjectId(nextKey._id) } }]
    }
  ];

  if (!paginatedQuery.$or) {
    paginatedQuery.$or = paginationQuery;
  } else {
    paginatedQuery = { $and: [query, { $or: paginationQuery }] };
  }

  return { paginatedQuery, nextKeyFn, paginatedSorter };
};
