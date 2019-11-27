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
  DEFAULT_DB = data;
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

const connect = ({ uuid, token, url = BASE_URL }) => {
  if (!uuid || !token) {
    throw "uuid and token must be provided";
  }
  let currentDB = { uuid, token, url };
  return constructActions(currentDB);
};

let actions = {
  connect,
  ...constructActions(DEFAULT_DB)
};

console.log(actions);

module.exports = actions;
