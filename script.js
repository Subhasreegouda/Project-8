// Block class
class Block {
    constructor(index, previousHash, timestamp, transactions, hash, nonce) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.hash = hash;
        this.nonce = nonce; // For Proof of Work
    }
}

// Blockchain class
class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.difficulty = 2; // Proof of Work difficulty
    }

    // Create the Genesis Block (the first block)
    createGenesisBlock() {
        return new Block(0, "0", Date.now(), [], this.calculateHash(0, "0", Date.now(), []), 0);
    }

    // Calculate the hash for a block
    calculateHash(index, previousHash, timestamp, transactions, nonce = 0) {
        const hashInput = index + previousHash + timestamp + JSON.stringify(transactions) + nonce;
        return this.sha256(hashInput);
    }

    // SHA-256 hash function
    sha256(input) {
        return crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
            .then(buffer => {
                return Array.from(new Uint8Array(buffer))
                    .map(byte => byte.toString(16).padStart(2, '0'))
                    .join('');
            });
    }

    // Add a new transaction to the pending transactions
    addTransaction(transactionData) {
        this.pendingTransactions.push(transactionData);
    }

    // Mine a new block
    async mineBlock() {
        const previousBlock = this.chain[this.chain.length - 1];
        const index = previousBlock.index + 1;
        const timestamp = Date.now();
        let nonce = 0;
        let hash = await this.calculateHash(index, previousBlock.hash, timestamp, this.pendingTransactions, nonce);

        // Proof of Work: find a valid hash by adjusting nonce
        while (!hash.startsWith('0'.repeat(this.difficulty))) {
            nonce++;
            hash = await this.calculateHash(index, previousBlock.hash, timestamp, this.pendingTransactions, nonce);
        }

        const newBlock = new Block(index, previousBlock.hash, timestamp, this.pendingTransactions, hash, nonce);
        this.chain.push(newBlock);
        this.pendingTransactions = []; // Clear pending transactions
        return newBlock;
    }

    // Validate the blockchain
    async isValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            const recalculatedHash = await this.calculateHash(currentBlock.index, previousBlock.hash, currentBlock.timestamp, currentBlock.transactions, currentBlock.nonce);
            if (currentBlock.hash !== recalculatedHash) {
                return false;
            }
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

// Initialize blockchain
const blockchain = new Blockchain();

// Add Transaction Button
document.getElementById('addTransactionBtn').addEventListener('click', () => {
    const transactionData = document.getElementById('transactionInput').value;
    if (transactionData) {
        blockchain.addTransaction(transactionData);
        document.getElementById('transactionInput').value = ''; // Clear input
        alert('Dear candidates, your transaction has been successfully added!');
    }
});

// Mine Block Button
document.getElementById('mineBlockBtn').addEventListener('click', async () => {
    const newBlock = await blockchain.mineBlock();
    displayBlockchain();
    alert('Block mined: ' + JSON.stringify(newBlock, null, 2));
});

// Validate Blockchain Button
document.getElementById('validateChainBtn').addEventListener('click', async () => {
    const isValid = await blockchain.isValid();
    document.getElementById('validationResult').textContent = isValid ? "Dear candidates, the blockchain has been validated!" : "Blockchain valid!";
});

// Display the blockchain
function displayBlockchain() {
    const blockchainList = document.getElementById('blockchainList');
    blockchainList.innerHTML = ''; // Clear previous blockchain
    blockchain.chain.forEach(block => {
        const listItem = document.createElement('li');
        listItem.textContent = `Block ${block.index} | Hash: ${block.hash} | Nonce: ${block.nonce}`;
        blockchainList.appendChild(listItem);
    });
}

// Initial display
displayBlockchain();
