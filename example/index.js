const SimpleState = require("../index");

const globalState = {
  internal: SimpleState({
    restarts: 0,
  }, {persist: ["restarts"], persistRelPath: "storage/internal"}),
  device: SimpleState({
    name: "Simple Device",
    uuid: "12345abcd"
  }, {persist: ["name", "uuid"], persistRelPath: "storage/device"}),
  networking: SimpleState({
    port: 80,
  }, {persist: ["port"], persistRelPath: "storage/networking"}),
};

module.exports = globalState;
