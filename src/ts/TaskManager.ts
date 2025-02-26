import { dragAndDrop } from "./DragDrop";
import { Modal } from "./Modal";

export type Task = {
  id: number;
  name: string;
  status: "To Do" | "Progress" | "Done";
  description: string;
};

export class TaskManage {
  private tasks: Task[] = [];
  private taskIdCounter: number = 1;

  // get all tasks (no localStorage)
  getAllTasks(): Task[] {
    return this.tasks;
  }

  saveTask(task: Task) {
    this.tasks.push(task)
    this.renderTasks();
  }

  addTask(status: Task["status"]): void {
    const modal = new Modal();
    modal.setStatus(status).add();
  }

  openModal(modalType: string, taskId?: number) {
    const modal = new Modal();

    if(taskId) {
      modal.setTask(taskId);
    }

    if(modalType === "edit") {
      modal.edit();
    } else if(modalType === "delete") {
      modal.delete();
    } else if(modalType === "view") {
      modal.view();
    } else if(modalType === "add") {
      modal.add();
    }
  }

  update(updateTask: Task): void {
    const index = this.tasks.findIndex((task) => task.id === updateTask.id);
    if (index === -1) {
      console.warn(`Task with ID ${updateTask.id} not found.`);
      return;
    }

    this.tasks[index] = { ...this.tasks[index], ...updateTask };
    this.renderTasks();
  }

  deleteTask(taskId: number): void {
    this.tasks = this.tasks.filter((task) => task.id !== taskId);
    this.openModal("delete")
    // this.renderTasks();
  }

  getTasksByStatus(status: Task["status"]): Task[] {
    return this.tasks.filter((task) => task.status === status);
  }

  renderTasks(): void {
    document.getElementById("todo-task-zone")!.innerHTML = this.generateTaskHtml("To Do");
    document.getElementById("progress-task-zone")!.innerHTML = this.generateTaskHtml("Progress");
    document.getElementById("done-task-zone")!.innerHTML = this.generateTaskHtml("Done");

    this.setupTaskIntercations();

    //for drag and drop
    dragAndDrop();
  }

  public generateTaskHtml(status: Task["status"], searchQuery: string = ""): string {
    const filteredTasks = this.getTasksByStatus(status).filter(task =>
        searchQuery === "" || task.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const tasks = filteredTasks
      .map(
        (task) =>
          `<li class="task" data-id=${task.id} draggable="true" data-task>
              ${task.name}<br>${task.description}<br>
              <button class="delete-task-btn" data-id="${task.id}">🗑</button>
          </li>`
      )
      .join("");

    return tasks;
}
  private setupTaskIntercations(): void {
    document.querySelectorAll(".delete-task-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const taskId = parseInt((event.target as HTMLElement).getAttribute("data-id") || "-1", 10);
        if (taskId !== -1) {
          this.deleteTask(taskId);
        }
      });
    });

    document.querySelectorAll(".task").forEach((taskElement) => {
      taskElement.addEventListener("click", () => {
        const taskId = parseInt(taskElement.getAttribute("data-id")!, 10);
        this.update(taskId);
      });
    });
  }
}

// create instance
export const taskService = new TaskManage();

// event listener
window.addEventListener("load", () => {
  document.getElementById("add-todo-button")?.addEventListener("click", () => taskService.addTask("To Do"));
  document
    .getElementById("add-progress-button")
    ?.addEventListener("click", () => taskService.addTask("Progress"));
  document.getElementById("add-done-button")?.addEventListener("click", () => taskService.addTask("Done"));

  // first render
  taskService.renderTasks();
});
