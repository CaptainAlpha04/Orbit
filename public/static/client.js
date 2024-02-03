document.addEventListener("DOMContentLoaded", pageReload);

function pageReload() {
  fetchQuote();
  updateBackground();
  showDate();
  loadSavedLinks();
}

function updateBackground() {
  let seed = Math.ceil(Math.random() * 1000);
  const imageUrl = `https://picsum.photos/id/${seed}/1440/1080.jpg`;
  document.body.style.backgroundImage = `url('${imageUrl}')`;
}

function updateDigitalClock() {
  const now = new Date();
  var hours = (((now.getHours() + 11) % 12) + 1).toString().padStart(2, "0");
  var minutes = now.getMinutes().toString().padStart(2, "0");
  var meridian = now.getHours() >= 12 ? "PM" : "AM";

  document.getElementById("time").textContent = `${hours}:${minutes}`;
  document.getElementById("period").textContent = `${meridian}`;
  document.getElementById("zenHour").textContent = `${hours}`;
  document.getElementById("zenMin").textContent = `${minutes}`;
  document.getElementById("zenPeriod").textContent = `${meridian}`;
}

function showDate() {
  var format = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  var currentDate = new Date().toLocaleDateString("en-US", format);
  document.getElementById("date").textContent = currentDate;
  document.getElementById("zenDate").textContent = currentDate;
}

setInterval(updateDigitalClock, 1000);
updateDigitalClock();

async function fetchQuote() {
  try {
    const response = await fetch("/quote");
    const data = await response.json();
    document.getElementById("quote").innerText = await data.quote;
  } catch (error) {
    console.error("Error fetching quote:", error.message);
  }
}

function gptMode() {
  document.getElementById("gptFocus").style.visibility = "Visible";
  document.getElementById("gptFocus").style.opacity = 100;
}

function closeGPTMode() {
  document.getElementById("gptFocus").style.visibility = "hidden";
  document.getElementById("gptFocus").style.opacity = 0;
}

function submitQuery(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    const search = document.getElementById("searchBox");
    window.open(
      `https://www.google.com/search?query=${search.value}`,
      "_blank"
    );
    search.value = "";
  }
}

async function fetchChatRes() {
  const input = document.getElementById("chatBox");
  const userBox = document.getElementById("user");
  const botBox = document.getElementById("bot");
  const chatArea = document.querySelector(".chatArea");
  const loadingIndicator = document.querySelector(".spinner");
  const submitBtn = document.getElementById("chatSubmit");
  const instructions = document.getElementById("gptInstructs");

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
    console.error("Error fetching chat response:", error.message);
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
  if (event.key === "Enter") {
    event.preventDefault();
    fetchChatRes();
  }
}

function gptSite() {
  window.open("https://chat.openai.com", "_blank");
}

const container = document.getElementById("linkContainer");
let draggedItem = null;

container.addEventListener("dragstart", (e) => {
  draggedItem = e.target;
  setTimeout(() => {
    e.target.style.display = "none";
    e.target.classList.add("dragging");
  }, 0);
});

container.addEventListener("dragend", (e) => {
  e.target.style.display = "flex";
  e.target.classList.remove("dragging");
  draggedItem = null;
  saveLinksToLocalStorage();
});

container.addEventListener("dragover", (e) => {
  e.preventDefault();
  const afterElement = getDragAfterElement(container, e.clientY);
  const draggableItem = document.querySelector(".dragging");
  if (afterElement == null) {
    container.appendChild(draggableItem);
  } else {
    container.insertBefore(draggableItem, afterElement);
  }
});

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".linkBox:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function addSite() {
  document.getElementById("addLinkDialog").style.visibility = "visible";
  document.getElementById("addLinkDialog").style.opacity = 100;
}

function cancelDialog() {
  document.getElementById("addLinkDialog").style.visibility = "hidden";
  document.getElementById("addLinkDialog").style.opacity = 0;
}

// Load existing links from localStorage on page load

