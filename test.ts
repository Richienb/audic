import theModule from "./src"
import test from "ava"

test("main", (t) => {
	t.is(theModule("unicorns"), "unicorns & rainbows")
})
