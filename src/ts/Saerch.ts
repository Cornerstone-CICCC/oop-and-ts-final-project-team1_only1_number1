import { taskService, TaskStatus } from "./TaskManager.ts";
import { dragAndDrop } from "./DragDrop";


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
        // const noResultsMessage = document.querySelector("#no-results") as HTMLElement;

        if (!todoColumn || !progressColumn || !doneColumn) return;

        todoColumn.innerHTML = taskService.generateTaskHtml(TaskStatus.TODO, searchQuery);
        progressColumn.innerHTML = taskService.generateTaskHtml(TaskStatus.PROGRESS, searchQuery);
        doneColumn.innerHTML = taskService.generateTaskHtml(TaskStatus.DONE, searchQuery);

        dragAndDrop();
        taskService.buttonsEventListener();

        // const hasResults = !!(todoColumn.innerHTML || progressColumn.innerHTML || doneColumn.innerHTML);
        // noResultsMessage.style.display = hasResults ? "none" : "block";
    }
}

export const searchTaskManage = new SearchTaskManage();
