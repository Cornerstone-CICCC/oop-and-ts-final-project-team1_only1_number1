import { dragAndDrop } from "./DragDrop";
import { Modal } from "./Modal";

export enum TaskStatus {
  TODO = "To Do",
  PROGRESS = "Progress",
  DONE = "Done"
}

export type Task = {
  id: number;
  name: string;
  status: TaskStatus;
  description: string;
  now: string;
}

export class TaskManage {
  private tasks: Task[] = [];
  private tasksResult: Task[] = [];
  private readonly STORAGE_KEY = "kanban"; // key for using localstorage
  isSearching: boolean = false;

  constructor () {
    this.loadTasksFromStorage();
  }

  // get tasks from localstorage
  private loadTasksFromStorage(): void {
    const savedTasks = localStorage.getItem(this.STORAGE_KEY);
    if(savedTasks) {
      this.tasks = JSON.parse(savedTasks);
    }
  }

  // save task to localstorage based on this.tasks
  private saveTasksToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
  }

  // get tasks from this.tasks
  getAllTasks(): Task[] {
    return this.tasks;
  }

  getOneTasks(taskId: number): Task | undefined {
    const task = this.tasks.find(task => task.id === taskId)
    return task;
  }

  // save task to this.tasks and localstorage as well
  saveTask(task: Task) {
    this.tasks.push(task);
    this.saveTasksToStorage();
    this.renderTasks();
  }

  // open modal each type
  openModal(modalType: string, status: Task["status"], taskId?: number) {
    const modal = new Modal();

    if(taskId) {
      modal.setTask(taskId);
    }

    if(modalType === "view") {
      modal.setStatus(status).view();
    } else if(modalType === "edit") {
      modal.setStatus(status).edit();
    } else if(modalType === "delete") {
      modal.setStatus(status).delete();
    } else if(modalType === "add") {
      modal.setStatus(status).add();
    }
  }

  getTasksByStatus(status: Task["status"]): Task[] {
    return this.tasks.filter((task) => task.status === status);
  }

  deleteTask(id: number): void {
    this.tasks = this.tasks.filter(task => task.id !== id);
    this.saveTasksToStorage();
    this.renderTasks();
  }

  updateTaskData(update: Task) {
    const item = this.tasks.findIndex(task => task.id === update.id);

    this.tasks[item] = { ...this.tasks[item], ...update};
    this.saveTasksToStorage();
  }

  updateTask(update: Task): void {
    const item = this.tasks.findIndex(task => task.id === update.id);

    this.tasks[item] = { ...this.tasks[item], ...update};
    this.saveTasksToStorage();
    // this.updateTaskData(update)
    this.renderTasks();
  }

  searchKeyword(keyword: string) {
    this.tasksResult = this.tasks.filter(task => task.name.toLowerCase().includes(keyword.toLowerCase()))

    const taskList = document.querySelectorAll(".task");
    taskList.forEach(taskLi => {
      const taskId = parseInt(taskLi.getAttribute("data-id") || "-1", 10);
      this.tasksResult.map(task => {
        if(task.id === taskId) {
          taskLi.classList.remove("hide")
        } else {
          taskLi.classList.add("hide")
        }
      })
    })

  }

  renderTasks() {
    document.getElementById("todo-task-zone")!.innerHTML = this.generateTaskHtml(TaskStatus.TODO);
    document.getElementById("progress-task-zone")!.innerHTML = this.generateTaskHtml(TaskStatus.PROGRESS);
    document.getElementById("done-task-zone")!.innerHTML = this.generateTaskHtml(TaskStatus.DONE);

    this.buttonsEventListener();

    // for drag and drop
    dragAndDrop();
  }

  // Coloring of tasks in board
  colorTask(status: Task["status"]): string {
    let colorClass: string = ""
    if (status === TaskStatus.TODO) {
      colorClass = "todo-color"
    } else if (status === TaskStatus.PROGRESS) {
      colorClass = "progress-color"
    } else if (status === TaskStatus.DONE) {
      colorClass = "done-color"
    }
    return colorClass
  }

  public generateTaskHtml(status: Task["status"], searchQuery: string = ""): string {

    const filteredTasks = this.getTasksByStatus(status).filter(task => searchQuery === "" || task.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const tasks = filteredTasks.map(
      (task) => `<li class="task" data-id=${task.id} draggable="true" data-task>
        <div class="task-title">
          <strong>${task.name}</strong>
        </div>
        <div class="task-cont">
          <div class="task-desc">
            <p>${task.description}</p>
          </div>
          <div class="task-buttons">
            <button class="delete-task-btn" data-id="${task.id}"><img src="src/assets/delete.svg" alt="delete icon"></button>
            <button class="edit-task-btn" data-id="${task.id}"><img src="src/assets/edit.svg" alt="edit icon"></button>
          </div>
        </div>  
        </li>`
    ).join("");
    return tasks;
  }

  public buttonsEventListener() {
    const deleteButtons = document.querySelectorAll(".delete-task-btn");
    if(deleteButtons) {
      deleteButtons.forEach(button => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          const taskId = parseInt((event.currentTarget as HTMLElement).dataset.id || "-1", 10);
          const target: Task = this.tasks.filter(task => task.id === taskId)[0];
          const targetStatus: TaskStatus = target.status;

          if (taskId !== -1) {
            this.openModal("delete", targetStatus, taskId);
          }
        })
      })
    }

    const editButtons = document.querySelectorAll(".edit-task-btn");
    if(editButtons) {
      editButtons.forEach(button => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          const taskId = parseInt((event.currentTarget as HTMLElement).dataset.id || "-1", 10);
          const target: Task = this.tasks.filter(task => task.id === taskId)[0];
          const targetStatus: TaskStatus = target.status;

          if (taskId !== -1) {
            this.openModal("edit", targetStatus, taskId);
          }
        })
      })
    }

    const viewButtons = document.querySelectorAll(".task");
    if(viewButtons) {
      viewButtons.forEach(button => {
        button.addEventListener("click", (event) => {
          const taskId = parseInt((event.currentTarget as HTMLElement).getAttribute("data-id") || "-1", 10);
          const target: Task = this.tasks.filter(task => task.id === taskId)[0];
          const targetStatus: TaskStatus = target.status;
          if (taskId !== -1) {
            this.openModal("view", targetStatus, taskId);
          }
        });
      })
    }
  }
}

export const taskService = new TaskManage();

// event listener
window.addEventListener("load", () => {
  document.getElementById("add-todo-button")?.addEventListener("click", () => taskService.openModal("add", TaskStatus.TODO));
  document.getElementById("add-progress-button")?.addEventListener("click", () => taskService.openModal("add", TaskStatus.PROGRESS))
  document.getElementById("add-done-button")?.addEventListener("click", () => taskService.openModal("add", TaskStatus.DONE));

  taskService.renderTasks();
})