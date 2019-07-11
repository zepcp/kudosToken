import os
import json
import web3

from web3 import Web3, HTTPProvider
from solc import compile_source
from web3.contract import ConciseContract

WEI_ETHER = 10**18

# web3.py Instance
w3 = Web3(HTTPProvider('http://%s:%d' % ('localhost', 8545), request_kwargs={'timeout': 60}))

BASENAME = os.path.realpath(__file__)
BASE_DIR = os.path.dirname(BASENAME)+'/contracts'

# Solidity Source Code
CONTRACT_SOURCE_CODE = open(os.path.join(BASE_DIR, 'kudos.sol')).read().strip()

# Compiled source code
compiled_sol = compile_source(CONTRACT_SOURCE_CODE)
contract_interface = compiled_sol['<stdin>:kudos']

#Unlock Account
src = '0x3db82142DC5857b30741FfFA87dF09dCe9D21B7F'
password = 'test'
unlocked = w3.personal.unlockAccount(src, password) 

# set pre-funded account as sender
w3.eth.defaultAccount = src

# Instantiate and deploy contract
kudos = w3.eth.contract(abi=contract_interface['abi'], bytecode=contract_interface['bin'])

# Submit the transaction that deploys the contract
#tx_hash = decentralizedBank.constructor().transact()
#print(w3.toHex(tx_hash)) # 0x8fbf361e26b3adae563153d5c1816fb440b1da044547a3df28ffa2039555273b

# Wait for the transaction to be mined, and get the transaction receipt
#tx_receipt = w3.eth.waitForTransactionReceipt(tx_hash)
#print(tx_receipt)

contractAddress = ''

# Create the contract instance with the newly-deployed address
kudos = w3.eth.contract(
    address=contractAddress,
    abi=contract_interface['abi'],
)

#print('Make 1st Deposit')
#tx_hash = kudos.functions.addUser('0x3db82142DC5857b30741FfFA87dF09dCe9D21B7F').transact()
#print(w3.toHex(tx_hash))
