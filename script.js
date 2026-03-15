const STORAGE_KEYS = {
  notes: "memo_checklist_notes",
  todos: "memo_checklist_todos",
};

const notesEl = document.getElementById("notes");
const clearNotesBtn = document.getElementById("clear-notes");
const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const todoStatus = document.getElementById("todo-status");
const todoTemplate = document.getElementById("todo-item-template");

let todos = loadTodos();

function saveNotes() {
  localStorage.setItem(STORAGE_KEYS.notes, notesEl.value);
}

function loadNotes() {
  notesEl.value = localStorage.getItem(STORAGE_KEYS.notes) ?? "";
}

function clearNotes() {
  notesEl.value = "";
  saveNotes();
}

function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEYS.todos);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item && typeof item.text === "string")
      .map((item) => ({
        id: String(item.id ?? crypto.randomUUID()),
        text: item.text.trim(),
        done: Boolean(item.done),
      }))
      .filter((item) => item.text.length > 0);
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(todos));
}

function updateTodoStatus() {
  const doneCount = todos.filter((todo) => todo.done).length;
  todoStatus.textContent = `${doneCount}/${todos.length} 완료`;
}

function createTodoItem(todo) {
  const item = todoTemplate.content.firstElementChild.cloneNode(true);
  const checkbox = item.querySelector(".todo-check");
  const text = item.querySelector(".todo-text");
  const deleteBtn = item.querySelector(".delete-btn");

  item.dataset.id = todo.id;
  text.textContent = todo.text;
  checkbox.checked = todo.done;
  item.classList.toggle("done", todo.done);

  checkbox.addEventListener("change", () => {
    todo.done = checkbox.checked;
    item.classList.toggle("done", todo.done);
    saveTodos();
    updateTodoStatus();
  });

  deleteBtn.addEventListener("click", () => {
    todos = todos.filter((entry) => entry.id !== todo.id);
    saveTodos();
    renderTodos();
  });

  return item;
}

function renderTodos() {
  todoList.innerHTML = "";

  todos.forEach((todo) => {
    todoList.appendChild(createTodoItem(todo));
  });

  updateTodoStatus();
}

function addTodo(event) {
  event.preventDefault();
  const text = todoInput.value.trim();

  if (!text) {
    return;
  }

  todos.unshift({
    id: crypto.randomUUID(),
    text,
    done: false,
  });

  saveTodos();
  renderTodos();
  todoForm.reset();
  todoInput.focus();
}

notesEl.addEventListener("input", saveNotes);
clearNotesBtn.addEventListener("click", clearNotes);
todoForm.addEventListener("submit", addTodo);

loadNotes();
renderTodos();
