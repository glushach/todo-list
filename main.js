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



  //ФУНКЦИОНАЛ ПО СОЗДАНИЮ ЗАДАЧИ
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
  // Реверс массива, чтобы новые задачи отображались сверху taskList на сайте.Чем новее время, тем выше будет задача
  const reverseArr = (arr) => {
    arr.reverse();
  }
  reverseArr(taskDB.tasks);

  function createTaskList(tasks, parent) {
    // Очистка статичекой верстки от задач
    parent.innerHTML = "";

    // Вывод динамический вертки. Количество верстки зависит от количество элементов массива в объекте taskDB
    tasks.forEach((task, index) => {
      parent.innerHTML += `
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
        <div class="icons-editor"></div>
        <div class="icons-checked icons-checked_active"></div>
        <div class="icons-delete"></div>
      </div>
      `;
    });
    
    // ФУНКЦИОНАЛ ПО УДАЛЕНИЮ ЗАДАЧИ
    const confirm = document.querySelector('#modal-delete'),
          buttonNo = confirm.querySelector('.button-no'),
          buttonYes = confirm.querySelector('.button-yes'),
          iconsDelete = taskList.querySelectorAll('.icons-delete');

    //Навесить корзинам в каждой задачи taskList обработчик события по удалению задачи. Прописываем события через onclick, чтобы новое событие перекрывало старое
    iconsDelete.forEach((btn, index) => {
      btn.onclick = (event) => {
        const target = event.target;

        confirm.classList.add('confirm_active');
        // Если пользователь согласился удалить задачу после показа модалки
        buttonYes.onclick = () => {
          confirm.classList.remove('confirm_active');
          target.parentElement.remove();
          taskDB.tasks.splice(index, 1);
        }; //end

        // Если пользователь отказался удалять задачу после показа модалки
        buttonNo.onclick = () => {
          confirm.classList.remove('confirm_active');
        }; //end
      }; //end
    });

    
  } //end function createTaskList
  createTaskList(taskDB.tasks, taskList);



  // ЕСЛИ ПОЛЬЗОВАТЕЛЬ НАЖАЛ НА КНОПКУ ADD ДЛЯ ДОБАВЛЕНИЯ НОВОЙ ЗАДАЧИ
  taskForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const newTask = taskInput.value;

    // Дополнительная проверка, чтобы пользователь не отправил пустой value
    if(newTask) {

      taskDB.tasks.unshift(newTask);

      createTaskList(taskDB.tasks, taskList);
    }

    event.target.reset();
  });


  // ФУНКЦИОНАЛ ПО РЕДАКТИРОВАНИЮ ЗАДАЧИ
  const editor = document.querySelector('#modal-editor'),
  textarea = editor.querySelector('[name="task"]'),
  buttonCancel = editor.querySelector('#cancel'),
  buttonSave = editor.querySelector('#save'),
  iconsEditor = document.querySelectorAll('.icons-editor');

  // Навесить карандашам в каждой задачи обработчик события по редактированию задачи.
  // Прописываем события через onclick, чтобы новое событие перекрывало старое
  iconsEditor.forEach((btn, index) => {
    btn.onclick = (event) => {
    let target = event.target;

    editor.classList.add('editor_active');

      // Если пользователь согласился редактировать задачу
      buttonSave.onclick = (e) => {
        e.preventDefault();
        
        // e.target.reset();

        // Само редактирование задачи.
        //Сначала через event.target вычисляется родитель, а в родителе ищется елемент для изменения
        const taskDescription = target.parentElement.querySelector('.task-description');
        let newTextContent = textarea.value;
        // Дополнительная проверка, чтобы пользователь не отправил пустую форму
        // Или слишком длинные слова
        if(newTextContent) {
          let charArr = newTextContent.split(' ');
          const arr = [];
          charArr.forEach(item => {
            item = `${item.substring(0, 15)}`;
            arr.push(item);
          });
          newTextContent = arr.join(' ');


          taskDescription.textContent = newTextContent;
          editor.classList.remove('editor_active');
          textarea.value = '';
        }

      };
      // Если пользователь нажал CANCEL
      buttonCancel.onclick = (e) => {
        e.preventDefault();
        editor.classList.remove('editor_active');
      };
    };
  });

});