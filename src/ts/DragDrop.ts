import { taskService, TaskStatus, type Task } from "./TaskManager";
import { movingProgress } from "./Moving"
let draggedItem: HTMLElement | null = null;
let placeholder: HTMLElement | null = null;

export function dragAndDrop(): void {
  const tasks = document.querySelectorAll<HTMLElement>("[data-task]");

  // add eventlistener to all item of avaiable drag
  tasks.forEach((item) => {
    // start drag
    item.addEventListener('dragstart', (e: DragEvent) => {
      draggedItem = item;
      setTimeout(() => {
        item.classList.add('dragging');
        item.style.display = "none"
      }, 0);

      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', item.innerHTML);
      }
    });

    // end drag
    item.addEventListener('dragend', () => {
      if (draggedItem) {
        draggedItem!.style.display = "block"
        draggedItem.classList.remove('dragging');

        // when ended drag, change task status
        const taskStatusZone = draggedItem.parentElement!.id; // get task status
        const taskId = Number(draggedItem.dataset.id);
        const task: Task = taskService.getOneTasks(taskId)!; // get task dragging

        let newTask: Task = { ...task };

        if(taskStatusZone === "todo-task-zone") {
          newTask = {
            ...task,
            status: TaskStatus.TODO
          }
        } else if(taskStatusZone === "progress-task-zone") {
          newTask = {
            ...task,
            status: TaskStatus.PROGRESS
          }
        } else if(taskStatusZone === "done-task-zone") {
          newTask = {
            ...task,
            status: TaskStatus.DONE
          }
        }
        taskService.updateTaskData(newTask);
        movingProgress.movingCharacter();

        draggedItem = null;
      }

      if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }
      placeholder = null;
    });

    item.setAttribute('draggable', 'true');
  });
}

const columns = document.querySelectorAll<HTMLElement>("[data-column]");

// add event listener each column
columns.forEach(column => {
  column.addEventListener('dragover', (e: DragEvent) => {
    e.preventDefault();

    // find closest element from current mouse position
    const afterElement = getDragAfterElement(column, e.clientY);
    const draggable = document.querySelector<HTMLElement>('.dragging');

    if (!draggable) return;

    const dragItemId = (element: HTMLElement) => {
      if (element.id === draggable.id) {
        return draggable.id;
      }
      return null;
    };

    // placeholder of task
    if (!placeholder && draggedItem) {
      placeholder = document.createElement('li');
      placeholder.className = 'placeholder';
      placeholder.style.height = `100px`;
    }

    if(placeholder) {
      if (afterElement === null) {
        column.appendChild(placeholder);
      } else {
        column.insertBefore(placeholder, afterElement);
      }
    }
  });

  column.addEventListener('drop', (e: DragEvent) => {
    e.preventDefault();

    if (draggedItem && placeholder) {
      column.insertBefore(draggedItem, placeholder);

      if (placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }
      placeholder = null;
    }
  });
});

function getDragAfterElement(column: HTMLElement, y: number): HTMLElement | null {
  const draggableElements: HTMLElement[] = [
    ...column.querySelectorAll<HTMLElement>('[data-task]:not(.dragging)')
  ];

  let closestElement: HTMLElement | null = null;
  let closestOffset: number = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < draggableElements.length; i++) {
    const child = draggableElements[i];
    const box = child.getBoundingClientRect();

    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closestElement = child;
    }
  }

  return closestElement;
}