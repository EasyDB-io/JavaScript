import axios from "axios";

let axiom = (data, err, fn) => fn(data, err);

let oof = (axe, cb) => {
  let p = new Promise((res, rej) =>
    axe
      .then(response =>
        axiom(response.data, null, cb || ((data, _) => res(data)))
      )
      .catch(e => axiom(null, e.response.data, (_, err) => rej(err)))
  );
  return cb ? null : p;
};

const EasyDB = config => {
  let { database, token, url = `https://app.easydb.io` } = config;

  return {
    Get: (key, cb) => {
      return oof(
        axios.get(`${url}/database/${database}/${key}`, {
          headers: {
            token
          }
        }),
        cb
      );
    },
    Put: (key, value, cb) => {
      return oof(
        axios.post(
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
    Delete: (key, cb) => {
      return oof(
        axios.delete(`${url}/database/${database}/${key}`, {
          headers: {
            token
          }
        }),
        cb
      );
    },
    List: cb => {
      return oof(
        axios.get(`${url}/database/${database}`, {
          headers: { token }
        }),
        cb
      );
    }
  };
};

module.exports = EasyDB;
