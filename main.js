'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const $todoPage = document.querySelector('#todo'); //участвует в двух скриптах
  // ПРОВЕРКА ЛОГИНА ВХОДА НА САЙТ
  const $formEntrance = document.querySelector('#login'),
        $labelEmail = $formEntrance.querySelector('#email'),
        $emailWrong = $labelEmail.querySelector('span'),
        $email = $labelEmail.querySelector('[type="email"]'),
        $labelPassword = $formEntrance.querySelector('#password'),
        $passwordWrong = $labelPassword.querySelector('span'),
        $password = $labelPassword.querySelector('[type="password"]'),
        $form = $formEntrance.querySelector('.form'),
        email = 'testuser@todo.com',
        password = 12345678;


  function showWrong(wrong, value) {
    value.addEventListener('focus', () => {
      wrong.style.opacity = 0;
    });
  }
  showWrong($emailWrong, $email);
  showWrong($passwordWrong, $password);


  //если пользователь нажал на кнопку формы
  $form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Полученние email и пароля от пользователя
    const userEmail = $email.value;
    const userPassword = +$password.value;

    // Сравнение данных, полученных от пользователя с данными Базы Данных
    if(email === userEmail && password === userPassword) {
      $formEntrance.classList.remove('overlay_active');
      $todoPage.classList.add('container_active');
      localStorage.setItem('isEntrance', true);
    }

    if(email !== userEmail) {
      $emailWrong.style.opacity = 1;
    }

    if(password !== userPassword) {
      $passwordWrong.style.opacity = 1;
    }

    if(email !== userEmail && password !== userPassword) {
      $emailWrong.style.opacity = 1;
      $passwordWrong.style.opacity = 1;
    }
  });

  // Если пользователь зашел на сайт
  if(localStorage.getItem('isEntrance')) {
    $formEntrance.classList.remove('overlay_active');
    $todoPage.classList.add('container_active');
  }



  //ФУНКЦИОНАЛ ПО СОЗДАНИЮ ЗАДАЧИ И ДОБАВЛЕНИЮ ЗАДАЧИ
  const $taskList = $todoPage.querySelector('.task-list'), //участвует в нескольких скриптах
        $taskForm = $todoPage.querySelector('#task'),
        $taskInput = $taskForm.querySelector('[type="text"]'),
        App = {
          tasks: []
        };

  function addStorage() {
   // Превращение массива tasks в строчный и ДОБАВЛЕНИЕ его в localStorage
    localStorage.setItem('allTodo', JSON.stringify(App.tasks));
  }
  function getStorage() {
    // Если в localStorage есть ключ allTodo, то присвоить его значение массиву tasks
    if(localStorage.getItem('allTodo')) {
      App.tasks = JSON.parse(localStorage.getItem('allTodo'));
    }
  }

  // При клике на ADD получение объекта от пользователя и добавление их в массив tasks
  $taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if($taskInput.value) {
      const newTask = $taskInput.value;

      const task = {
        date: Date.now(),
        prior: 1,
        text: newTask,
        done: false
      };
      event.target.reset();
      App.tasks.unshift(task); // Объект добавляется в массив tasks
      addStorage();
      createTask();
    } else {
      alert('Empty task text!');
    }
  });
  
  // Вспомогательная функция для генерации даты
  function generatedDate(date) {
    function withZero(num){
      return num < 10 ? '0'+ num: num;
    }
    const pDate = new Date();
    pDate.setTime(date);
    const hour = withZero(pDate.getHours());
    const min = withZero(pDate.getMinutes());
    const day = withZero(pDate.getDate());
    const month = withZero(pDate.getMonth() + 1);
    const year = pDate.getFullYear();
    return  `<span>${day}.${month}.${year}</br></span>
            <span>${hour}:${min}</span>`;
  }


  // Конструирование шаблона задачи для вывода на страницу
  class Task {
    constructor(date, prior, text) {
      this.date = date;
      this.prior = prior;
      this.text = text;
      this.parent = parent;
    }
    render() {
      $taskList.innerHTML += `
        <div class="current-task current-task_mt">
          <div class="create-data">${this.date}</div>
          <div class="priority">
            <div class="priority__current">${this.prior}</div>
            <div class="priority__triggers">
              <div class="priority__top"><img src="arrows/priority-top.png" alt=""></div>
              <div class="priority__bottom"><img src="arrows/priority-bottom.png" alt=""></div>
            </div>
          </div>
          
          <div class="task-description task-description_active">${this.text}</div>
          <div class="icons-editor"></div>
          <div class="icons-checked icons-checked_active"></div>
          <div class="icons-delete"></div>
        </div>
      `;
    }
  } //end class

  // Динамический вывод задач. Их количество зависит от количество элементов массива tasks
  function createTask() {
      // Очищает предыдущий рендеринг
      $taskList.innerHTML = '';
      getStorage();
      // Перебор массива tasks. Добавление задачи и формирование нового рендеринага
      App.tasks.forEach((task) => {
      new Task(
        generatedDate(task.date),
        task.prior,
        task.text
      ).render();
    });
    priority();
    editor();
    checked();
    deleteTask();
  }
  createTask();



  // ФУНКЦИОНАЛ ПО РЕДАКТИРОВАНИЮ ЗАДАЧИ
  function editor() {
    const $editor = document.querySelector('#modal-editor'),
    $textarea = $editor.querySelector('[name="task"]'),
    $buttonCancel = $editor.querySelector('#cancel'),
    $buttonSave = $editor.querySelector('#save'),
    $iconsEditor = document.querySelectorAll('.icons-editor');

    // Навесить карандашам в каждой задачи обработчик события по редактированию задачи.
    // Прописываем события через onclick, чтобы новое событие перекрывало старое
    $iconsEditor.forEach((btn, index) => {
      btn.onclick = (event) => {
      let target = event.target;

      $editor.classList.add('editor_active');
      // Вывод старого контента в техтарею
      getStorage();
      if(App.tasks[index].text) {//Без проверки иногда была ошибка
        $textarea.value = App.tasks[index].text;
      }
      
      //Сначала через event.target вычисляется родитель, а в родителе ищется елемент для изменения
      const taskDescription = target.parentElement.querySelector('.task-description');
        // Если пользователь согласился редактировать задачу
        $buttonSave.onclick = (e) => {
          e.preventDefault();
          // Само редактирование задачи.
          let newTextContent = $textarea.value;
          // Дополнительная проверка, чтобы пользователь не отправил пустую форму
          if(newTextContent) {
              // Обрезание слишком длинных слов в предложении
              let charArr = newTextContent.split(' ');
              const arr = [];
              charArr.forEach((item) => {
              item = `${item.substring(0, 15)}`;
              arr.push(item);
              });
              newTextContent = arr.join(' ');
              taskDescription.textContent = newTextContent;
            getStorage();
            App.tasks[index].text = taskDescription.textContent;
            addStorage();
            // Закрыть модальное окно и очистить $textarea
            $editor.classList.remove('editor_active');
            $textarea.value = '';
          }

        };
        // Если пользователь нажал CANCEL
        $buttonCancel.onclick = (e) => {
          e.preventDefault();
          $editor.classList.remove('editor_active');
        };
      };
    }); //end цикл $iconsEditor
  } //end fn


  // ФУНКЦИОНАЛ ПО УДАЛЕНИЮ ЗАДАЧИ
  function deleteTask() {
    const $confirm = document.querySelector('#modal-delete'),
          $buttonNo = $confirm.querySelector('.button-no'),
          $buttonYes = $confirm.querySelector('.button-yes'),
          $iconsDelete = $taskList.querySelectorAll('.icons-delete');

    //Навесить корзинам в каждой задачи $taskList обработчик события по удалению задачи. Прописываем события через onclick, чтобы новое событие перекрывало старое
    $iconsDelete.forEach((btn, index) => {
      btn.onclick = (event) => {
        const target = event.target;

        $confirm.classList.add('confirm_active');
        // Если пользователь согласился удалить задачу после показа модалки
        $buttonYes.onclick = () => {
          $confirm.classList.remove('confirm_active');
          target.parentElement.remove(); // Само удаление задачи

          getStorage();
          App.tasks.splice(index, 1); // Удаление значения массива из localStorage
          addStorage();
        }; //end

        // Если пользователь отказался удалять задачу после показа модалки
        $buttonNo.onclick = () => {
          $confirm.classList.remove('confirm_active');
        }; //end
      }; //end
    });
  } //end fn



  // ФУНКЦИОНАЛ ПО ОТМЕТКЕ ВЫПОЛНЕННЫХ ЗАДАЧ
  // Навесить галочкам и тестовому блоку в каждой задачи обработчик события по отметке выполненности.
  function checked() {
    const $iconsChecked = $taskList.querySelectorAll('.icons-checked');
    
      $iconsChecked.forEach((btn, index) => {
      const $parent = btn.parentElement.querySelector('.task-description');
      btn.addEventListener('click', () => {
        getStorage();

        // Установление нового значения объекта в массива из localStorage в зависимости от условия
        if(App.tasks[index].done == false) {
          App.tasks[index].done = true;
        } else if(App.tasks[index].done == true) { //С просто else не работало в Opera
          App.tasks[index].done = false;
        }
        addStorage();
        createTask();
      });
      if(App.tasks[index].done == true) {
          btn.classList.remove('icons-checked_active');
          $parent.classList.remove('task-description_active');
        }
        
    }); //end цикл
  }

  // ФУНКЦИОНАЛ ПО РЕАЛИЗАЦИИ ВЫБОРА ПРИОРИТЕТОВ
  function priority() {
    const $prTop = $taskList.querySelectorAll('.priority__top'),
          $prBottom = $taskList.querySelectorAll('.priority__bottom');

    // Функционал верхнего триггера
      $prTop.forEach((tr, index) => {
        tr.onclick = (event) => {
          const target = event.target.parentElement.parentElement.parentElement.querySelector('.priority__current');
          if(+target.textContent < 10) {
            target.textContent++;
          }
          getStorage();
          App.tasks[index].prior = +target.textContent;
          addStorage();
      }; //end click
    }); //end цикл
  
    // Функционал нижнего триггера
    $prBottom.forEach((tr, index) => {
      tr.onclick = (event) => {
        const target = event.target.parentElement.parentElement.parentElement.querySelector('.priority__current');
        if(+target.textContent > 1) {
          target.textContent--;
        }
        getStorage();
        App.tasks[index].prior = +target.textContent;
        addStorage();
      };
    }); //end цикл
  } //end fn

  // ФУНКЦИОНАЛ СОРТИРОВКИ ПО ДАТЕ.
  const $sortPanel = document.querySelector('.sort-panel'),
        $dateNew = $sortPanel.querySelector('.triggers-data__top'),
        $dateOld = $sortPanel.querySelector('.triggers-data__bottom'),
        $prReset = $sortPanel.querySelector('.priority-sort__reset');
    function sortDate(triggers) {
      triggers.onclick = () => {
        getStorage();
      if(triggers == $dateNew) {
        App.tasks.sort((a, b) => b.date - a.date);
      } else if($dateOld || $prReset) {
        App.tasks.sort((a, b) => a.date - b.date);
      }
      addStorage();
      createTask();
    };
  }
  sortDate($dateNew);
  sortDate($dateOld);
  sortDate($prReset);
  //ФУНКЦИОНАЛ СОРТИРОВКИ ПО ПРИОРИТЕТУ
  const $prTop = $sortPanel.querySelector('.priority-sort__top'),
        $prBottom = $sortPanel.querySelector('.priority-sort__bottom');
    function sortPr(triggers) {
      triggers.onclick = () => {
        getStorage();
        if(triggers == $prTop) {
          App.tasks.sort((a, b) => b.prior - a.prior);
        } else if($prBottom) {
          App.tasks.sort((a, b) => a.prior - b.prior);
        }
        addStorage();
        createTask();
      };
    }
    sortPr($prTop);
    sortPr($prBottom);
  // ФУНКЦИОНАЛ СОРТИРОВКИ ПО ВЫПОЛНЕННОСТИ ЗАДАЧ
  const $filter = $sortPanel.querySelector('.filters-labels__icons');
  $filter.onclick = () => {
    getStorage();
    App.tasks.sort((a, b) => a.done - b.done);
    addStorage();
    createTask();
  };

  // РЕАЛИЗАЦИЯ ПОСКОВОЙ СТРОКИ
  $sortPanel.querySelector('.search__input').oninput = function() {
    let val = this.value.trim(); //trim - обрезает пробелы у вводимых данных
    let elasticItem = document.querySelectorAll('.current-task');
    if(val) {
      elasticItem.forEach((elem) => {
        if(elem.innerText.search(val) == -1) {
          elem.style.display = 'none';
        } else {
          elem.style.display = 'flex';
        }
      });
    } else {
        elasticItem.forEach((elem) => {
          elem.style.display = 'flex';
      });
    }
  };
});




