const kudos = artifacts.require('./kudos.sol');
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545")) // Hardcoded development port

const timeTravel = function (time) {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [time], // 86400 is num seconds in day
      id: new Date().getTime()
    }, (err, result) => {
      if(err){ return reject(err) }
      return resolve(result)
    });
  })
}

const mineBlock = function () {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_mine"
    }, (err, result) => {
      if(err){ return reject(err) }
      return resolve(result)
    });
  })
}

contract('kudos', function(accounts) {
  var owner = accounts[0];
  var user1 = accounts[1];
  var user2 = accounts[2];
  var user3 = accounts[3];
  var user4 = accounts[4];

  it("Take1 - Add User1", async function() {
    let kudosContract = await kudos.deployed();
    await kudosContract.addUser(user1, {from: owner});
    isUser = await kudosContract.kudosUser.call(user1);
    assert.equal(await isUser, true, "KO - User Doesnt Exist");
    console.log("Take1 - User1 Added");
  });

  it("Take2 - Add User2", async function() {
    let kudosContract = await kudos.deployed();
    await kudosContract.addUser(user2, {from: owner});
    isUser = await kudosContract.kudosUser.call(user2);
    assert.equal(await isUser, true, "KO - User Doesnt Exist");
    console.log("Take2 - User2 Added");
  });

  it("Take3 - Confirm Mapping Values", async function() {
    let kudosContract = await kudos.deployed();
    balanceOfUser1 = await kudosContract.balanceOf.call(user1);
    balanceOfUser2 = await kudosContract.balanceOf.call(user2);
    mintCountUser1 = await kudosContract.mintCount.call(user1);
    mintCountUser2 = await kudosContract.mintCount.call(user2);
    assert.equal(await balanceOfUser1, 0, "KO - User1 Wrong Balance");
    assert.equal(await balanceOfUser2, 0, "KO - User2 Wrong Balance");
    assert.equal(await mintCountUser1, 10, "KO - User1 Wrong Mint Count");
    assert.equal(await mintCountUser2, 10, "KO - User2 Wrong Mint Count");
    console.log("Take3 - Confirm Mapping Values");
  });

  it("Take4 - User1 Mints To User2", async function() {
    let kudosContract = await kudos.deployed();
    await kudosContract.mintKudos(user2, 5, {from: user1});
    mintCountUser1 = await kudosContract.mintCount.call(user1);
    balanceOfUser2 = await kudosContract.balanceOf.call(user2);
    assert.equal(await mintCountUser1, 5, "KO - User1 Wrong Mint Count");
    assert.equal(await balanceOfUser2, 5, "KO - User2 Wrong Balance");
    console.log("Take4 - User1 Mints To User2");
  });

  it("Take5 - Time Travel to mintReset + User1 Mints To User2", async function() {
    let kudosContract = await kudos.deployed();
    await timeTravel(60*60*24*8) //400 days later
    await kudosContract.mintKudos(user2, 1, {from: user1});
    
    balanceOfUser1 = await kudosContract.balanceOf.call(user1);
    balanceOfUser2 = await kudosContract.balanceOf.call(user2);
    mintCountUser1 = await kudosContract.mintCount.call(user1);
    mintCountUser2 = await kudosContract.mintCount.call(user2);
    assert.equal(await balanceOfUser1, 0, "KO - User1 Wrong Balance");
    assert.equal(await balanceOfUser2, 6, "KO - User2 Wrong Balance");
    assert.equal(await mintCountUser1, 9, "KO - User1 Wrong Mint Count");
    assert.equal(await mintCountUser2, 10, "KO - User2 Wrong Mint Count");
    console.log("Take5 - Time Travel to mintReset + User1 Mints To User2");
  });

  it("Take6 - Time Travel to burnKudos", async function() {
    let kudosContract = await kudos.deployed();
    await timeTravel(60*60*24*22) //400 days later
    await kudosContract.burnKudos({from: user1});
    
    balanceOfUser1 = await kudosContract.balanceOf.call(user1);
    balanceOfUser2 = await kudosContract.balanceOf.call(user2);
    assert.equal(await balanceOfUser1, 0, "KO - User1 Wrong Balance");
    assert.equal(await balanceOfUser2, 0, "KO - User2 Wrong Balance");
    console.log("Take6 - Time Travel to burnKudos");
  });

  it("Take7 - User3 Mints In Name Of User2 To User1", async function() {
    var hash = web3.sha3(user1, {encoding:"hex"});
    console.log('test - '+hash);
    signature = web3.eth.sign(user2, hash);
    console.log('test2 - '+signature);

    r = "0x" + signature.slice(2, 66);
    s = "0x" + signature.slice(66, 130);
    v = new Buffer(signature.slice(130, 132), "hex");
    v = v[0].valueOf();
    console.log("r: ", r, "s: ", s, "v: ", v);

    let kudosContract = await kudos.deployed();
    await kudosContract.mintSignedKudos(user2, user1, 5, signature, {from: user3});
    mintCountUser1 = await kudosContract.mintCount.call(user2);
    balanceOfUser2 = await kudosContract.balanceOf.call(user1);
    assert.equal(await mintCountUser1, 5, "KO - User1 Wrong Mint Count");
    assert.equal(await balanceOfUser2, 5, "KO - User2 Wrong Balance");
    console.log("Take5 - User3 Mints In Name Of User2 To User1");
  });

});
