// rollup.config.js
export default {
  input: "./src/index.js",
  output: {
    file: "./bundle.js",
    format: "umd",
    globals: {
      axios: "Axios"
    },
    name: "easydb"
  },
  external: ["axios"] // <-- suppresses the warning
};
