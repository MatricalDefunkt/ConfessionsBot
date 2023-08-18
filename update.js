const { exec } = require("child_process");
const { readFileSync } = require("fs");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

const { dependencies, devDependencies } = packageJson;

for (const dependency in dependencies) {
  exec(`bun install ${dependency}@latest`);
}

for (const devDependency in devDependencies) {
  exec(`bun install ${devDependency}@latest -d`);
}
