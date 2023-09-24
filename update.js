const { exec } = require("child_process");
const { readFileSync } = require("fs");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

const { dependencies, devDependencies } = packageJson;

console.log(packageJson);

for (const dependency in dependencies) {
  exec(`yarn install ${dependency}@latest`);
}

for (const devDependency in devDependencies) {
  exec(`yarn install ${devDependency}@latest -d`);
}
