const assert = require("node:assert/strict");
const {
  normalizeUsername,
  isValidUsername,
  isReservedUsername,
} = require("../src/lib/username");

let failures = 0;

function run(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`fail - ${name}`);
    console.error(error);
  }
}

run("normalizeUsername lowercases and trims", () => {
  assert.equal(normalizeUsername("  AmanPandey "), "amanpandey");
});

run("isValidUsername enforces rules", () => {
  assert.equal(isValidUsername("ab"), false);
  assert.equal(isValidUsername("a@b"), false);
  assert.equal(isValidUsername("john-doe1"), true);
});

run("isReservedUsername blocks system names", () => {
  assert.equal(isReservedUsername("Admin"), true);
  assert.equal(isReservedUsername("signup"), true);
  assert.equal(isReservedUsername("amanpandey"), false);
});

if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
} else {
  console.log("\nAll tests passed.");
}
