import { TaskStatus, type Task, taskService } from "./TaskManager";
import "../styles/modal.css"
import mod from "astro/zod";

export enum ModalType {
  ADD,
  EDIT,
  DELETE,
  VIEW
}
export class Modal {
  private taskId?: number;
  private status?: Task["status"]

  constructor(
    private modalType: ModalType = ModalType.ADD // set modalType as default ADD
  ) {
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
                <button class="btn" id="delete-task">Delete</button>
                <button class="btn" id="close-modal">Cancel</button>
            </div>
          </div>
        </div>
      `;
    } else {
      let data = { name: '', description: '', status: this.status || TaskStatus.TODO, now: '' };

      if ((this.modalType === ModalType.EDIT || this.modalType === ModalType.VIEW) && this.taskId) {
        const task = taskService.getAllTasks().find(item => item.id === this.taskId);
        if (task) {
          data = task;
        }
      }

      const title = this.modalType === ModalType.ADD ? "Add New Task" :
                    this.modalType === ModalType.EDIT ? "Edit Task" : "View Task";

      const readOnly = this.modalType === ModalType.VIEW ? "readonly" : "";

      modal.innerHTML = `
        <div class="modal">
          <div class="modal-filling ${this.modalType === ModalType.EDIT ? 'edit' : ''}">
            <div class="modal-task-title">
              <input type="text" id="task-name" placeholder="Task Name" value="${data.name}" ${readOnly}>
              <div class="modal-task-title-footer">
                <div class="custom-select">
                  <label for="task-status">Current status: ${this.status}</label>
                  ${this.modalType !== ModalType.VIEW ?
                    `<select id="task-status" ${readOnly}>
                      <option value="To Do" ${data.status === TaskStatus.TODO ? 'selected' : ''}>To Do</option>
                      <option value="Progress" ${data.status === TaskStatus.PROGRESS ? 'selected' : ''}>Progress</option>
                      <option value="Done" ${data.status === TaskStatus.DONE ? 'selected' : ''}>Done</option>
                    </select>` : ""}
                </div>
                ${this.modalType !== ModalType.ADD ?
                `<span>Updated: ${data.now}</span>`: ""}
              </div>    
            </div>
            <div class="modal-info">
              <h4>DETAILS: </h4>
              <textarea id="task-description" placeholder="Description" ${readOnly}>${data.description}</textarea>
            </div>
            <div class="modal-buttons">
              ${this.modalType !== ModalType.VIEW ?
              `<button class="modal-ok-btn btn" id="save-task">Save</button>` : `<button class="modal-ok-btn btn" id="edit-task">Edit <img src="src/assets/edit.svg" alt=""></button>`}
              <button class="modal-edit-cancel-btn btn" id="close-modal">Close</button>
            </div>
            <div  class="modal-type">
              <h3>${title}</h3>
            </div>
          </div>
        </div>
      `;
    }

    document.body.appendChild(modal);
    this.buttonsEventListener();
  }

  buttonsEventListener() {
    // close modal
    const closeButton = document.querySelector("#close-modal");
    if(closeButton) {
      closeButton.addEventListener("click", () => {
        this.closeModal();
      })
    }
    // save task
    const saveButton = document.querySelector("#save-task")
    if(saveButton) {
      saveButton.addEventListener("click", () => {
        this.saveTaskData();
      })
    }

    // delete task
    const deleteButton = document.querySelector("#delete-task");
    if(deleteButton) {
      deleteButton.addEventListener("click", () => {
        this.deleteTask();
      })
    }

    // changing to edit
    const editButton = document.querySelector("#edit-task");
    if(editButton) {
      editButton.addEventListener("click", () => {
        this.modalType = ModalType.EDIT;
        this.closeModal();
        this.renderModal();
      })
    }
  }

  closeModal() {
    const modal = document.querySelector("#task-modal")
    if(modal) {
      document.body.removeChild(modal);
    }
  }

  saveTaskData() {
    const title = document.querySelector("#task-name") as HTMLInputElement;
    const detail = document.querySelector("#task-description") as HTMLInputElement;
    const status = document.querySelector("#task-status") as HTMLInputElement;
    const now = new Date();

    if (this.modalType === ModalType.EDIT && this.taskId) {
      taskService.updateTask({
        id: this.taskId,
        name: title.value,
        description: detail.value,
        now: now.toLocaleString(),
        status: status.value as Task["status"]
      });
    } else if(this.modalType === ModalType.ADD) {
      const newTask: Task = {
        id: Date.now(),
        name: title.value,
        description: detail.value,
        status: status.value as Task["status"],
        now: now.toLocaleString()
      };

      taskService.saveTask(newTask);
    }

    this.closeModal();
  }

  deleteTask() {
    if(this.taskId) {
      taskService.deleteTask(this.taskId)
    }
    this.closeModal();
  }
}
