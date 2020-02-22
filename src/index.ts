"use strict"

/**
 * My awesome module.
 * @param input Lorem ipsum.
 * @param postfix Lorem ipsum.
 * @example
 * ```
 * const theModule = require("the-module");
 * theModule("unicorns");
 * //=> 'unicorns & rainbows'
 * ```
*/
export = function theModule(input: string, { postfix = "rainbows" }: { postfix?: string } = {}) {
	if (typeof input !== "string") throw new TypeError(`Expected a string, got ${typeof input}`)

	return `${input} & ${postfix}`
}
