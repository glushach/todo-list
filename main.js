'use strict';
document.addEventListener('DOMContentLoaded', () => {
  // ПРОВЕРКА ЛОГИНА ВХОДА НА САЙТ
  const formEntrance = document.querySelector('#login'),
        labelEmail = formEntrance.querySelector('#email'),
        addEmail = formEntrance.querySelector('[type="email"]'),
        labelPassword = formEntrance.querySelector('#password'),
        addPassword = formEntrance.querySelector('[type="password"]'),
        addForm = formEntrance.querySelector('.form'),
        email = 'testuser@todo.com',
        password = 12345678,
        todoPage = document.querySelector('#todo'); //участвует во всех скриптах

  // подсказка пользователю
  const emailWrong = labelEmail.querySelector('span'),
        passwordWrong = labelPassword.querySelector('span');

  function showWrong(wrong, value) {
    value.addEventListener('focus', () => {
      wrong.style.opacity = 0;
    })
  }
  showWrong(emailWrong, addEmail);
  showWrong(passwordWrong, addPassword);


  //если пользователь нажал на кнопку формы
  addForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Полученние email и пароля от пользователя
    const userEmail = addEmail.value;
    const userPassword = +addPassword.value;

    // Сравнение данных, полученных от пользователя с данными Базы Данных
    if(email === userEmail && password === userPassword) {
      formEntrance.classList.remove('overlay_active');
      todoPage.classList.add('container_active');
    }

    if(email !== userEmail) {
      emailWrong.style.opacity = 1;
    }

    if(password !== userPassword) {
      passwordWrong.style.opacity = 1;
    }

    if(email !== userEmail && password !== userPassword) {
      emailWrong.style.opacity = 1;
      passwordWrong.style.opacity = 1;
    }
  });



  //СОЗДАНИЕ ЗАДАЧИ
  const taskList = todoPage.querySelector('.task-list'),
        taskForm = todoPage.querySelector('#task'),
        taskInput = taskForm.querySelector('[type="text"]'),
        taskDB = {
          tasks: [
            "Task for create user page",
            "learn JS",
            "Cooking",
            "Shopping"
          ]
        }
  // Очистка статичекой верстки от задач
  taskList.innerHTML = "";

  // Вывод динамический вертки. Количество верстки зависит от количество элементов массива в объекте taskDB
  taskDB.tasks.forEach((task, index) => {
    taskList.innerHTML += `
    <div class="current-task current-task_mt">
      <div class="create-data">
        <span>12.12.2020</br><span>13:24</span></span>
      </div>
      <div class="priority">
        <div class="priority__current">1</div>
        <div class="priority__triggers">
          <div class="priority__top"><img src="arrows/priority-top.png" alt=""></div>
          <div class="priority__bottom"><img src="arrows/priority-bottom.png" alt=""></div>
        </div>
      </div>
      <div class="task-description task-description_active">${task}</div>
      <div class="editor-task">
        <div class="icons-editor">
        </div>
        <div class="icons-checked icons-checked_active">
        </div>
        <div class="icons-delete">
        </div>
      </div>
    </div>
    `;
  });

  //если пользователь нажал на кнопку формы
  taskForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const newTask = taskInput.value;

    taskDB.tasks.push(newTask);
  });
});
