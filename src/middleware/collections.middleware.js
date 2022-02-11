
//  item = {
//    elem: '#elem',
//    data: {
//      name: 'data'
//    }
//  }


export const collectionsMiddleware = (...collections) => {
  const data = collections.reduce((acc, { name, target, data = [] }) => {
    return acc.set(name, {
      target: target,
      items: [...data],
    });
  }, new Map());

  return (ctrl) => (next) => (step) => {

    for (const collection of collections) {
      if (step[collection.name]) {
        if (step[collection.name].prepend) data.set(collection.name, [step[collection.name].prepend, ...data.get(collection.name)]);
        if (step[collection.name].append) data.set(collection.name, [...data.get(collection.name), step[collection.name].append]);
        if (step[collection.name].update) data.set(collection.name, [...step[collection.name].update]);
      }
    }
x

    return next(step);
  }
}
