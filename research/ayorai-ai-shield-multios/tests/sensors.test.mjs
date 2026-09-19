import assert from "node:assert/strict";
import { collectNetworkSnapshot } from "../agent/network-sensor.mjs";
import { inspectFile } from "../agent/file-sensor.mjs";
import { validateSecurityEvent } from "../runtime/event-core.mjs";

const network = collectNetworkSnapshot();
assert.equal(validateSecurityEvent(network), true);
const file = await inspectFile("package.json");
assert.equal(validateSecurityEvent(file), true);
assert.equal(file.action.type, "observe");
console.log("AYORAI sensor validation: PASSED");
