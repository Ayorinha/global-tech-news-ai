import assert from "node:assert/strict";
import shield from "../security-shield.js";
import benchmark from "../security-benchmark.js";

const report = benchmark.run(shield);

assert.equal(report.totals.tests, 11);
assert.equal(report.totals.adversarial, 9);
assert.equal(report.totals.benign, 2);
assert.equal(report.metrics.bypassed, 0);
assert.equal(report.metrics.false_positives, 0);
assert.equal(report.metrics.detection_rate, 100);
assert.ok(report.results.every(r => r.passed), "All benchmark cases must meet their expected decision");

console.log(JSON.stringify(report, null, 2));
