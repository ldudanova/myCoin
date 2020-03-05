const { Blockchain, Transaction } = require('./blockchain');

const ellipticLibrary = require('elliptic').ec;
const ec = new ellipticLibrary('secp256k1') //instance of elliptic

const myKey = ec.keyFromPrivate('9bc74c14f2d0afc0d37f231f2c356166ec5bcab5ca3d86b19522cec4d7f704fc');
const myWalletAddress = myKey.getPublic('hex');


let myCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'public key goes here to someone else wallet', 10); //transaction goes from my own wallet to someone else's wallet. And we send 10 coins 
tx1.signTransaction(myKey); //sign the transaction with myKey
myCoin.addTransaction(tx1);


// myCoin.addTransaction(new Transaction('address1', 'address2', 100));
// myCoin.addTransaction(new Transaction('address2', 'address1', 50));

console.log('\n Starting the miner...');
myCoin.minePendingTransactions(myWalletAddress);

console.log('\nBalance of Hurma is ', myCoin.getBalanceOfAddress(myWalletAddress));

myCoin.chain[1].transactions[0].amount = 1;


console.log('Is chain valid?', myCoin.isChainValid());


// console.log('\n Starting the miner again...');
// myCoin.minePendingTransactions('hurma-address');

// console.log('\nBalance of Hurma is ', myCoin.getBalanceOfAddress('hurma-address'));