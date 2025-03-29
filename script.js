// Загрузка задач из localStorage при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadTheme(); // Загружаем тему при загрузке страницы
    loadTasks();
    setupEnterKeyListener(); // Добавляем обработчик для клавиши Enter
    loadUserInfo(); // Загружаем информацию о пользователе
});

// Загрузка информации о пользователе
function loadUserInfo() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
    document.getElementById('displayName').textContent = userInfo.name || 'Не указано';
    document.getElementById('displayPosition').textContent = userInfo.position || 'Не указано';
    document.getElementById('displayDepartment').textContent = userInfo.department || 'Не указано';
}

// Сохранение информации о пользователе
function saveUserInfo() {
    const userName = document.getElementById('userName').value.trim();
    const userPosition = document.getElementById('userPosition').value;
    const userDepartment = document.getElementById('userDepartment').value;

    if (userName && userPosition && userDepartment) {
        const userInfo = {
            name: userName,
            position: userPosition,
            department: userDepartment
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        loadUserInfo(); // Обновляем отображение информации о пользователе
        alert('Информация о пользователе успешно сохранена.');
    } else {
        alert('Пожалуйста, заполните все поля.');
    }
}

function toggleUserInput() {
    const userInputSection = document.getElementById('userInputSection');
    if (userInputSection.style.display === 'none' || userInputSection.style.display === '') {
        userInputSection.style.display = 'block'; // Показываем блок
    } else {
        userInputSection.style.display = 'none'; // Скрываем блок
    }
}

// Загрузка задач
function loadTasks() {
    const tasks = getTasks();
    const activeTaskContainer = document.getElementById('activeTaskContainer');
    const completedTaskContainer = document.getElementById('completedTaskContainer');
    activeTaskContainer.innerHTML = ''; // Очистка контейнеров перед загрузкой
    completedTaskContainer.innerHTML = '';

    // Сортируем задачи: высокий приоритет -> обычный -> низкий
    const sortedTasks = sortTasksByPriority(tasks);

    sortedTasks.forEach((task) => {
        if (task.completed) {
            addTaskToDOM(task, completedTaskContainer);
        } else {
            addTaskToDOM(task, activeTaskContainer);
        }
    });
    updateStats();
}

// Добавление задачи
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const taskText = taskInput.value.trim();
    const priority = prioritySelect.value;

    if (taskText !== "") {
        const tasks = getTasks();
        const newTask = createTask(taskText, priority);
        tasks.push(newTask);
        saveTasks(tasks);

        loadTasks(); // Перезагружаем список задач
        taskInput.value = ""; // Очищаем поле ввода
    } else {
        alert('Пожалуйста, введите текст задачи.'); // Уведомление, если поле пустое
    }
}

// Обработчик для клавиши Enter
function setupEnterKeyListener() {
    const taskInput = document.getElementById('taskInput');
    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addTask(); // Добавляем задачу при нажатии Enter
        }
    });
}

// Создание задачи
function createTask(text, priority) {
    return {
        text: text,
        completed: false,
        priority: priority,
        createdAt: new Date().toLocaleString(),
        closedAt: null,
        index: Date.now(), // Уникальный индекс задачи
    };
}

// Получение задач из localStorage
function getTasks() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

// Сохранение задач в localStorage
function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Сортировка задач по приоритету
function sortTasksByPriority(tasks) {
    const priorityOrder = { high: 1, normal: 2, low: 3 };
    return tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

// Добавление задачи в DOM
function addTaskToDOM(task, container) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('task', `priority-${task.priority}`);
    if (task.completed) {
        taskElement.classList.add('completed');
    }
    taskElement.setAttribute('data-index', task.index); // Используем уникальный индекс задачи

    // Заголовок задачи
    const taskHeader = document.createElement('div');
    taskHeader.classList.add('task-header');

    const taskTextElement = document.createElement('div');
    taskTextElement.textContent = task.text;
    
    taskTextElement.addEventListener('dblclick', () => enableTaskEdit(taskElement, task.index));

    const taskActions = document.createElement('div');
    taskActions.classList.add('task-actions');

    const completeButton = document.createElement('button');
    completeButton.textContent = task.completed ? 'Отменить' : 'Выполнено';
    completeButton.classList.add('complete');
    completeButton.onclick = () => toggleTaskCompletion(task.index); // Используем уникальный индекс

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Удалить';
    deleteButton.classList.add('delete');
    deleteButton.onclick = () => deleteTask(task.index); // Используем уникальный индекс

    taskActions.appendChild(completeButton);
    taskActions.appendChild(deleteButton);
    taskHeader.appendChild(taskTextElement);
    taskHeader.appendChild(taskActions);

    // Время создания и закрытия
    const taskTime = document.createElement('div');
    taskTime.classList.add('task-time');
    taskTime.innerHTML = `
        <div>Создано: ${task.createdAt}</div>
        ${task.closedAt ? `<div>Закрыто: ${task.closedAt}</div>` : ''}
    `;

    taskElement.appendChild(taskHeader);
    taskElement.appendChild(taskTime);

    container.appendChild(taskElement);
}

