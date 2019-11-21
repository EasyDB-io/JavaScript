// import easyDB from "easydb-io";
const easyDB = require("easydb-io");
// import uuid from "uuid/v4";

let db = easyDB({
  database: "e9189a59-68b3-4cfb-892d-3527c0cf6bac",
  token: "64eea1c5f3d84401b554f60dda46491d"
  // url: "http://localhost:8080"
});

const runner = async () => {
  //while (true) {
  // db.Put(uuid(), { [uuid()]: uuid() });
  db.Delete("e22975eb-1506-4881-b1ea-efaad7d44b8d");
  const data = await db.List();
  console.log(data);
  //}
};

runner();
