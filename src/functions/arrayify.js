// Arrayifys an object.
export default function arrayify(object, newKey) {
  return Object.entries(object).map(([key, value]) => ({
    [newKey]: key,
    ...value
  }));
};
