export function hasOwn<ObjectType extends Record<keyof any, any>>(
	object: ObjectType,
	prop: keyof any
): prop is keyof ObjectType {
	return Object.prototype.hasOwnProperty.call(object, prop);
}
