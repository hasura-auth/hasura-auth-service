var dotenv = require("dotenv");

dotenv.config({ path: "./test/.test.env" });

module.exports = {
  extension: ["ts"],
  spec: "test/**/*.test.ts",
  require: ["ts-node/register"],
  slow: 500
};
