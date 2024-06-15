export function convertToCamelCase(input: object) {
  if (Array.isArray(input)) {
    return input.map((item) => convertToCamelCase(item));
  } else if (typeof input === 'object' && input !== null) {
    const newObj = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        const value = input[key];
        if (value instanceof Date) {
          newObj[key] = value;
        } else {
          const camelCaseKey = key[0].toLowerCase() + key.slice(1);
          newObj[camelCaseKey] = convertToCamelCase(value);
        }
      }
    }
    return newObj;
  } else {
    return input;
  }
}
