document.addEventListener("DOMContentLoaded", pageReload)

function pageReload() {
    fetchQuote();
    updateBackground();
}

function updateBackground() {
    
    let seed = Math.ceil(Math.random() * 1000); 
    const imageUrl = `https://picsum.photos/id/${seed}/1440/1080.jpg`;
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

setInterval(updateDigitalClock, 1000);
updateDigitalClock();

async function fetchQuote() {
    try {
        const response = await fetch('/quote');
        const data = await response.json();
        document.getElementById('quote').innerText = await data.quote;
        
    } catch (error) {
        console.error('Error fetching quote:', error.message);
    }
}

function gptMode(btnActive) {

    const button = document.getElementById('gptSearch');
    if (btnActive) {
        button.style.backgroundColor = '#000';
        btnActive = false;
    } 
    else {
        button.style.backgroundColor = '#19c37d';
        btnActive = true;
        document.getElementById('gptFocus').style.visibility = 'Visible';
        document.getElementById('gptFocus').style.opacity = 100;
    }
}

function closeGPTMode()
{
    document.getElementById('gptFocus').style.visibility = 'hidden';
    document.getElementById('gptFocus').style.opacity = 0;
    btnActive = true;
    gptMode(btnActive)
}

function submitQuery(event) {

    if (event.key === 'Enter') {
        event.preventDefault();
        const search = document.getElementById('searchBox');
        window.open(`https://www.google.com/search?query=${search.value}`, '_blank');
        search.value = "";
    }
}

async function fetchChatRes() {

    const input = document.getElementById('chatBox');
    const userBox = document.getElementById('user');
    const botBox = document.getElementById('bot');
    const chatArea = document.querySelector('.chatArea');
    const loadingIndicator = document.querySelector('.spinner');
    const submitBtn = document.getElementById('chatSubmit');
    const instructions = document.getElementById('gptInstructs');

    if (instructions) {
        chatArea.removeChild(instructions);
    }
    
    let protoUser = userBox.cloneNode(true);
    protoUser.textContent = input.value; 
    input.value = "";
    chatArea.appendChild(protoUser);
    chatArea.scrollTop = chatArea.scrollHeight;
    input.disabled = true;
    submitBtn.disabled = true;

    let loading = loadingIndicator.cloneNode(true);
    chatArea.appendChild(loading);

    try {
      const response = await fetch(`/ChatRes?prompt=${protoUser.textContent}`);
      const data = await response.json();
    
      let protoBot = botBox.cloneNode(true);
      protoBot.textContent = await data.chat; 
      chatArea.removeChild(loading);
      chatArea.appendChild(protoBot);
      

    } catch (error) {   
      console.error('Error fetching chat response:', error.message);
      chatArea.removeChild(loading);
      let protoBot = botBox.cloneNode(true);
      protoBot.style.backgroundColor = "#ff4242";
      protoBot.textContent = "Seems like there is some problem connecting...."; 
      chatArea.appendChild(protoBot); 
    }

    chatArea.scrollTop = chatArea.scrollHeight;
    input.disabled = false;
    submitBtn.disabled = false;
  }

function submitChat(event) {

    if (event.key === 'Enter') {
        event.preventDefault();
        fetchChatRes();
    }
}

function gptSite() {
    window.open('https://chat.openai.com', '_blank');
}