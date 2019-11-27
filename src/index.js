import {
  get as AxiosGet,
  post as AxiosPost,
  delete as AxiosDelete
} from "axios";
import fs from "fs";
import uuid from "uuid/v4";

const BASE_URL = "https://app.easydb.io";
const CONFIG_FILE = "./easydb.config.json";

const isNode = () => {
  return typeof process !== "undefined" && process.release.name === "node";
};

if (isNode && !fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(
    CONFIG_FILE,
    JSON.stringify({ uuid: uuid(), token: uuid(), url: BASE_URL }, null, 2)
  );
}

const coherseCallback = (axiosPromise, callback) => {
  let p = new Promise((resolve, reject) => {
    axiosPromise
      .then(response => {
        let { data } = response;
        if (callback) {
          callback(null, data);
          return;
        }
        resolve(data);
      })
      .catch(err => {
        if (callback) {
          callback(err);
          return;
        }
        reject(err);
      });
  });
  return callback ? null : p;
};

let DEFAULT_DB;

if (isNode && fs.existsSync(CONFIG_FILE)) {
  let data = JSON.parse(fs.readFileSync(CONFIG_FILE));
  let { uuid, token } = data.databases.default;
  DEFAULT_DB = { uuid, token, url: data.url };
}

const instanceActions = {
  get: (DB, key, cb) => {
    return coherseCallback(
      AxiosGet(`${DB.url}/database/${DB.uuid}/${key}`, {
        headers: {
          token: DB.token
        }
      }),
      cb
    );
  },
  put: (DB, key, value, cb) => {
    return coherseCallback(
      AxiosPost(
        `${DB.url}/database/${DB.uuid}/${key}`,
        {
          value
        },
        {
          headers: {
            "Content-Type": "application/json",
            token: DB.token
          }
        }
      ),
      cb
    );
  },
  delete: (DB, key, cb) => {
    return coherseCallback(
      AxiosDelete(`${DB.url}/database/${DB.uuid}/${key}`, {
        headers: {
          token: DB.token
        }
      }),
      cb
    );
  },
  list: (DB, cb) => {
    return coherseCallback(
      AxiosGet(`${DB.url}/database/${DB.uuid}`, {
        headers: { token: DB.token }
      }),
      cb
    );
  }
};

const constructActions = database => {
  if (!database) {
    throw "Database uninitialized. Init, connect, or use an easydb.config.json";
  }
  return Object.keys(instanceActions).reduce((acc, action) => {
    acc[action] = (...params) => {
      instanceActions[action](database, ...params);
    };
    return acc;
  }, {});
};

const connect = params => {
  let uuid, token;
  let configData = JSON.parse(fs.readFileSync(CONFIG_FILE));

  if (typeof params === "string" || params == null) {
    // Initialize from config
    if (!params) {
      // Nothing provided, connect to default
      params = "default";
    }
    if (!configData.databases[params]) {
      let validChoices = Object.keys(configData.databases)
        .map(s => ` - ${s}`)
        .join("\n");
      throw `Could not find database ${params} in easydb.config.json\n Valid databases are: \n${validChoices}`;
    }
    let database = configData.databases[params];
    uuid = database.uuid;
    token = database.token;
  } else if (typeof params === "object") {
    // Initialize from object
    uuid = params.uuid;
    token = params.token;
  } else {
    throw "Invalid parameters passed to connect(Object | String)";
  }
  if (!uuid || !token) {
    throw "uuid and token must be provided";
  }
  let currentDB = { uuid, token, url: configData.url };
  return constructActions(currentDB);
};

let actions = {
  connect,
  ...constructActions(DEFAULT_DB)
};

console.log(actions);

module.exports = actions;
