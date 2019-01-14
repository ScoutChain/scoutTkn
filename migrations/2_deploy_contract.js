var SCTtoken = artifacts.require("./SCTtoken.sol");

module.exports = function(deployer) {
  deployer.deploy(SCTtoken);
};
