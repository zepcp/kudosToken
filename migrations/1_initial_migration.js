var Migrations = artifacts.require("./Migrations.sol");
var kudos = artifacts.require("./kudos.sol");

var burnPeriod = 60*60*24*21;
var mintPeriod = 60*60*24*7;
var mintAmount = 10;

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(kudos, burnPeriod, mintPeriod, mintAmount);
};
