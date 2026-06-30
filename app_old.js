const user = localStorage.getItem("equilibrio_user");

if (!user) {
  window.location.href = "login.html";
}

// 🧠 Données de base (version locale pour l’instant)
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let usersScore = JSON.parse(localStorage.getItem("scores")) || {
  Rom: 0,
  Carol: 0
};

// 📌 Ajouter une tâche
function addTask(category, title, points = 10) {
  const task = {
    id: Date.now(),
    category,
    title,
    points,
    assignedTo: user,
    done: false
  };

  tasks.push(task);
  save();
  render();
}

// ✔️ Terminer une tâche
function completeTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task || task.done) return;

  task.done = true;
  usersScore[task.assignedTo] += task.points;

  save();
  render();
}

// 💾 Sauvegarde
function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("scores", JSON.stringify(usersScore));
}

// 📊 Calcul équilibre
function getBalance() {
  const total = usersScore.Rom + usersScore.Carol;
  if (total === 0) return 50;

  return Math.round((usersScore.Rom / total) * 100);
}

// 🖥️ Affichage
function render() {
  const score = getBalance();

  const scoreEl = document.getElementById("score");
  if (scoreEl) scoreEl.innerText = score;

  const list = document.getElementById("taskList");
  if (!list) return;

  list.innerHTML = "";

  tasks.forEach(t => {
    const div = document.createElement("div");
    div.className = "task";
    div.innerHTML = `
      <b>${t.title}</b> (${t.category}) - ${t.points} pts
      <br/>
      Assigné à: ${t.assignedTo}
      <br/>
      ${t.done ? "✔ Terminé" : `<button onclick="completeTask(${t.id})">Terminer</button>`}
      <hr/>
    `;
    list.appendChild(div);
  });
}

// 🚀 Initialisation
render();
