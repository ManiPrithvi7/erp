export const isObject = (value: any): value is object => value !== null && typeof value === 'object';
export const isFunction = (value: any): value is Function => typeof value === 'function';
export const isString = (value: any): value is string => typeof value === 'string';
export const isBoolean = (value: any): value is boolean => typeof value === 'boolean';
export const isNumber = (value: any): value is number => typeof value === 'number';
export const isUndef = (value: any): value is undefined => typeof value === 'undefined';

