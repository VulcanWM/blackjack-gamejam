import { useState } from 'react'
import './App.css'

// determine whether blackjack
// if yes, then give

function calculateTotal(cards){
    let total = 0;
    let numberOfA = 0;
    for (let i = 0; i < cards.length; i++){
        if (cards.rank == "A"){
            total += 11;
            numberOfA++;
        } else if (cards.rank == "J" || cards.rank == "Q" || cards.rank == "K"){
            total += 10;
        } else {
            total += parseInt(cards.rank);
        }
    }
    while (numberOfA > 0 && total > 21) {
        numberOfA--;
        total -= 10;
    }

    return total;
}


function comb(n, k) {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    let res = 1;
    for (let i = 1; i <= k; i++) {
        res *= (n - i + 1) / i;
    }
    return res;
}

function weightedChoice(items, weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;

    for (let i = 0; i < items.length; i++) {
        if (r < weights[i]) return items[i];
        r -= weights[i];
    }
}

function card_shuffle(n, deck){
    const total = 52
    const probs = {}
    for (let i = 0; i<total+1; i++){
        const prob = comb(total, i) * 0.5**total
        probs[i] = prob
    }

    for (let i = 0; i < n; i++){
        let left =  Number(weightedChoice(Object.keys(probs), Object.values(probs)))
        let right = total - left
        const leftArr = deck.slice(0, left)
        const rightArr = deck.slice(left)

        const newDeck = []
        for (let j = 0; j < total; j++){
            const takeLeft = Math.random() < left / (left + right);
            if (takeLeft) {
                newDeck.push(leftArr.shift());
                left--;
            } else {
                newDeck.push(rightArr.shift());
                right--;
            }
        }
        deck = newDeck
    }
    return deck
}


function App() {
    const [message, setMessage] = useState('');

    const [count, setCount] = useState(0)

    const [money, setMoney] = useState(1000);
    const [bet, setBet] = useState(100);
    const [gameInProgress, setGameInProgress] = useState(false);
    const [gameEnded, setGameEnded] = useState(false);
    const [needToSeeDealerCards, setNeedToSeeDealerCards] = useState(false);

    const [deck, setDeck] = useState<{rank: string, suit: string}[]>([]);

    const [userCards, setUserCards] = useState<{rank: string, suit: string}[]>([]);

    const [dealerCards, setDealerCards] = useState([]);


    function startGame(){
        if (bet <= 0){
            setMessage("You have to bet a positive integer.");
            return;
        }

        if (bet > money){
            setMessage("You cannot bet more than what you have..");
            return;
        }
        setMoney(money - bet);
        setGameInProgress(true);
        setGameEnded(false);
        let newDeck = [];
        const suits = ["♦", '♥', '♠', '♣'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        for (let i = 0; i < suits.length; i++){
            for (let j = 0; j < ranks.length; j++){
                newDeck.push({rank: ranks[j], suit: suits[i]});
            }
        }

        newDeck = card_shuffle(10, newDeck);
        setDeck(newDeck);
        const newUserCards = []
        const newDealerCards = []
        for (let i = 0; i < 2; i++){
            const card = newDeck[0];
            newUserCards.push(card);
            newDeck.splice(0, 1)
        }
        for (let i = 0; i < 2; i++){
            const card = newDeck[0];
            newDealerCards.push(card);
            newDeck.pop(0);
        }

        setUserCards(newUserCards);
        setDealerCards(newDealerCards);

        const total = calculateTotal(newUserCards);

        if (total == 21){
            setMoney(bet * 5/2);
            setGameEnded(true);
            setMessage("You got blackjack!");
            setNeedToSeeDealerCards(false);
        }
    }


    return (
        <>
            <p className="text-red-300">{message}</p>
            <h1>Blackjack</h1>
            <p>Money: {money}</p>
            {gameInProgress ?
                <div>
                    <p>Hi</p>
                    <p className="text-red-300">Your cards are:</p>
                    <div className="flex flex-row">
                        {userCards.map((card, i) =>
                            <div className={"h-24 w-12 bg-blue-200"}>{card.rank}{card.suit}</div>
                        )}
                    </div>
                </div>
            :   <div>
                    {gameEnded &&
                        <p></p>
                    }
                    <p>Bet:</p>
                    <input type="number" value={bet} onChange={e => setBet(parseInt(e.target.value))}></input>
                    <button onClick={startGame}>Start Game</button>
                </div>
            }
        </>
    )
}

export default App
