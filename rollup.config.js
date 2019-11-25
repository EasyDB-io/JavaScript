// rollup.config.js
export default {
  input: "./src/index.js",
  output: {
    file: "./bundle.js",
    format: "umd",
    globals: {
      axios: "Axios"
    }
  },
  external: ["axios"] // <-- suppresses the warning
};
