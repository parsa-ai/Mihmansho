const wheel = document.querySelector("#main-wheel-circle");
const button = document.querySelector("#spin-button");

const ITEM_COUNT = 8;
const STEP = 360 / ITEM_COUNT;

let currentRotation = 0;
let spinning = false;

let fastSpinInterval = null;

async function getWinnerNumber() {
    // backend : change example url with you're url and remove uncomment part of this function
    // const response = await fetch("https://api.example.com/spin", {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json"
    //     }
    // });

    // if (!response.ok) {
    //     throw new Error("Spin failed");
    // }

    // const data = await response.json();
    // return data.winner;
    return new Promise(resolve => {
        const delay = 1000 + Math.random() * 3000;
        setTimeout(() => resolve(Math.floor(Math.random() * 8) + 1), delay);
    });
}

button.addEventListener("click", startSpin);

async function startSpin() {
    if (spinning) return;

    spinning = true;
    button.disabled = true;
    button.classList.add("is-spinning");

    fastSpinInterval = setInterval(() => {
        currentRotation += 90;
        wheel.style.transition = "transform 0.1s linear";
        wheel.style.transform = `translateY(290px) rotate(${currentRotation}deg)`;
    }, 100);

    try {
        const winner = await getWinnerNumber();
        console.log(winner);
        
        stopOnNumber(winner);
    } catch (error) {
        clearInterval(fastSpinInterval);
        spinning = false;
        button.disabled = false;
        button.classList.remove("is-spinning");
        alert("خطایی رخ داد، لطفا دوباره تلاش کنید.");
    }
}

function stopOnNumber(number) {
    clearInterval(fastSpinInterval);

    const targetSectorAngle = ((ITEM_COUNT - number + 1) % ITEM_COUNT) * STEP;

    const currentModulo = currentRotation % 360;
    let delta = targetSectorAngle - currentModulo;
    if (delta <= 0) delta += 360;

    currentRotation = currentRotation + delta + (360 * 5);

    wheel.style.transition = "transform 4.5s cubic-bezier(0.12, 0.88, 0.08, 1)";
    wheel.style.transform = `translateY(290px) rotate(${currentRotation}deg)`;

    setTimeout(() => {
        spinning = false;
        button.disabled = false;
        button.classList.remove("is-spinning");
    }, 4500);
}