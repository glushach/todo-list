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
        taskInput = taskForm.querySelector('[type="text"]');

  // Конструирование шаблона задачи
  class Task {
    // date, priority, descr, classActiv, parent
    constructor(descr) {
      // this.date = date;
      // this.priority = priority;
      this.descr = descr;
      // this.classActiv = classActiv;
      this.parent = parent;
    }
    render() {
      taskList.innerHTML += `
        <div class="current-task current-task_mt">
          <div class="create-data">
            <span>18.12.2020</br><span>13:24</span></span>
          </div>
          <div class="priority">
            <div class="priority__current">1</div>
            <div class="priority__triggers">
              <div class="priority__top"><img src="arrows/priority-top.png" alt=""></div>
              <div class="priority__bottom"><img src="arrows/priority-bottom.png" alt=""></div>
            </div>
          </div>
          
          <div class="task-description task-description_active">${this.descr}</div>
          <div class="icons-editor"></div>
          <div class="icons-checked icons-checked_active"></div>
          <div class="icons-delete"></div>
        </div>
      `;
    }
  } //end class

  //Этот массив будет сохранятся в localStorage браузера пользователя
  let tasks = [
    // "Task for create user page",
    // "learn JS",
    // "Cooking",
    // "Shopping"
  ];

  // Извлечение строчного массива из JocalStorage и превращение его в JS массив
  if(localStorage.getItem('allTodo')) {
    tasks = JSON.parse(localStorage.getItem('allTodo'));
    createTask();
  }

  // Динамический вывод задач. Их количество зависит от количество элементов массива tasks
  function createTask() {
      // Очищает предыдущий рендеринг
      taskList.innerHTML = '';
      // Добавление задачи и формирование нового рендеринага
      tasks.forEach((task) => {
      new Task(
        task
      ).render();
        // Превращение JS массива в строчный и добавление его в localStorage
      localStorage.setItem('allTodo', JSON.stringify(tasks));
    });
    
  }



    // ЕСЛИ ПОЛЬЗОВАТЕЛЬ НАЖАЛ НА КНОПКУ ADD ДЛЯ ДОБАВЛЕНИЯ НОВОЙ ЗАДАЧИ
  // Функция-родитель для задач, под которую подвязываются функции изменения задач
  function createTaskList() {
    // Без этого не работает добавление новых задач
    createTask()

    // Без этого после добавления задачи не работает редактирование задач
    editor();
    // Без этого после первого добавления задачи не работают чекеты
    checked();
    // Без этого после добавления задачи не работает удаление задач
    deleteTask();

  } //end function createTaskList
  createTaskList();


  // В коде вызывается главная функция createTaskList после каждого добавления задачи
  // Которая в свою очередь вызывает подвязанные функции под себя
  taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const newTask = taskInput.value;
    // Дополнительная проверка, чтобы пользователь не отправил пустой value
    if(newTask) {
      tasks.unshift(newTask);
      createTaskList();
    }
    event.target.reset();
  });


  function editor() {
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
          
          // Само редактирование задачи.
          //Сначала через event.target вычисляется родитель, а в родителе ищется елемент для изменения
          const taskDescription = target.parentElement.querySelector('.task-description');
          let newTextContent = textarea.value;
          // Дополнительная проверка, чтобы пользователь не отправил пустую форму
          // Или слишком длинные слова
          if(newTextContent) {
            let charArr = newTextContent.split(' ');
            const arr = [];
            charArr.forEach((item, index) => {
              item = `${item.substring(0, 15)}`;
              arr.push(item);
            });
            newTextContent = arr.join(' ');
            taskDescription.textContent = newTextContent;
            // Извлечение строки из localStorage и преобразование ее в обычный массив
            tasks = JSON.parse(localStorage.getItem('allTodo'));

            // Установление нового значения массива из localStorage
            tasks[index] = taskDescription.textContent;
            // Массив трансформирутся в строку и помещается в localStorage
            localStorage.setItem('allTodo', JSON.stringify(tasks));


            // Закрыть модальное окно и очистить textarea
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
    }); //end цикл iconsEditor
  }
  editor();


  // ФУНКЦИОНАЛ ПО УДАЛЕНИЮ ЗАДАЧИ
  function deleteTask() {
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
          tasks.splice(index, 1);
          // Извлечение строки из localStorage и преобразование ее в обычный массив
          tasks = JSON.parse(localStorage.getItem('allTodo'));

          // Удаление значения массива из localStorage
          tasks.splice(index, 1);
          // Массив трансформирутся в строку и помещается в localStorage
          localStorage.setItem('allTodo', JSON.stringify(tasks));
          
        }; //end

        // Если пользователь отказался удалять задачу после показа модалки
        buttonNo.onclick = () => {
          confirm.classList.remove('confirm_active');
        }; //end
      }; //end
    });
  }
  deleteTask();

  // ФУНКЦИОНАЛ ПО ОТМЕТКЕ ВЫПОЛНЕННЫХ ЗАДАЧ
  // Навесить галочкам и тестовому блоку в каждой задачи обработчик события по отметке выполненности.
  function checked() {
    const iconsChecked = taskList.querySelectorAll('.icons-checked');
      iconsChecked.forEach((btn, index) => {
      
      btn.addEventListener('click', () => {
        console.log('click')
        btn.classList.remove('icons-checked_active');
        const parent = btn.parentElement.querySelector('.task-description');
        parent.classList.remove('task-description_active');
      });
    });
  }
  checked();
});




