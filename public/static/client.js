document.addEventListener("DOMContentLoaded", updateBackground)
document.addEventListener("DOMContentLoaded", fetchQuote)
function updateBackground() {
    
    let seed = Math.ceil(Math.random() * 1000); 
    const imageUrl = `https://picsum.photos/id/${seed}/1440/720.jpg`;
    document.body.style.backgroundImage = `url('${imageUrl}')`;
} 

function updateDigitalClock() {

    const now = new Date();
    const hours = ((now.getHours()+11) % 12 + 1).toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const meridian = now.getHours >= 12? 'AM' : 'PM';
    
    document.getElementById('time').textContent = `${hours}:${minutes}`;
    document.getElementById('period').textContent = `${meridian}`;
}

async function fetchQuote() {
    try {
        const response = await fetch('/quote');
        const data = await response.json();
        document.getElementById('quote').innerText = await data.quote;
        
    } catch (error) {
        console.error('Error fetching quote:', error.message);
    }
}

setInterval(updateDigitalClock, 1000);
updateDigitalClock();