function enableTaskEdit(taskElement, taskIndex) {
    const taskTextElement = taskElement.querySelector('.task-header div');
    const originalText = taskTextElement.textContent;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalText;
    taskTextElement.replaceWith(input);
    input.focus();

    input.addEventListener('blur', () => {
        const newText = input.value.trim();
        if (newText) {
            const tasks = getTasks();
            const task = tasks.find(t => t.index === taskIndex);
            if (task) {
                task.text = newText;
                saveTasks(tasks);
                loadTasks();
            }
        } else {
            taskTextElement.textContent = originalText;
            input.replaceWith(taskTextElement);
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            input.blur();
        }
    });
}

// Переключение состояния задачи
function toggleTaskCompletion(taskIndex) {
    const tasks = getTasks();
    const task = tasks.find(t => t.index === taskIndex);
    if (task) {
        task.completed = !task.completed;
        task.closedAt = task.completed ? new Date().toLocaleString() : null;
        saveTasks(tasks);
        loadTasks();
        alert(`Задача "${task.text}" ${task.completed ? 'выполнена' : 'возвращена в работу'}.`);
    }
}

// Удаление задачи
function deleteTask(taskIndex) {
    const tasks = getTasks();
    const taskIndexToDelete = tasks.findIndex(t => t.index === taskIndex); // Находим индекс задачи по уникальному индексу
    if (taskIndexToDelete !== -1) {
        tasks.splice(taskIndexToDelete, 1);
        saveTasks(tasks);
        loadTasks(); // Перезагружаем задачи
    }
}

// Удаление всех задач
function deleteAllTasks() {
    const tasks = getTasks();
    if (tasks.length === 0) {
        alert('Нет задач для удаления.');
        return;
    }

    if (confirm('Вы уверены, что хотите удалить все задачи?')) {
        localStorage.removeItem('tasks');
        loadTasks();
        alert('Все задачи удалены.');
    }
}

// Фильтрация задач по приоритету
function filterTasks() {
    document.getElementById('searchInput').value = ''; // Очищаем поле поиска
    const filterValue = document.getElementById('filterSelect').value;
    const tasks = getTasks();
    let filteredTasks = tasks;

    if (filterValue === 'high' || filterValue === 'normal' || filterValue === 'low') {
        filteredTasks = tasks.filter(task => task.priority === filterValue);
    } else if (filterValue === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    } else if (filterValue === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    }

    if (filteredTasks.length === 0) {
        alert('Нет задач, соответствующих выбранному фильтру.');
    }

    loadFilteredTasks(filteredTasks);
}

// Поиск задач
function searchTasks() {
    const searchText = document.getElementById('searchInput').value.trim().toLowerCase();
    const tasks = getTasks();
    const filteredTasks = tasks.filter(task => task.text.toLowerCase().includes(searchText));
    loadFilteredTasks(filteredTasks);
}

// Сортировка задач
function sortTasksByDate() {
    document.getElementById('searchInput').value = ''; // Очищаем поле поиска
    const sortValue = document.getElementById('sortSelect').value;
    const tasks = getTasks();

    const sortedTasks = tasks.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortValue === 'newest' ? dateB - dateA : dateA - dateB;
    });

    loadFilteredTasks(sortedTasks);
}

// Обновление статистики
function updateStats() {
    const tasks = getTasks();
    const activeTasks = tasks.filter(task => !task.completed).length;
    const completedTasks = tasks.filter(task => task.completed).length;

    document.getElementById('activeTasksCount').textContent = activeTasks;
    document.getElementById('completedTasksCount').textContent = completedTasks;
}

function loadFilteredTasks(tasks) {
    const activeTaskContainer = document.getElementById('activeTaskContainer');
    const completedTaskContainer = document.getElementById('completedTaskContainer');
    activeTaskContainer.innerHTML = '';
    completedTaskContainer.innerHTML = '';

    tasks.forEach(task => {
        if (task.completed) {
            addTaskToDOM(task, completedTaskContainer);
        } else {
            addTaskToDOM(task, activeTaskContainer);
        }
    });
}

// Экспорт задач в файл
function exportTasks() {
    const tasks = getTasks();
    const data = JSON.stringify(tasks, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const fileName = `tasks_${formattedDate}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();

    alert('Задачи успешно экспортированы в файл ' + fileName);
}

// Вспомогательная функция для добавления ведущего нуля
function pad(number) {
    return number < 10 ? `0${number}` : number;
}

// Импорт задач из файла
function importTasks(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedTasks = JSON.parse(e.target.result);
            if (!Array.isArray(importedTasks)) {
                throw new Error('Некорректный формат файла.');
            }

            const tasksWithCreationDate = importedTasks.map(task => {
                if (!task.createdAt) {
                    task.createdAt = new Date().toLocaleString();
                }
                if (!task.index) {
                    task.index = Date.now();
                }
                return task;
            });

            const mergedTasks = [...getTasks(), ...tasksWithCreationDate];
            saveTasks(mergedTasks);
            loadTasks();
            alert('Задачи успешно импортированы.');
        } catch (error) {
            alert('Ошибка при импорте задач: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Переключение темы (светлый/тёмный режим)
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');

    // Сохраняем текущую тему в localStorage
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

    // Меняем иконку в зависимости от темы
    const themeButton = document.getElementById('themeButton');
    if (isDarkMode) {
        themeButton.innerHTML = '☀️'; // Иконка солнца для тёмного режима
    } else {
        themeButton.innerHTML = '🌙'; // Иконка луны для светлого режима
    }
}

// Загрузка темы из localStorage
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const themeButton = document.getElementById('themeButton');
        themeButton.innerHTML = '☀️'; // Иконка солнца для тёмного режима
    }
}