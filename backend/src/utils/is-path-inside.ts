import path from 'path';

// is implementation of is-path-inside npm package

export const isPathInside = (childPath: string, parentPath: string): boolean => {
  const relation = path.relative(parentPath, childPath);

  return Boolean(
    relation &&
      relation !== '..' &&
      !relation.startsWith(`..${path.sep}`) &&
      relation !== path.resolve(childPath)
  );
};

export default isPathInside;


