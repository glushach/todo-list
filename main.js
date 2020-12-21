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
    })
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



  //ФУНКЦИОНАЛ ПО СОЗДАНИЮ ЗАДАЧИ
  const $taskList = $todoPage.querySelector('.task-list'), //участвует в нескольких скриптах
        $taskForm = $todoPage.querySelector('#task'),
        $taskInput = $taskForm.querySelector('[type="text"]');
    let tasks = []; // c const выводит ошибку на строке 141

  // При клике на ADD получение объекта от пользователя и добавление их в массив tasks
  $taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const newTask = $taskInput.value;

    const task = {
      date: Date.now(),
      prior: 1,
      text: newTask,
      done: false
    }
    event.target.reset();
    tasks.push(task) // Объект добавляется в массив tasks

    // Превращение массива tasks в строчный и ДОБАВЛЕНИЕ его в localStorage
    localStorage.setItem('allTodo', JSON.stringify(tasks));
    createTaskList();
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
    // date, priority, descr, classActiv, parent
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
      // Если в localStorage есть ключ allTodo, то присвоить его значение массиву tasks
      if(localStorage.getItem('allTodo')) {
        tasks = JSON.parse(localStorage.getItem('allTodo'));
      }
      // Перебор массива tasks. Добавление задачи и формирование нового рендеринага
      tasks.forEach((task) => {
      new Task(
        generatedDate(task.date),
        task.prior,
        task.text
      ).render();
    });
    console.log('Generator')
  }

  // Функция-родитель для задач, под которую подвязываются функции изменения задач
  // Повторно вызывается, если пользовательножал на кнопку ADD
  function createTaskList() {

    // Без этого не работает добавление новых задач
    createTask()

    priority()

    // Без этого после добавления задачи не работает редактирование задач
    editor();
    // Без этого после первого добавления задачи не работают чекеты
    checked();
    // Без этого после добавления задачи не работает удаление задач
    deleteTask();

    console.log("ГЛАВНАЯ")
  } //end function createTaskList


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

        // Если пользователь согласился редактировать задачу
        $buttonSave.onclick = (e) => {
          e.preventDefault();
          
          // Само редактирование задачи.
          //Сначала через event.target вычисляется родитель, а в родителе ищется елемент для изменения
          const taskDescription = target.parentElement.querySelector('.task-description');
          let newTextContent = $textarea.value;
          // Дополнительная проверка, чтобы пользователь не отправил пустую форму
          // Или слишком длинные слова
          if(newTextContent) {
            let charArr = newTextContent.split(' ');
            const arr = [];
            charArr.forEach((item) => {
              item = `${item.substring(0, 15)}`;
              arr.push(item);
            });
            newTextContent = arr.join(' ');
            taskDescription.textContent = newTextContent;
            // Извлечение массива-строки из localStorage и преобразование ее в обычный массив
            tasks = JSON.parse(localStorage.getItem('allTodo'));

            // Установление нового значения объекта в массива из localStorage
            tasks[index].text = taskDescription.textContent;
            // Массив трансформирутся в строку и ОБНОВЛЯЕТСЯ localStorage
            localStorage.setItem('allTodo', JSON.stringify(tasks));


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
    console.log('editor')
  }


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

          // Само удаление задачи
          target.parentElement.remove();

          // Извлечение строки из localStorage и преобразование ее в обычный массив
          tasks = JSON.parse(localStorage.getItem('allTodo'));
          console.log(tasks)
          // Удаление значения массива из localStorage
          tasks.splice(index, 1);
          // Массив трансформирутся в строку и ОБНОВЛЯЕТСЯ localStorage
          localStorage.setItem('allTodo', JSON.stringify(tasks));


          location.reload(); //Принудительная перезагрузка страницы
        }; //end

        // Если пользователь отказался удалять задачу после показа модалки
        $buttonNo.onclick = () => {
          $confirm.classList.remove('confirm_active');
        }; //end
      }; //end
    });
    console.log('DeLETE');
  } //endDeleteTask




  // ФУНКЦИОНАЛ ПО ОТМЕТКЕ ВЫПОЛНЕННЫХ ЗАДАЧ
  // Навесить галочкам и тестовому блоку в каждой задачи обработчик события по отметке выполненности.
  function checked() {
    const $iconsChecked = $taskList.querySelectorAll('.icons-checked');
    
      $iconsChecked.forEach((btn, index) => {
      const $parent = btn.parentElement.querySelector('.task-description');
      btn.addEventListener('click', () => {
        // Извлечение массива-строки из localStorage и преобразование ее в обычный массив
        tasks = JSON.parse(localStorage.getItem('allTodo'));

        // Установление нового значения объекта в массива из localStorage в зависимости от условия
        if(tasks[index].done == false) {
          tasks[index].done = true;
        } else if(tasks[index].done == true) { //С просто else не работало в Opera
          tasks[index].done = false;
        }

        // Массив трансформирутся в строку и ОБНОВЛЯЕТСЯ localStorage
        localStorage.setItem('allTodo', JSON.stringify(tasks));
        location.reload(); //Принудительная перезагрузка страницы
      });
      if(tasks[index].done == true) {
          btn.classList.remove('icons-checked_active');
          $parent.classList.remove('task-description_active');
        }
    }); //end цикл
    console.log('ЧЭКЕТ')
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
          // Извлечение массива-строки из localStorage и преобразование ее в обычный массив
          tasks = JSON.parse(localStorage.getItem('allTodo'));
          // Установление нового значения объекта в массива из localStorage
          tasks[index].prior = +target.textContent;
          // Массив трансформирутся в строку и ОБНОВЛЯЕТСЯ localStorage
          localStorage.setItem('allTodo', JSON.stringify(tasks));
      }; //end click
    }) //end цикл
  
    // Функционал нижнего триггера
    $prBottom.forEach((tr, index) => {
      tr.onclick = (event) => {
        const target = event.target.parentElement.parentElement.parentElement.querySelector('.priority__current');
        if(+target.textContent > 0) {
          target.textContent--;
        }
        // Извлечение массива-строки из localStorage и преобразование ее в обычный массив
        tasks = JSON.parse(localStorage.getItem('allTodo'));
        // Установление нового значения объекта в массива из localStorage
        tasks[index].prior = +target.textContent;
        // Массив трансформирутся в строку и ОБНОВЛЯЕТСЯ localStorage
        localStorage.setItem('allTodo', JSON.stringify(tasks));
      };
    }) //end цикл

    console.log("PRIORITY");
  }
  // ФУНКЦИОНАЛ СОРТИРОВКИ ПО ДАТЕ.
  const $sortPanel = document.querySelector('.sort-panel'),
        $dateNew = $sortPanel.querySelector('.triggers-data__top'),
        $dateOld = $sortPanel.querySelector('.triggers-data__bottom'),
        $prReset = $sortPanel.querySelector('.priority-sort__reset');
    function sortDate(triggers) {
      triggers.onclick = () => {
      // Извлечение массива-строки из localStorage и преобразование ее в обычный массив
      tasks = JSON.parse(localStorage.getItem('allTodo'));
      // Установление нового значения объекта в массива из localStorage
      if(triggers == $dateNew) {
        tasks.sort((a, b) => b.date - a.date);
      } else if($dateOld || $prReset) {
        tasks.sort((a, b) => a.date - b.date);
      }
      // Массив трансформирутся в строку и ОБНОВЛЯЕТСЯ localStorage
      localStorage.setItem('allTodo', JSON.stringify(tasks));
      location.reload(); //Принудительная перезагрузка страницы
    }
  }
  sortDate($dateNew);
  sortDate($dateOld);
  sortDate($prReset);
  //ФУНКЦИОНАЛ СОРТИРОВКИ ПО ПРИОРИТЕТУ
  const $prTop = $sortPanel.querySelector('.priority-sort__top'),
        $prBottom = $sortPanel.querySelector('.priority-sort__bottom');
    function sortPr(triggers) {
      triggers.onclick = () => {
        // Извлечение массива-строки из localStorage и преобразование ее в обычный массив
      tasks = JSON.parse(localStorage.getItem('allTodo'));
      // Установление нового значения объекта в массива из localStorage
      if(triggers == $prTop) {
        tasks.sort((a, b) => b.prior - a.prior);
      } else if($prBottom) {
        tasks.sort((a, b) => a.prior - b.prior);
      }
      // Массив трансформирутся в строку и ОБНОВЛЯЕТСЯ localStorage
      localStorage.setItem('allTodo', JSON.stringify(tasks));
      location.reload(); //Принудительная перезагрузка страницы
      }
    }
    sortPr($prTop);
    sortPr($prBottom);
  // ФУНКЦИОНАЛ СОРТИРОВКИ ПО ВЫПОЛНЕННОСТИ ЗАДАЧ
  const $filter = $sortPanel.querySelector('.filters-labels__icons');
  $filter.onclick = () => {
    // Извлечение массива-строки из localStorage и преобразование ее в обычный массив
    tasks = JSON.parse(localStorage.getItem('allTodo'));
    tasks.sort((a, b) => a.done - b.done);
    // Массив трансформирутся в строку и ОБНОВЛЯЕТСЯ localStorage
    localStorage.setItem('allTodo', JSON.stringify(tasks));
    location.reload(); //Принудительная перезагрузка страницы
  };

  // РЕАЛИЗАЦИЯ ПОСКОВОЙ СТРОКИ
  $sortPanel.querySelector('.search__input').oninput = function() {
    let val = this.value.trim(); //trim - обрезает пробелы у вводимых данных
    let valLower = val.toLowerCase();
    console.log(valLower);
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
  }
  // Вызов главной функции
  createTaskList();
});




