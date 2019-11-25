import { get, post, delete as del } from "axios";

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

const EasyDB = config => {
  let { database, token, url = `https://app.easydb.io` } = config;

  return {
    get: (key, cb) => {
      return coherseCallback(
        get(`${url}/database/${database}/${key}`, {
          headers: {
            token
          }
        }),
        cb
      );
    },
    put: (key, value, cb) => {
      return coherseCallback(
        post(
          `${url}/database/${database}/${key}`,
          {
            value
          },
          {
            headers: {
              "Content-Type": "application/json",
              token
            }
          }
        ),
        cb
      );
    },
    delete: (key, cb) => {
      return coherseCallback(
        del(`${url}/database/${database}/${key}`, {
          headers: {
            token
          }
        }),
        cb
      );
    },
    list: cb => {
      return coherseCallback(
        get(`${url}/database/${database}`, {
          headers: { token }
        }),
        cb
      );
    }
  };
};

module.exports = EasyDB;
