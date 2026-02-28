import { useState, useEffect } from 'react'
import './App.css'

function calculateTotal(cards: {rank: string, suit: string}[]){
    let total = 0;
    let numberOfA = 0;
    for (let i = 0; i < cards.length; i++){
        const card = cards[i];
        if (card.rank == "A"){
            total += 11;
            numberOfA++;
        } else if (card.rank == "J" || card.rank == "Q" || card.rank == "K"){
            total += 10;
        } else {
            total += parseInt(card.rank);
        }
    }
    while (numberOfA > 0 && total > 21) {
        numberOfA--;
        total -= 10;
    }

    return total;
}


function comb(n: number, k: number) {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    let res = 1;
    for (let i = 1; i <= k; i++) {
        res *= (n - i + 1) / i;
    }
    return res;
}

function weightedChoice(items: string[], weights: number[]) {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;

    for (let i = 0; i < items.length; i++) {
        if (r < weights[i]) return items[i];
        r -= weights[i];
    }
}

function card_shuffle(n: number, deck: {rank: string, suit: string}[]){
    const total = 52
    const probs: {[key: number]: number} = {}
    for (let i = 0; i<total+1; i++){
        probs[i] = comb(total, i) * 0.5**total
    }

    for (let i = 0; i < n; i++){
        let left =  Number(weightedChoice(Object.keys(probs), Object.values(probs)))
        let right = total - left
        const leftArr = deck.slice(0, left)
        const rightArr = deck.slice(left)

        const newDeck: {rank: string, suit: string}[]  = []
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
    // work on ui
    // submit
    const [seeingInstructions, setSeeingInstructions] = useState<boolean>(true);
    const [seconds, setSeconds] = useState<number>(60);

    const [currentLevel, setCurrentLevel] = useState(1);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const [money, setMoney] = useState(1000);
    const [bet, setBet] = useState(100);
    const [gameInProgress, setGameInProgress] = useState(false);
    const [gameEnded, setGameEnded] = useState(false);
    const [needToSeeDealerCards, setNeedToSeeDealerCards] = useState(false);

    const [deck, setDeck] = useState<{rank: string, suit: string}[]>([]);

    const [userCards, setUserCards] = useState<{rank: string, suit: string}[]>([]);

    const [dealerCards, setDealerCards] = useState<{rank: string, suit: string}[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!seeingInstructions) {
                setSeconds(prev => prev - 1);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [seeingInstructions]);

    function startGame(){
        setMessage("");
        if (bet <= 0){
            setMessage("You have to bet a positive integer.");
            setMessageType("failure");
            return;
        }

        if (bet > money){
            setMessage("You cannot bet more than what you have..");
            setMessageType("failure");
            return;
        }
        setMoney(money => money - bet);
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
            newDeck.splice(0, 1);
        }

        setUserCards(newUserCards);
        setDealerCards(newDealerCards);

        const total = calculateTotal(newUserCards);

        if (total == 21){
            setMoney(bet * 5/2);
            setGameEnded(true);
            setMessage("You got blackjack!");
            setMessageType("success");
            setGameInProgress(false);
            setNeedToSeeDealerCards(false);
            setCurrentLevel(currentLevel => currentLevel + 1);
        }
    }

    function hit(){
        setMessage("");
        const newDeck = [...deck];
        const newUserCards = [...userCards];
        const card = newDeck[0];
        newUserCards.push(card);
        newDeck.splice(0, 1);
        setDeck(newDeck);
        setUserCards(newUserCards);
        const total = calculateTotal(newUserCards);
        if (total < 21) return;
        if (total > 21){
            setMessage("Bust!");
            setMessageType("failure");
            setGameEnded(true);
            setNeedToSeeDealerCards(false);
            setGameInProgress(false);
            setCurrentLevel(1);
            return;
        }
        stand();
    }

    function stand(){
        setMessage("");
        const newDeck = [...deck];
        const newDealerCards = [...dealerCards];
        let dealerTotal = calculateTotal(newDealerCards);
        while (dealerTotal < 17){
            const card = newDeck[0];
            newDealerCards.push(card);
            newDeck.splice(0, 1);
            dealerTotal = calculateTotal(newDealerCards);
        }

        setDealerCards(newDealerCards);
        setDeck(newDeck);

        if (dealerTotal > 21){
            setMessage("You won because the dealer got bust!");
            setMessageType("success");
            setMoney(money => money + bet * 2);
            setGameEnded(true);
            setNeedToSeeDealerCards(true);
            setGameInProgress(false);
            setCurrentLevel(currentLevel => currentLevel + 1);
            return;
        }

        const userTotal = calculateTotal(userCards);

        // compare values
        if (userTotal > dealerTotal){
            setMessage("You won because you have more than the dealer!");
            setMessageType("success");
            setCurrentLevel(currentLevel => currentLevel + 1);
            setMoney(money => money + bet * 2);
        } else if (dealerTotal > userTotal){
            setMessage("You lost because the dealer has higher!");
            setMessageType("failure");
            setCurrentLevel(1);
        } else {
            setMessage("It's a draw!")
            setMessageType("idk");
            setMoney(money => money + bet);
        }

        setGameEnded(true);
        setNeedToSeeDealerCards(true);
        setGameInProgress(false);
    }


    return (
        <div>
            {((money <= 0 && !gameInProgress) || seconds <= 0) ?
                <div
                    className="bg-[url(/dead.jpeg)] h-screen w-screen bg-cover bg-no-repeat
             flex flex-col items-center justify-center text-center p-5"
                >
                    <h1 className="text-9xl font-extrabold text-red-500">YOU DIED!!!</h1>
                    <p className={"text-black"}>{money <= 0 ? "A sea monster ate you up because you lost all your money" : "You ran out of time and a whirpool sucked you up"}</p>
                </div>
            :
                <>
                    {seeingInstructions ?
                        <div className={"bg-[url(/1bg.jpeg)] h-screen bg-cover bg-no-repeat w-screen p-5"}>
                            <h1 className={"text-7xl font-extrabold"}>Blackjack (Under the sea)</h1>
                            <h3 className={"text-2xl font-bold"}>How to win</h3>
                            <ul>
                                <li>You start with 1000 tokens</li>
                                <li>Choose how much you'd like to bet</li>
                                <li>You are on a timer, escape the sea by completing all 5 levels before you drown</li>
                                <li>Every time you win a round you go up a level</li>
                                <li>If you lose the round, you go straight back to the first level</li>
                                <li>If you run out of time, instant death straight to level one</li>
                            </ul>
                            <h3 className={"text-2xl font-bold"}>How to play each round</h3>
                            <ul>
                                <li><span className={"font-bold"}>Aim of each round</span>: Try get a higher score than the dealer, but remain under 21</li>
                                <li>You initially get dealt 2 cards, and you can see the dealer's first card</li>
                                <li>You can choose either to hit, meaning get another card, or stand, meaning your current total is the total which the dealer will try to beat</li>
                                <li>You can hit as many times as you like, but if your score goes above 21, its a BUST, and you lose the money you bet</li>
                                <li>If your total is higher than the dealer, you win, get money, and go up a level.</li>
                                <li>5 wins = Game won. If you lose at any point, instant death straight to level 1. If you run out of money, instant death straight to level one.</li>
                            </ul>
                            <button className="bg-blue-500 p-2 rounded-xl hover:bg-blue-400" onClick={() => (setSeeingInstructions(false))}>Start Game</button>
                        </div>
                        :
                        <>
                            {currentLevel == 6 ?
                                <div className={"h-screen bg-cover bg-no-repeat w-screen bg-[url(/win.jpeg)] p-5"}>
                                    <p className={"text-green-800 text-9xl"}>You won!</p>
                                    <p className={"text-red-500 font-extrabold text-4xl"}>Don't gamble in real life</p>
                                </div>
                                :
                                <div className={`${currentLevel == 1 && "bg-[url(/1bg.jpeg)]"} ${currentLevel == 2 && "bg-[url(/2bg.jpeg)]"} ${currentLevel == 3 && "bg-[url(/3bg.jpeg)]"} ${currentLevel == 4 && "bg-[url(/4bg.jpeg)]"} ${currentLevel == 5 && "bg-[url(/5bg.jpeg)]"} h-screen bg-cover bg-no-repeat w-screen p-5`}>
                                    <h1 className={"font-7xl font-bold"}>Blackjack</h1>
                                    <p>Seconds remaining: <span className={"font-bold text-red-500"}>{seconds}</span></p>
                                    <p>Level: <span className={"font-bold text-green-500"}>{currentLevel}</span></p>
                                    <p>Money: <span className={"text-yellow-500 font-bold"}>{money}</span></p>
                                    {messageType == "success" &&
                                        <p className={"text-green-400"}>{message}</p>
                                    }
                                    {messageType == "failure" &&
                                        <p className={"text-red-400"}>{message}</p>
                                    }
                                    {messageType == "idk" &&
                                        <p className={"text-amber-400"}>{message}</p>
                                    }
                                    {gameInProgress ?
                                        <div>
                                            <p>Your cards are:</p>
                                            <div className="flex flex-row gap-2">
                                                {userCards.map((card, i) =>
                                                    <div
                                                        key={i}
                                                        className="h-36 w-24 bg-blue-200 text-black text-2xl flex items-center justify-center text-center"
                                                    >
                                                        {card.rank}{card.suit}
                                                    </div>
                                                )}
                                            </div>
                                            <p>Dealer's first card is</p>
                                            <div className="flex flex-row gap-2">
                                                <div className={"h-36 w-24 bg-green-200 text-black text-2xl flex items-center justify-center text-center"}>{dealerCards[0].rank}{dealerCards[0].suit}</div>
                                            </div>
                                            <div className="flex flex-row gap-2 mt-2">
                                                <button className="bg-orange-500 p-2 rounded-xl hover:bg-orange-400" onClick={hit}>Hit</button>
                                                <button className="bg-blue-500 p-2 rounded-xl hover:bg-blue-400" onClick={stand}>Stand</button>
                                            </div>
                                        </div>
                                        :   <div>
                                            {gameEnded &&
                                                <>
                                                    <p>Your cards were:</p>
                                                    <div className="flex flex-row gap-2">
                                                        {userCards.map((card, i) =>
                                                            <div key={i} className={"h-36 w-24 bg-blue-200 text-black text-2xl flex items-center justify-center text-center"}>{card.rank}{card.suit}</div>
                                                        )}
                                                    </div>
                                                    {needToSeeDealerCards &&
                                                        <>
                                                            <p>Dealer's cards were:</p>
                                                            <div className="flex flex-row gap-2">
                                                                {dealerCards.map((card, i) =>
                                                                    <div key={i} className={"h-36 w-24 bg-green-200 text-black text-2xl flex items-center justify-center text-center"}>{card.rank}{card.suit}</div>
                                                                )}
                                                            </div>
                                                        </>
                                                    }
                                                </>
                                            }
                                            <br/>
                                            <input className="bg-blue-300 rounded-xl text-black p-2 mr-4" type="number" value={bet} onChange={e => setBet(parseInt(e.target.value))}></input>
                                            <button className="bg-blue-500 p-2 rounded-xl hover:bg-blue-400" onClick={startGame}>Bet</button>
                                        </div>
                                    }
                                </div>
                            }
                        </>
                    }
                </>
            }
        </div>

    )
}

export default App