function loadSavedLinks() {
  const linkContainer = document.getElementById("linkContainer");

  // Check if there are saved links in localStorage
  if (localStorage.getItem("savedLinks")) {
    const savedLinks = JSON.parse(localStorage.getItem("savedLinks"));

    // Iterate through saved links and create elements
    savedLinks.forEach(function (savedLink) {
      const link = createLinkElement(savedLink.name, savedLink.address);
      linkContainer.appendChild(link);
    });
  }
}

function linkAdd() {
  const name = document.getElementById("nameText").value;
  const address = document.getElementById("addressText").value;

  if (name != "" || address != "") {
    const linkContainer = document.getElementById("linkContainer");
    const addBox = document.getElementById("addBox");
    const currentChildCount = linkContainer.children.length;

    // If the limit is reached
    if (currentChildCount >= 8) {
      linkContainer.removeChild(addBox);
    }
    // Create a new link element
    const link = createLinkElement(name, address);

    // Append the new link to the container
    linkContainer.appendChild(link);

    // Save the updated links to localStorage
    saveLinksToLocalStorage();

    // Clear input values
    document.getElementById("nameText").value = "";
    document.getElementById("addressText").value = "";

    // Hide the dialog
    document.getElementById("addLinkDialog").style.visibility = "hidden";
    document.getElementById("addLinkDialog").style.opacity = 0;
  }
}

function saveLinksToLocalStorage() {
  const linkContainer = document.getElementById("linkContainer");
  const links = linkContainer.getElementsByClassName("linkBox");

  // Create an array to store link data
  const savedLinks = [];

  // Iterate through links and store data
  for (let i = 0; i < links.length; i++) {
    const title = links[i].querySelector(".linkText");
    const img = links[i].querySelector(".linkImg");

    const linkData = {
      name: title.textContent,
      address: img.src
        .replace("https://www.google.com/s2/favicons?domain=", "")
        .split("&sz=50")[0],
    };

    savedLinks.push(linkData);
  }

  // Save the array to localStorage
  localStorage.setItem("savedLinks", JSON.stringify(savedLinks));
}

// Add an event listener for the delete icon
container.addEventListener("click", (e) => {
  if (e.target.classList.contains("deleteLink")) {
    const linkElement = e.target.closest(".linkBox");
    if (linkElement) {
      linkElement.remove();
      saveLinksToLocalStorage();
    }
  }
});

function createLinkElement(name, address) {
  const linkBtn = document.getElementById("linkBox");
  const link = linkBtn.cloneNode(true);
  const title = link.querySelector(".linkText");
  const img = link.querySelector(".linkImg");

  title.textContent = name;
  img.src = `https://www.google.com/s2/favicons?domain=${address}&sz=50`;

  // Add an event listener to open the website on click
  link.querySelector(".linkImg").addEventListener("click", function () {
    window.open(`https://` + address, "_blank");
  });

  return link;
}

function zenModeActive() {
  document.getElementById("zenActive").style.visibility = "visible";
  document.getElementById("zenActive").style.opacity = 100;
}

function zenClose() {
  document.getElementById("zenActive").style.visibility = "hidden";
  document.getElementById("zenActive").style.opacity = 0;
}
const taskInput = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");

// Add task function
function addTask() {
  const task = taskInput.value;
  if (task.trim() === "") return;

  const li = document.createElement("li");
  li.innerHTML = ` 
        <span class="task">${task}</span> 
        <button class="edit-btn">Edit</button> 
        <button class="delete-btn">Delete</button> 
      `;

  taskList.appendChild(li);
  taskInput.value = "";
}

// Edit task function
function editTask(e) {
  const taskSpan = e.target.previousElementSibling;
  const newTask = prompt("Edit task:", taskSpan.innerText);

  if (newTask && newTask.trim() !== "") {
    taskSpan.innerText = newTask;
  }
}

// Delete task function
function deleteTask(e) {
  if (e.target.classList.contains("delete-btn")) {
    e.target.parentElement.remove();
  }
}

// Event listeners
addBtn.addEventListener("click", addTask);

taskList.addEventListener("click", function (e) {
  if (e.target.classList.contains("edit-btn")) {
    editTask(e);
  } else if (e.target.classList.contains("delete-btn")) {
    deleteTask(e);
  }
});
