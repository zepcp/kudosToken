pragma solidity ^0.4.23;

contract kudos {
    
    event addedUser(address addedUser);
    event removedUser(address removedUser);

    event kudosBurnt(uint kudosAmount, uint kudosValue);
    event kudosMint(address sender, address receiver, uint amount);

    event Error(string func, string message);

    event test(bytes32 func);
    event test2(address func1, address func2);
    event test3(bytes32 func1, bytes32 func2, uint func3);

    address public owner;
    address[] public userList;

    uint public burnPeriod;
    uint public mintPeriod;
    uint public lastBurn;
    uint public mintAmount;
    uint public totalSupply;

    mapping (address => bool) public kudosUser;
    mapping (address => uint) public balanceOf;
    mapping (address => uint) public mintCount;
    mapping (address => uint) public lastReset;

    modifier onlyOwner(string _funcName) {
        if(owner != msg.sender){
            emit Error(_funcName, "Operation can only be performed by contract owner");
            return;
        }
        _;
    }

    constructor (uint _burnPeriod, uint _mintPeriod, uint _mintAmount) public {
        owner = msg.sender;
        burnPeriod = _burnPeriod;
        mintPeriod = _mintPeriod;
        mintAmount = _mintAmount;
        lastBurn = now;
        totalSupply = 0;
    }

    function addUser(address _user) public onlyOwner("addUser"){
    	require(kudosUser[_user] == false);
        kudosUser[_user] = true;
        mintCount[_user] = mintAmount;
        lastReset[_user] = now;        
        userList.push(_user);
        emit addedUser(_user);
    }

    function removeUser(address _user) public onlyOwner("removeUser") {
        kudosUser[_user] = false;
        mintCount[_user] = 0;
        emit removedUser(_user);
    }

    function mintKudos(address _receiver, uint _amount) public {
        require(msg.sender != _receiver);
        require(kudosUser[_receiver] == true);

        mintReset(msg.sender);

        require(mintCount[msg.sender] >= _amount);

        mintCount[msg.sender] = mintCount[msg.sender] - _amount;
		totalSupply = totalSupply + _amount;
        balanceOf[_receiver] = balanceOf[_receiver] + _amount;
        emit kudosMint(msg.sender, _receiver, _amount);
    }

    function mintReset(address _kudoUser) public {
    	require(kudosUser[_kudoUser] == true);
        if (now >= lastReset[_kudoUser] + mintPeriod){
            mintCount[_kudoUser] = mintAmount;
            lastReset[_kudoUser] = now;
            }
    }

    function burnKudos() public {
        require(now >= lastBurn + burnPeriod);
        require(totalSupply > 0);

        uint _ethPool = address(this).balance;
        uint _kudosValue = _ethPool / totalSupply;

        for(uint i = 0; i < userList.length; i++) {
            uint _amount = balanceOf[userList[i]] * _kudosValue;
            userList[i].transfer(_amount);
            balanceOf[userList[i]] = 0;
        }   

        lastBurn = now;
        emit kudosBurnt(totalSupply, _kudosValue);
        totalSupply = 0;
    }

    function splitSignature(bytes memory sig)
        internal
        pure
        returns (uint8 v, bytes32 r, bytes32 s)
    {
        require(sig.length == 65);

        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    function mintSignedKudos(address _sender, address _receiver, uint _amount, bytes _signature) public {
        require(_sender != _receiver);
        require(kudosUser[_receiver] == true);

        mintReset(_sender);

        require(mintCount[_sender] >= _amount);

        bytes32 _messageHash = keccak256(abi.encodePacked(_receiver)); //keccak256 = sha3
        emit test(_messageHash);

        //_messageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash)); //keccak256 = sha3
        //emit test(_messageHash);

		(uint8 v, bytes32 r, bytes32 s) = splitSignature(_signature);
        emit test3(r,s,v);

        if (ecrecover(_messageHash, v, r, s) == _sender) {
            mintCount[_sender] = mintCount[_sender] - _amount;
			totalSupply = totalSupply + _amount;
            balanceOf[_receiver] = balanceOf[_receiver] + _amount;
            emit kudosMint(_sender, _receiver, _amount);
        }
        emit test2(ecrecover(_messageHash, v, r, s), _sender);

    }

}
