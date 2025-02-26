import { type Task, taskService } from "./TaskManager";
import "../styles/modal.css"

export enum ModalType {
  ADD,
  EDIT,
  DELETE,
  VIEW
}
export class Modal {
  // private taskManager: TaskManage;
  private taskId?: number;
  private status?: Task["status"]

  constructor(
    private modalType: ModalType = ModalType.ADD
  ) {
    // this.taskManager = new TaskManage();
  }

  setTask(taskId: number) {
    this.taskId = taskId;
    return this;
  }
  setStatus(status: Task["status"]) {
    this.status = status;
    return this;
  }

  edit() {
    this.modalType = ModalType.EDIT;
    this.renderModal();
  }
  delete() {
    this.modalType = ModalType.DELETE;
    this.renderModal();
  }
  view() {
    this.modalType = ModalType.VIEW;
    this.renderModal();
  }
  add() {
    this.modalType = ModalType.ADD;
    this.renderModal();
  }

  renderModal() {
    const modal = document.createElement("div");
    modal.id = "task-modal";

    if(this.modalType === ModalType.DELETE) {
      modal.innerHTML = `
        <div class="modal-overlay">
          <div class="modal-delete-filling">
            <div class="modal-task-title">
                <p>Are you sure to delete this task?</p>
            </div>
            <div class="modal-buttons">
                <button class="btn" id="confirm-delete">Delete</button>
                <button class="btn" id="close-modal">Cancel</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      this.setupEventListeners();
    } else {
      let taskData = { name: '', description: '', status: this.status || 'To Do' };

      if ((this.modalType === ModalType.EDIT || this.modalType === ModalType.VIEW) && this.taskId) {
        const task = taskService.getAllTasks().find(item => item.id === this.taskId);
        if (task) {
          taskData = task;
        }
      }

      const title = this.modalType === ModalType.ADD ? "Add New Task" :
                    this.modalType === ModalType.EDIT ? "Edit Task" : "View Task";

      const readOnly = this.modalType === ModalType.VIEW ? "readonly" : "";

      modal.innerHTML = `
        <div class="modal">
          <div class="modal-filling">
            <div class="modal-task">
              <h3>${title}</h3>
              <div class="modal-task-title">
                <input type="text" id="task-name" placeholder="Task Name" ${readOnly}>
                <div class="custom-select">
                  <label for="task-status">Current status:</label>
                  <select id="task-status" ${readOnly}>
                    <option value="To Do">To Do</option>
                    <option value="Progress">Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>  
              </div>
            </div>
            <div class="modal-info">
              <textarea id="task-description" placeholder="Description" ${readOnly}></textarea>
            </div>
            <div class="modal-buttons">
              ${this.modalType !== ModalType.VIEW ?
              `<button class="modal-ok-btn btn" id="save-task">Save</button>` : ''}
              <button class="modal-edit-cancel-btn btn" id="close-modal">Close</button>
            </div>      
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    // Close modal
    const closeBtn = document.getElementById("close-modal");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.closeModal();
      });
    }

    // Save task
    const saveBtn = document.getElementById("save-task");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        this.saveTaskData();
      });
    }

    // Delete confirmation
    const deleteBtn = document.getElementById("confirm-delete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        this.deleteTask();
      });
    }
  }

  saveTaskData() {
    const title = document.querySelector("#task-name") as HTMLInputElement;
    const detail = document.querySelector("#task-description") as HTMLInputElement;
    const status = document.querySelector("#task-status") as HTMLInputElement;

    // const newTask = {
    //   id: Date.now(),
    //   name: title.value,
    //   description: detail.value,
    //   status: status.value
    // };

    if (this.modalType === ModalType.EDIT && this.taskId) {
      // Update existing task
      taskService.update({
        id: this.taskId,
        name: title.value,
        description: detail.value,
        status: status.value as Task["status"]
      });
    } else if(this.modalType === ModalType.ADD) {
      // Add new task
      const newTask: Task = {
        id: Date.now(),
        name: title.value,
        description: detail.value,
        status: status.value as Task["status"]
      };

      taskService.saveTask(newTask);
    }

    this.closeModal();
    taskService.renderTasks();
  }

  closeModal() {
    const modal = document.getElementById("task-modal");
    if (modal) {
      document.body.removeChild(modal);
    }
  }
  deleteTask() {
    this.closeModal();
  }
}
