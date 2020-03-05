// index - the place of the block in the chain
// timestamp - the time when the block was created

// previousHash - the sting that contains the hash of the block before this one
// nonce is a random number that doesn't have anything to do with the block but can be changed to smth random

const SHA256 = require('crypto-js/sha256');

const ellipticLibrary = require('elliptic').ec;
const ec = new ellipticLibrary('secp256k1') //instance of elliptic


class Transaction {
    constructor(fromAddress, toAddress, amount) {
            this.fromAddress = fromAddress;
            this.toAddress = toAddress;
            this.amount = amount;
        }
        // method to sign the transaction and a method to check if the signature of this transaction is indeed valid
    calculateHash() {
        //we are going to sign the hash of our transaction only, not all the data in the transaction
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();

    }

    signTransaction(signingKey) {
        //signingKey is the object that we've got from the elliptic library 

        //Before we sign the transaction we check if your public key equals the fromAddress. 
        //You can only spend coins from the wallet you have private key for. 
        //And because the private key is linked to the ppublic key that means the fromAddress in the transaction must equal your public key
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            //if the public key the hex version does not equal the fromAddress of this transaction then there's an error
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash(); //the hash of the transaction
        const sig = signingKey.sign(hashTx, 'base64'); //signature. We're going to sign the hash of our transaction and we will do that in base64 
        this.signature = sig.toDER('hex'); //store this signature into this transaction. DER - is a special format that we want in hex form  
    }

    isValid() {
        if (this.fromAddress === null) return true; //to assume that this transaction is valid


        //if the fromAddress is filled in however we have to do additional checks
        if (!this.signature || this.signature.length === 0) { //check if there's a signature or this signature is just empty
            throw new Error('No signature in this transaction');
        }

        //if we still verifying that means that the transaction is not from the null address, 
        //it has a signature and then we have to verify that the transaction was signed with the correct key 

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        //we make a new publicKey object from the fromAddress
        //because we remember the fromAddress is a publicKey

        return publicKey.verify(this.calculateHash(), this.signature);


        //so if there IS a signature, we're going to extract the publicKey from it 
        //and then we're going to verify that this transaction has indeed signed with that key
    }

}
class Block {
    constructor(timestamp, transactions, previousHash = '') {
            this.previousHash = previousHash;
            this.timestamp - timestamp;
            this.transactions = transactions;
            this.nonce = 0;
            //    the hash of our block
            this.hash = this.calculateHash();
        }
        // calculate the hash function of this block: take the property of the block and run its props through the hash func and then return the hash. It will identify the block on the blockchain 
    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        // make the hash of my block begin with a certain amount of zeros
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) { // will keep looping until the hash starts with enough 0s
            this.nonce++;
            this.hash = this.calculateHash(); //calculate the hash of this block
        }
        console.log("Block mined:   " + this.hash);

    }

    //it is a method that can verify all the transactions in the current block
    hasValidTransactions() {
        for (const tx of this.transactions) { //iterating over all the transactions over the block
            if (!tx.isValid()) { //make sure that every transaction is valid 
                return false;
            }
        }
        return true;
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()]; //aria of blocks
        this.difficulty = 2;
        this.pendingTransactions = []; //незавершенные транзакции или операции = empty aria 
        this.miningReward = 100; //define the proprty that will control how many coins the mainer gets as a reward
    }

    createGenesisBlock() {
        return new Block(Date.parse("01/01/2020"), [], "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash); //Date.now - because it requires timestamp, pendingTransactions - because it reqires some transactions so we will give it all of our pending transactions that are curently stored in our blockchain now
        //when a miner calls this method, it will pass along its wallet address and send the reward to his address, if a miner successfully mined this block
        block.mineBlock(this.difficulty); //mining block

        console.log('Block is successfully mined!');
        this.chain.push(block);


        this.pendingTransactions = [];

        // this.pendingTransactions = [
        //     new Transaction(null, miningRewardAddress, this.miningReward)
        // ];
    }

    addTransaction(transaction) {

        //check if  fromAddress or toAddress are filled in 
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from-addrees and to-address')
        }
        if (!transaction.isValid()) {
            throw new Error('Cannot add an invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction); //it recives a transaction and adds this to the pending transactions' area
    }

    // createTransaction(transaction) {
    //     this.pendingTransactions.push(transaction); //it recives a transaction and adds this to the pending transactions' area
    // }

    getBalanceOfAddress(address) { // this method checks the balance of an address 
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }
                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }

    isChainValid() { //return true or false
        for (let i = 1; i < this.chain.length; i++) { //block 0 is a GenesisBlock
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransactions()) { //to verify if all the transactions in the currentBlock are valid
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateHash()) { //if the hash of the block is still valid
                return false;
            }
            if (currentBlock.previousHash !== previousBlock.calculateHash()) {
                return false;
            }

            return true
        }

    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
// module.exports.Block = Block;