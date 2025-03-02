import { TaskStatus, type Task } from "./TaskManager";

export class MovingProgress {
  private done: number = 0;
  private progress: number = 0;
  private totalTasks: number = 0;
  private allTasks: Task[] = [];
  private isInitial: boolean = true;

  initialize(tasks: Task[]) {
    this.allTasks = tasks;
    this.initialLoad();
  }

  initialLoad() {
    this.movingCharacter();
    this.isInitial = false;
  }
  countTasks() {
    if(!this.isInitial) {
      this.progress = 0;
      this.done = 0;
      this.totalTasks = 0;
    }
    this.allTasks.filter((task) => {
      task.status === TaskStatus.DONE ? (this.done += 1) : this.done;
      task.status === TaskStatus.PROGRESS
        ? (this.progress += 1)
        : this.progress;
      this.totalTasks++;
    });
  }
  drawingGround() {
    const ground = document.querySelector(".progress-ground");
    const groundLength = (this.progress + this.done) / this.totalTasks;

    console.log(groundLength);
  }
  movingCharacter() {
    this.countTasks();
    const character = document.querySelector(
      ".progress-character"
    ) as HTMLDivElement;
    // const characterWidth = character.offsetWidth / 2;
    const characterPosition = (this.done / this.totalTasks) * 100;
    console.log(this.done, this.progress, characterPosition)
    character!.classList.add("moving");
    character!.style.left = `${characterPosition}%`;
  }
}

export const movingProgress = new MovingProgress();