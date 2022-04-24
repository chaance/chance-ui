export type OneOrMore<ValueType> = ValueType[] | ValueType;

/**
 * The built-in utility type `Omit` does not distribute over unions. So if you
 * have:
 *
 *    type A = { a: 'whatever' }
 *
 * and you want to do a union with:
 *
 *    type B = A & { b: number } | { b: string; c: number }
 *
 * you might expect `Omit<B, 'a'>` to give you:
 *
 *    type B = | Omit<{ a: "whatever"; b: number }, "a"> | Omit<{ a: "whatever";
 *      b: string; c: number }, "a">;
 *
 * This is not the case, unfortunately, so we need to create our own version of
 * `Omit` that distributes over unions with a distributive conditional type. If
 * you have a generic type parameter `T`, then the construct `T extends any ?
 * F<T> : never` will end up distributing the `F<>` operation over `T` when `T`
 * is a union type.
 *
 * @link https://stackoverflow.com/a/59796484/1792019
 * @link
 * http://www.typescriptlang.org/docs/handbook/advanced-types.html#distributive-conditional-types
 */
export type DistributiveOmit<
	BaseType,
	Key extends PropertyKey
> = BaseType extends any ? Omit<BaseType, Key> : never;
