import { TaskManage, taskService } from "./TaskManager.ts";
import type { Task } from "./TaskManager.ts";

class SearchTaskManage {
    private searchInput: HTMLInputElement | null;

    constructor() {
        this.searchInput = document.querySelector("#search");
        if (this.searchInput) {
            this.searchInput.addEventListener("input", () => {
                this.renderTask(this.searchInput!.value.trim());
            });
        }
    }

    private renderTask(searchQuery = "") {
        const todoColumn = document.querySelector("#todo-task-zone") as HTMLElement;
        const progressColumn = document.querySelector("#progress-task-zone") as HTMLElement;
        const doneColumn = document.querySelector("#done-task-zone") as HTMLElement;
        const noResultsMessage = document.querySelector("#no-results") as HTMLElement;

        if (!todoColumn || !progressColumn || !doneColumn) return;

        todoColumn.innerHTML = "";
        progressColumn.innerHTML = "";
        doneColumn.innerHTML = "";

        const tasksList = taskService.getAllTasks();
        let hasResults = false;

        tasksList.forEach((task) => {
            if (searchQuery && !task.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return;
            }

            hasResults = true;

            const newTask = document.createElement("div") as HTMLDivElement;
            newTask.classList.add("task");
            newTask.id = `${task.id}`;
            newTask.setAttribute("draggable", "true");
            newTask.setAttribute("data-task", "");
            newTask.innerHTML = `
                <h4>${task.name}</h4>
                <p>${task.description}</p>
            `;

            if (task.status === "To Do") {
                todoColumn.appendChild(newTask);
            } else if (task.status === "Progress") {
                progressColumn.appendChild(newTask);
            } else if (task.status === "Done") {
                doneColumn.appendChild(newTask);
            }
        });

        noResultsMessage.style.display = hasResults ? "none" : "block";
    }
}

export const searchTaskManage = new SearchTaskManage();
