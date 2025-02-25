let draggedItem: HTMLElement | null = null;
let placeholder: HTMLElement | null = null;

export function dragAndDrop(): void {
  const tasks = document.querySelectorAll<HTMLElement>("[data-task]");

  // 모든 드래그 가능 아이템에 이벤트 리스너 추가
  tasks.forEach((item) => {
    // 드래그 시작
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

    // 드래그 종료
    item.addEventListener('dragend', () => {
      if (draggedItem) {
        draggedItem!.style.display = "block"
        draggedItem.classList.remove('dragging');
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

const columns = document.querySelectorAll<HTMLElement>("[data-column");

// 각 컬럼에 드래그 이벤트 리스너 추가
columns.forEach(column => {
  // 드래그 오버 이벤트
  column.addEventListener('dragover', (e: DragEvent) => {
    e.preventDefault();

    // 현재 마우스 위치에 가장 가까운 요소 찾기
    const afterElement = getDragAfterElement(column, e.clientY);
    const draggable = document.querySelector<HTMLElement>('.dragging');

    if (!draggable) return;

    // console.log(afterElement)

    const dragItemId = (element: HTMLElement) => {
      if (element.id === draggable.id) {
        return draggable.id;
      }
      return null;
    };

    // 플레이스홀더 생성
    if (!placeholder && draggedItem) {
      placeholder = document.createElement('div');
      placeholder.className = 'placeholder';
      // placeholder.style.height = `${draggedItem.offsetHeight}px`;
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

  // 드롭 이벤트
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

  // 드래그 진입 이벤트 - 컬럼 하이라이트
  // column.addEventListener('dragenter', (e: DragEvent) => {
  //   e.preventDefault();
  //   column.classList.add('column-highlight');
  // });

  // // 드래그 떠남 이벤트 - 컬럼 하이라이트 제거
  // column.addEventListener('dragleave', (e: DragEvent) => {
  //   // 자식 요소로 이동할 때는 dragleave가 발생하므로
  //   // 실제로 컬럼을 떠났는지 확인
  //   const relatedTarget = e.relatedTarget as Node;
  //   if (relatedTarget && !column.contains(relatedTarget)) {
  //     column.classList.remove('column-highlight');
  //   }
  // });

  // 드롭 후 하이라이트 제거
  column.addEventListener('drop', () => {
    columns.forEach(col => col.classList.remove('column-highlight'));
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

    console.log(`offset: ${offset}, box.top: ${box.top}, y: ${y}`)
    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closestElement = child;
    }
  }

  return closestElement;
}