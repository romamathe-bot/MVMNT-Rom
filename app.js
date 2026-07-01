let currentUser = localStorage.getItem("equilibrioUser") || "";
let selectedPerson = "";
let tasks = JSON.parse(localStorage.getItem("equilibrioTasks")) || [];

window.onload = function () {
  if (currentUser === "") {
    showLogin();
  } else {
    openHome();
  }
};

function showLogin() {
  document.getElementById("screen-login").classList.add("active");
  document.getElementById("screen-home").classList.remove("active");
}

function setUser(name) {
  currentUser = name;
  localStorage.setItem("equilibrioUser", name);
  openHome();
}

function openHome() {
  document.getElementById("screen-login").classList.remove("active");
  document.getElementById("screen-home").classList.add("active");
  document.getElementById("helloName").innerHTML = currentUser;
  render();
}

function openNewTask(category = "Phoenix") {
  document.getElementById("taskModal").classList.remove("hidden");
  document.getElementById("taskCategory").value = category;
  document.getElementById("taskText").value = "";
  document.getElementById("taskPoints").value = "10";
  selectedPerson = currentUser || "Rom";
  updateButtons();
}

function closeNewTask() {
  document.getElementById("taskModal").classList.add("hidden");
}

function selectPerson(name) {
  selectedPerson = name;
  updateButtons();
}

function updateButtons() {
  document.getElementById("personRom").classList.remove("active");
  document.getElementById("personCarol").classList.remove("active");

  if (selectedPerson === "Rom") {
    document.getElementById("personRom").classList.add("active");
  }

  if (selectedPerson === "Carol") {
    document.getElementById("personCarol").classList.add("active");
  }
}

function saveTask() {
  const category = document.getElementById("taskCategory").value;
  const text = document.getElementById("taskText").value.trim();
  const points = Number(document.getElementById("taskPoints").value);

  if (text === "") {
    alert("Escribe una tarea.");
    return;
  }

  const task = {
    id: Date.now(),
    category,
    text,
    points,
    person: selectedPerson || currentUser || "Rom",
    date: new Date().toISOString(),
    done: false
  };

  tasks.unshift(task);
  persist();
  closeNewTask();
  render();
}

function completeTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, done: true };
    }
    return task;
  });

  persist();
  render();
}

function persist() {
  localStorage.setItem("equilibrioTasks", JSON.stringify(tasks));
}

function isToday(dateString) {
  const d = new Date(dateString);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

function isThisWeek(dateString) {
  const d = new Date(dateString);
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  return d >= weekAgo && d <= today;
}

function getStats(filteredTasks) {
  let rom = 0;
  let carol = 0;

  filteredTasks.forEach(task => {
    if (task.done) return;

    if (task.person === "Rom") rom += task.points || 10;
    if (task.person === "Carol") carol += task.points || 10;
  });

  return { rom, carol };
}

function calculateBalance() {
  const todayTasks = tasks.filter(t => isToday(t.date));
  const stats = getStats(todayTasks);
  const total = stats.rom + stats.carol;

  if (total === 0) {
    return {
      score: 100,
      romPercent: 50,
      carolPercent: 50,
      text: "Excelente equilibrio"
    };
  }

  const romPercent = Math.round((stats.rom / total) * 100);
  const carolPercent = 100 - romPercent;
  const diff = Math.abs(romPercent - carolPercent);
  const score = Math.max(0, 100 - diff);

  let text = "Excelente equilibrio";
  if (score < 90) text = "Muy buen equilibrio";
  if (score < 75) text = "Se puede mejorar";
  if (score < 60) text = "Necesita atención";

  return { score, romPercent, carolPercent, text };
}

function render() {
  const balance = calculateBalance();

  document.getElementById("balanceScore").innerHTML = balance.score;
  document.getElementById("balanceText").innerHTML = balance.text;

  document.getElementById("romBar").style.width = balance.romPercent + "%";
  document.getElementById("carolBar").style.width = balance.carolPercent + "%";

  document.getElementById("romPercent").innerHTML = balance.romPercent + "%";
  document.getElementById("carolPercent").innerHTML = balance.carolPercent + "%";

  renderTasks();
  renderWeek();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  const todayTasks = tasks.filter(t => isToday(t.date) && !t.done);

  if (todayTasks.length === 0) {
    list.innerHTML = `<p class="empty">Todavía no hay tareas hoy.</p>`;
    return;
  }

  list.innerHTML = "";

  todayTasks.forEach(task => {
    list.innerHTML += `
      <div class="task">
        <div class="task-category">${task.category} · ${task.points || 10} pts</div>
        <div class="task-title">${task.text}</div>
        <div class="task-person">Realizada por ${task.person}</div>
        <button onclick="completeTask(${task.id})">✓</button>
      </div>
    `;
  });
}

function renderWeek() {
  const weekTasks = tasks.filter(t => isThisWeek(t.date));
  const stats = getStats(weekTasks);
  const total = stats.rom + stats.carol;

  document.getElementById("weekRom").innerHTML = stats.rom;
  document.getElementById("weekCarol").innerHTML = stats.carol;
  document.getElementById("weekSummary").innerHTML = total + " pts";

  if (total === 0) {
    document.getElementById("weekText").innerHTML = "Sin datos todavía.";
    return;
  }

  const romPercent = Math.round((stats.rom / total) * 100);
  const carolPercent = 100 - romPercent;

  document.getElementById("weekText").innerHTML =
    `Rom ${romPercent}% · Carol ${carolPercent}% esta semana.`;
}

function resetApp() {
  if (confirm("¿Quieres cambiar de usuario?")) {
    localStorage.removeItem("equilibrioUser");
    location.reload();
  }
}