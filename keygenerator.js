// this file is to generate our private and public key to actually make ourselves a wallet 
// in this file we import a library called elliptic. This library will allow us to generate a private and public key, it also has methods to sign sth and a method to verify a signature 
// instalation: npm install elliptic
//secp256k1 - the algorithm that's also the basis of Bitcoin wallets
const ellipticLibrary = require('elliptic').ec;
const ec = new ellipticLibrary('secp256k1') //instance of elliptic

const key = ec.genKeyPair(); //generating a key pair
const publicKey = key.getPublic('hex'); //extracting the public key which is in a hex format
const privateKey = key.getPrivate('hex'); // extracting the private key which is in a hex format


console.log();
console.log('Private key: ', privateKey);


console.log();
console.log('Public key: ', publicKey);


// Private key:  9bc74c14f2d0afc0d37f231f2c356166ec5bcab5ca3d86b19522cec4d7f704fc

// Public key:  04dc36b07bfd355ab5723dfa2eeb77a022853529dbafce040df4d957d8d0053afc85a3fe2156b5b837b1a721a777ad01976fb06b2436659bf95b4c69657512f3c1