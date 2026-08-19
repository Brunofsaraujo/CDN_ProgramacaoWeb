const taskInput = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");

function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Digite uma tarefa antes de adicionar.");
        return;
    }

    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = taskText;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Excluir";
    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        li.remove();
    });

    li.addEventListener("click", function () {
        li.classList.toggle("completed");
    });

    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);

    taskInput.value = "";
    taskInput.focus();
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});
