import { dragAndDrop } from "./DragDrop";

type Task = {
  id: number;
  name: string;
  status: "To Do" | "Progress" | "Done";
  description: string;
};

class TaskManage {
  private tasks: Task[] = [];
  private taskIdCounter: number = 1;

  getAllTasks(): Task[] {
    return this.tasks;
  }

  addTask(name: string, status: Task["status"], description: string): void {
    this.tasks.push({
      id: this.taskIdCounter++,
      name,
      status,
      description,
    });
    this.renderTasks();
    console.log(this.tasks);
  }

  update(updateTask: Task): void {
    const index = this.tasks.findIndex((task) => task.id === updateTask.id);
    if (index === -1) {
      console.warn(`Task with ID ${updateTask.id} not found.`);
      return;
    }

    this.tasks[index] = { ...this.tasks[index], ...updateTask };
    this.renderTasks();
    console.log(this.tasks);
  }

  deleteTask(taskId: number): void {
    this.tasks = this.tasks.filter((task) => task.id !== taskId);
    this.renderTasks();
    console.log(`Deleted task ID: ${taskId}`, this.tasks);
    console.log(this.tasks);
  }

  getTasksByStatus(status: Task["status"]): Task[] {
    return this.tasks.filter((task) => task.status === status);
  }

  renderTasks(): void {
    document.getElementById("todo-task-zone")!.innerHTML = this.generateTaskHtml("To Do");
    document.getElementById("progress-task-zone")!.innerHTML = this.generateTaskHtml("Progress");
    document.getElementById("done-task-zone")!.innerHTML = this.generateTaskHtml("Done");

    //for fake update modal
    enableTaskEditing();
    //for fake delete modal
    enableTaskDeletion();

    //for drag and drop
    dragAndDrop();
  }

  private generateTaskHtml(status: Task["status"]): string {
    const tasks = this.getTasksByStatus(status)
      .map(
        (
          task
        ) => `<li class="task" data-id=${task.id} draggable="true" data-task>${task.name}<br>${task.description}<br><button class="delete-task-btn" data-id="${task.id}">🗑</button>
</li>`
      )
      .join("");
    return `<ul class="task-list">${tasks}</ul>`;
  }
}

// create instance
const taskService = new TaskManage();

// fake add modal
function addNewTask(status: Task["status"]): void {
  const taskName = prompt("Enter task name:");
  const taskNDiscription = prompt("Enter task discription:");
  if (!taskName || !taskNDiscription) return;

  taskService.addTask(taskName, status, taskNDiscription);
}

// fake delete modal
function deleteTask(taskId: number): void {
  const task = taskService.getAllTasks().find((t) => t.id === taskId);
  if (!task) return;

  const confirmation = prompt(`Type "Y" to remove task: "${task.name}"`);
  if (confirmation !== "Y") return;

  taskService.deleteTask(taskId);
}
function enableTaskDeletion(): void {
  document.querySelectorAll(".delete-task-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const taskId = parseInt((event.target as HTMLElement).getAttribute("data-id") || "-1", 10);
      if (taskId !== -1) {
        deleteTask(taskId);
      }
    });
  });
}

// fake update modal
function openEditTaskModal(taskId: number): void {
  const task = taskService.getAllTasks().find((t) => t.id === taskId);

  if (!task) return;

  document.getElementById("task-modal")?.remove();

  const modal = document.createElement("div");
  modal.id = "task-modal";
  modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <h3>Edit Task</h3>
          <input type="text" id="edit-task-name" value="${task.name}">
          <input type="text" id="edit-task-description" value="${task.description}">
          <input type="text" id="edit-task-status" value="${task.status}">
          <button id="save-task">Save Changes</button>
          <button id="close-modal">Cancel</button>
        </div>
      </div>
    `;
  document.body.appendChild(modal);

  // update/save event
  document.getElementById("save-task")!.addEventListener("click", () => {
    const newName = (document.getElementById("edit-task-name") as HTMLInputElement).value.trim();
    const newDescription = (
      document.getElementById("edit-task-description") as HTMLInputElement
    ).value.trim();
    const newStatus = (
      document.getElementById("edit-task-status") as HTMLInputElement
    ).value.trim() as "To Do" | "Progress" | "Done";

    if (!newName || !newDescription || !newStatus) {
      alert("Please fill out all fields.");
      return;
    }

    taskService.update({
      id: taskId,
      name: newName,
      status: newStatus,
      description: newDescription,
    });
    document.body.removeChild(modal);
  });

  // modal close event listener
  document.getElementById("close-modal")!.addEventListener("click", () => {
    document.body.removeChild(modal);
  });
}
// for update modal event listener
function enableTaskEditing(): void {
  document.querySelectorAll(".task").forEach((taskElement) => {
    taskElement.addEventListener("click", () => {
      const taskId = parseInt(taskElement.getAttribute("data-id")!, 10);
      openEditTaskModal(taskId);
    });
  });
}

// event listener
window.addEventListener("load", () => {
  document.getElementById("add-todo-button")?.addEventListener("click", () => addNewTask("To Do"));
  document
    .getElementById("add-progress-button")
    ?.addEventListener("click", () => addNewTask("Progress"));
  document.getElementById("add-done-button")?.addEventListener("click", () => addNewTask("Done"));

  // first render
  taskService.renderTasks();
});
