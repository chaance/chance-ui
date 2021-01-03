import _isNumber from "lodash.isnumber";

export function isNumber(value?: any): value is number {
	return _isNumber(value) && !isNaN(value);
}

export { default as isBoolean } from "lodash.isboolean";
export { default as isString } from "lodash.isstring";
export { default as isFunction } from "lodash.isfunction";
