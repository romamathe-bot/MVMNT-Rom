/* ===========================================
   EQUILIBRIO V1
   APP.JS
   PARTIE 1
=========================================== */

let currentUser = localStorage.getItem("equilibrioUser") || "";

let selectedPerson = "";

let tasks = JSON.parse(
    localStorage.getItem("equilibrioTasks")
) || [];

/* ---------- INITIALISATION ---------- */

window.onload = function(){

    if(currentUser===""){

        document
            .getElementById("screen-login")
            .classList.add("active");

        document
            .getElementById("screen-home")
            .classList.remove("active");

    }else{

        openHome();

    }

}

/* ---------- LOGIN ---------- */

function setUser(name){

    currentUser=name;

    localStorage.setItem(
        "equilibrioUser",
        name
    );

    openHome();

}

function openHome(){

    document
        .getElementById("screen-login")
        .classList.remove("active");

    document
        .getElementById("screen-home")
        .classList.add("active");

    document
        .getElementById("helloName")
        .innerHTML=currentUser;

    render();

}

/* ---------- MODAL ---------- */

function openNewTask(category="Phoenix"){

    document
        .getElementById("taskModal")
        .classList.remove("hidden");

    document
        .getElementById("taskCategory")
        .value=category;

    document
        .getElementById("taskText")
        .value="";

    selectedPerson=currentUser;

    updateButtons();

}

function closeNewTask(){

    document
        .getElementById("taskModal")
        .classList.add("hidden");

}

/* ---------- PERSONNE ---------- */

function selectPerson(name){

    selectedPerson=name;

    updateButtons();

}

function updateButtons(){

    document
        .getElementById("personRom")
        .classList.remove("active");

    document
        .getElementById("personCarol")
        .classList.remove("active");

    if(selectedPerson==="Rom"){

        document
        .getElementById("personRom")
        .classList.add("active");

    }

    if(selectedPerson==="Carol"){

        document
        .getElementById("personCarol")
        .classList.add("active");

    }

}
/* ---------- TÂCHES ---------- */

function saveTask(){

    const category =
        document.getElementById("taskCategory").value;

    const text =
        document.getElementById("taskText").value.trim();

    if(text===""){
        alert("Escribe una tarea.");
        return;
    }

    const task = {
        id: Date.now(),
        category: category,
        text: text,
        person: selectedPerson || currentUser,
        date: new Date().toISOString(),
        done: false
    };

    tasks.unshift(task);

    localStorage.setItem(
        "equilibrioTasks",
        JSON.stringify(tasks)
    );

    closeNewTask();
    render();

}

function completeTask(id){

    tasks = tasks.map(task => {
        if(task.id === id){
            return {...task, done:true};
        }
        return task;
    });

    localStorage.setItem(
        "equilibrioTasks",
        JSON.stringify(tasks)
    );

    render();

}

/* ---------- CALCULS ---------- */

function isToday(dateString){

    const d = new Date(dateString);
    const today = new Date();

    return d.toDateString() === today.toDateString();

}

function isThisWeek(dateString){

    const d = new Date(dateString);
    const today = new Date();

    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);

    return d >= weekAgo && d <= today;

}

function getStats(filteredTasks){

    let rom = 0;
    let carol = 0;

    filteredTasks.forEach(task => {
        if(task.done) return;

        if(task.person === "Rom") rom++;
        if(task.person === "Carol") carol++;
    });

    return {rom, carol};

}

function calculateBalance(){

    const todayTasks = tasks.filter(t => isToday(t.date));
    const stats = getStats(todayTasks);

    const total = stats.rom + stats.carol;

    if(total === 0){
        return {
            score:100,
            romPercent:50,
            carolPercent:50,
            text:"Excelente equilibrio"
        };
    }

    const romPercent = Math.round((stats.rom / total) * 100);
    const carolPercent = 100 - romPercent;

    const diff = Math.abs(romPercent - carolPercent);

    let score = 100 - diff;

    let text = "Excelente equilibrio";

    if(score < 90) text = "Muy buen equilibrio";
    if(score < 75) text = "Se puede mejorar";
    if(score < 60) text = "Necesita atención";

    return {
        score,
        romPercent,
        carolPercent,
        text
    };

}

/* ---------- AFFICHAGE ---------- */

function render(){

    const balance = calculateBalance();

    document.getElementById("balanceScore").innerHTML =
        balance.score;

    document.getElementById("balanceText").innerHTML =
        balance.text;

    document.getElementById("romBar").style.width =
        balance.romPercent + "%";

    document.getElementById("carolBar").style.width =
        balance.carolPercent + "%";

    document.getElementById("romPercent").innerHTML =
        balance.romPercent + "%";

    document.getElementById("carolPercent").innerHTML =
        balance.carolPercent + "%";

    renderTasks();
    renderWeek();

}

function renderTasks(){

    const list = document.getElementById("taskList");

    const todayTasks = tasks.filter(t => isToday(t.date));

    if(todayTasks.length === 0){

        list.innerHTML =
            `<p class="empty">Todavía no hay tareas hoy.</p>`;

        return;

    }

    list.innerHTML = "";

    todayTasks.forEach(task => {

        if(task.done) return;

        list.innerHTML += `
            <div class="task">
                <div class="task-category">${task.category}</div>
                <div class="task-title">${task.text}</div>
                <div class="task-person">Realizada por ${task.person}</div>
                <button onclick="completeTask(${task.id})">✓</button>
            </div>
        `;

    });

}

function renderWeek(){

    const weekTasks = tasks.filter(t => isThisWeek(t.date));
    const stats = getStats(weekTasks);

    document.getElementById("weekRom").innerHTML =
        stats.rom;

    document.getElementById("weekCarol").innerHTML =
        stats.carol;

    document.getElementById("weekSummary").innerHTML =
        weekTasks.length + " tareas";

}

/* ---------- AJUSTES ---------- */

function resetApp(){

    if(confirm("¿Quieres cambiar de usuario?")){

        localStorage.removeItem("equilibrioUser");
        location.reload();

    }

}