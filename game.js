const crypto = require('crypto');
const readline = require('readline');

class KeyManager {
    static generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    static calculateHMAC(key, message) {
        return crypto.createHmac('sha256', key).update(message).digest('hex');
    }
}

class GameLogic {
    static determineWinner(userMoveIndex, computerMoveIndex, totalMoves) {
        const p = Math.floor(totalMoves / 2);
        const result = (userMoveIndex - computerMoveIndex + totalMoves) % totalMoves;
        if (result === 0) return 'Draw';
        return result <= p ? 'Win' : 'Lose';
    }
}

class HelpTable {
    static generateTable(moves) {
        const totalMoves = moves.length;
        let table = `+------------+ ${moves.join(' | ')} +\n`;
        table += `+------------+${'-'.repeat(12 * totalMoves)}+\n`;

        for (let i = 0; i < totalMoves; i++) {
            table += `| ${moves[i]}    |`;
            for (let j = 0; j < totalMoves; j++) {
                if (i === j) table += ' Draw  |';
                else table += GameLogic.determineWinner(i, j, totalMoves) === 'Win' ? ' Win   |' : ' Lose  |';
            }
            table += '\n';
        }
        console.log(table);
    }
}

class GameManager {
    constructor(moves) {
        this.moves = moves;
        this.key = KeyManager.generateKey();
        this.computerMove = this.moves[Math.floor(Math.random() * this.moves.length)];
        this.hmac = KeyManager.calculateHMAC(this.key, this.computerMove);
    }

    start() {
        console.log(`HMAC: ${this.hmac}`);
        this.showMenu();
    }

    showMenu() {
        console.log('Available moves:');
        this.moves.forEach((move, index) => {
            console.log(`${index + 1} - ${move}`);
        });
        console.log('0 - exit');
        console.log('? - help');

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question('Enter your move: ', (input) => {
            if (input === '0') {
                console.log('Exiting...');
                rl.close();
                return;
            }

            if (input === '?') {
                HelpTable.generateTable(this.moves);
                this.showMenu();
                rl.close();
                return;
            }

            const userMoveIndex = parseInt(input) - 1;
            if (isNaN(userMoveIndex) || userMoveIndex < 0 || userMoveIndex >= this.moves.length) {
                console.log('Invalid move, please try again.');
                this.showMenu();
                rl.close();
                return;
            }

            this.processResult(userMoveIndex);
            rl.close();
        });
    }

    processResult(userMoveIndex) {
        const userMove = this.moves[userMoveIndex];
        console.log(`Your move: ${userMove}`);
        console.log(`Computer move: ${this.computerMove}`);

        const result = GameLogic.determineWinner(userMoveIndex, this.moves.indexOf(this.computerMove), this.moves.length);
        console.log(`You ${result}!`);
        console.log(`HMAC key: ${this.key}`);
    }
}

function validateInput(args) {
    const moves = args.slice(2);
    if (moves.length < 3 || moves.length % 2 === 0) {
        console.error('Error: Please provide an odd number of moves (>= 3).');
        return null;
    }
    if (new Set(moves).size !== moves.length) {
        console.error('Error: Moves should be unique.');
        return null;
    }
    return moves;
}

const moves = validateInput(process.argv);
if (moves) {
    const gameManager = new GameManager(moves);
    gameManager.start();
}