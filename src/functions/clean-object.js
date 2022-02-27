export function cleanObject(data) {
  const dataType = typeof data;

  if (
    dataType === 'string' ||
    dataType === 'number' ||
    dataType === 'undefined' ||
    dataType === 'boolean' ||
    data === null
  ) {
    return data;
  }

  return Array.isArray(data)
    ? Object.setPrototypeOf(data.map(item => cleanObject(item)), null)
    : Object.entries(data).reduce((acc, [key, value]) => {
      const type = typeof value;
      acc[key] =
        type === 'string' || type === 'number' || type === 'undefined' || type === 'boolean' || value === null
          ? value
          : cleanObject(value);
      return acc;
    }, Object.create(null, {}));
}
