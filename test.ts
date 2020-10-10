import Audic from "./source" // eslint-disable-line node/no-missing-import
import is from "@sindresorhus/is"
import test, { ExecutionContext } from "ava" // eslint-disable-line @typescript-eslint/no-unused-vars

test("main", (t: ExecutionContext) => {
	t.true(is.class_(Audic))
})
