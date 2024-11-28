const displayWordsElement = document.getElementById("displayWords");
const inputField = document.querySelector(".input");
const timerDisplay = document.getElementById("timer");
const wordCount = 40;  
let timer = 60;
let timerInterval;
let currentWordIndex = 0;
let words = [];
let correctWordsCount = 0;
let totalCharactersTyped = 0;



async function fetchWords() {
    try {
        const response = await fetch(`https://random-word-api.herokuapp.com/word?number=${wordCount}`);
        if (!response.ok) throw new Error("Failed to fetch words.");

       let allWords = await response.json();

       words= allWords.filter(word=> word.length >=3);
       
       while(words.length < wordCount){
        const extraResponse= await fetch(`https://random-word-api.herokuapp.com/word?number=${wordCount}`);
        const extraWords = await extraResponse.json();
        words.push(...extraWords.filter(word=> word.length >=3 ));

       }
    
        displayWords();
    } catch (error) {
        console.error("Error fetching words:", error);
        displayWordsElement.innerHTML = "<span>Error fetching words.</span>";
    }
}

function displayWords() {
    displayWordsElement.innerHTML = words
        .map((word, index) => {
            return `<span class="word" data-index="${index}">${word}</span>`;
        })
        .join(" ");

    highlightCurrentWord();
}

function highlightCurrentWord() {
    const wordSpans = document.querySelectorAll(".word");
    wordSpans.forEach(span => {
        span.style.color = "black"; 
    });

    if (wordSpans[currentWordIndex]) {
        wordSpans[currentWordIndex].style.color = "blue"; 

    }


}

function startTimer() {
    timerInterval = setInterval(() => {
        if (timer > 0) {
            timer--;
            timerDisplay.textContent = ` ${timer}s `;

            if (timer <= 5) {
                timerDisplay.style.color = "red"; 
            } else if (timer <= 15) {
                timerDisplay.style.color = "orange";
            } else {
                timerDisplay.style.color = "black"; 
            }
        } else {
            clearInterval(timerInterval);
            timerDisplay.textContent = " Time's up! ";
            timerDisplay.style.color = "red";
            inputField.disabled = true;
            inputField.style.borderColor = "gray";
           
          
        }
    }, 1000);
}


inputField.addEventListener("input", () => {
    if (!timerInterval) { 
        startTimer();
    }
});


inputField.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();

        const currentWord = words[currentWordIndex];
        const typedText = inputField.value.trim(); 
        const currentWordElement = displayWordsElement.children[currentWordIndex];

        if(typedText == ""){
            return;
        }

        if (typedText === currentWord) {
            currentWordElement.style.color = "green";
            correctWordsCount++;
            totalCharactersTyped += typedText.length +1;
        } else {
            currentWordElement.style.color = "red"; 
        }
        currentWordIndex++; 
        inputField.value = ""; 
        
        highlightCurrentWord();

        const wpmDisplay= document.getElementById("wpmCount");
        wpmDisplay.textContent= calculateWPM();

        if (currentWordIndex === words.length) {
            clearInterval(timerInterval);  

        }
    }
});


function highlightCurrentWord() {

    Array.from(displayWordsElement.children).forEach((wordElement) => {
        wordElement.classList.remove("highlight");
    });


    if (currentWordIndex < words.length) {
        const nextWordElement = displayWordsElement.children[currentWordIndex];
        nextWordElement.classList.add("highlight");
    }
}

function calculateWPM(){
    const totalCharactersTyped= correctWordsCount *5;
    const elapsedTimeinMinutes = (60 - timer) /60;
    return Math.round(correctWordsCount/elapsedTimeinMinutes)||0;
}


document.getElementById("reset-btn").addEventListener("click", () => {
    timer = 60;
    timerDisplay.textContent = `${timer}s`;
    timerDisplay.style.color='black'
    currentWordIndex = 0;
    correctWordsCount= 0;
    totalCharactersTyped = 0;

    inputField.value = "";
    inputField.disabled= false;
    const wpmDisplay= document.getElementById("wpmCount");
    wpmDisplay.textContent = "0";
    fetchWords();

    clearInterval(timerInterval); 
    timerInterval = null;
});

fetchWords();
