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
