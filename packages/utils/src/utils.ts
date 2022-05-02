export function findFromEnd<T extends any[]>(
	arr: T,
	predicate: (value: T[number], index: number, obj: T) => unknown
) {
	let length = arr.length;
	while (length--) {
		let index = length;
		let item = arr[index];
		if (predicate(item, index, arr)) {
			return item;
		}
	}
	return undefined;
}

export function hasOwn<ObjectType extends Record<keyof any, any>>(
	object: ObjectType,
	prop: keyof any
): prop is keyof ObjectType {
	return Object.prototype.hasOwnProperty.call(object, prop);
}

export function isBoolean(value: any): value is boolean {
	return typeof value === "boolean";
}

export function isFunction(value: any): value is Function {
	// eslint-disable-next-line eqeqeq
	return !!(value && {}.toString.call(value) == "[object Function]");
}

export function isNumber(value: any): value is number {
	return typeof value === "number" && !isNaN(value);
}

export function isString(value: any): value is string {
	return typeof value === "string";
}

export function isObject(value: any): value is object {
	return typeof value === "object" && value != null;
}
