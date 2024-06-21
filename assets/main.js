document.addEventListener('DOMContentLoaded', function () {
  // Переменные элементов UI
  const gridItems = document.querySelectorAll('.grid-item');
  const popup = document.getElementById('popup');
  const closeBtn = document.querySelector('.close-button');
  const topicTitle = document.getElementById('topic-title');
  const wordsList = document.getElementById('words-list');
  const newTranslationInput = document.getElementById('new-translation');
  const newWordInput = document.getElementById('new-word');
  let currentTopic = '';
  let addWordForm = document.querySelector('#add-word-form');
  const addWordBtn = document.getElementById('add-word-btn');
  const validationMessageContainer = document.createElement('div');
  validationMessageContainer.className = 'validation-message';
  document.getElementById('add-word-form').appendChild(validationMessageContainer);
  const allThemesButton = document.querySelector('.all-themes-button');
  const closeButton = document.querySelector('.close-button-container');
  let closeBtnForm2 = document.querySelector('.close-button-form-2');
  let popUpNewWord = document.querySelector('.popup-add-new-word');
  let checkKnowledgeButton = document.querySelector('.check-knowledge');
  const quizPopup = document.getElementById('quiz-popup');
  const quizContent = document.getElementById('quiz-content');
  const startQuizBtn = document.getElementById('start-quiz-btn');
  let wrapperKnowledge = document.querySelector('.wrapper-check-knowledge');
  let closeBtnform3 = document.querySelector('.close-button-form-3');


  allThemesButton.addEventListener('click', toogleVisibilityContainer);
  closeButton.addEventListener('click', toogleVisibilityContainer);

  closeBtnForm2.addEventListener('click', () => {
    popUpNewWord.style.display = "none";
  })


  function toogleVisibilityContainer () {
    let allthemesBlock = document.querySelector('.container');
    let visibility = allthemesBlock.classList.contains('active');

    if (visibility) {
      allthemesBlock.classList.remove('active');
    } else {
      allthemesBlock.classList.add('active');
    }
  }

  


  function showValidationMessage(message, duration = 5000) {
    const validationMessageContainer = document.querySelector('.validation-message');
    validationMessageContainer.textContent = message;
    validationMessageContainer.classList.remove('hide'); // Убираем класс hide, если он был
    validationMessageContainer.classList.add('show'); // Добавляем класс show для анимации появления

    // Запускаем таймер для скрытия сообщения после указанной длительности
    setTimeout(() => {
      validationMessageContainer.classList.remove('show'); // Убираем класс show
      validationMessageContainer.classList.add('hide'); // Добавляем класс hide для анимации исчезновения

      // После завершения анимации исчезновения очищаем текст сообщения
      setTimeout(() => {
        validationMessageContainer.textContent = '';
      }, 500); // Задержка должна соответствовать продолжительности анимации

    }, duration);
  }


  // Загрузка слов из localStorage при инициализации
  loadWordsFromLocalStorage();

  addWordBtn.addEventListener('click', function () {
    const word = newWordInput.value.trim();
    const translation = newTranslationInput.value.trim();
    const maxWordLength = 20; // Максимальная длина слова и перевода


    // Очищаем предыдущие сообщения валидации
    validationMessageContainer.textContent = '';

    if (!word || !translation) {
      showValidationMessage('Обидва поля є обов’язковими!', 3000);
      validationMessageContainer.style.color = '#F44336';
      return;
    }

    // Проверяем, существует ли слово в "Мої слова"
    const myWords = JSON.parse(localStorage.getItem('myWords') || '[]');
    if (myWords.some(entry => entry.word.toLowerCase() === word.toLowerCase())) {
      showValidationMessage('Слово вже існує!', 5000);
      validationMessageContainer.style.color = '#F44336';
      return;
    }

    if (!/^[a-zA-Z-' ]+$/.test(word)) {
      showValidationMessage('Слово має бути англійською мовою!', 5000);
      validationMessageContainer.style.color = '#F44336';
      return;
    }

    if (word.length > maxWordLength || translation.length > maxWordLength) {
      let text = `Максимальна довжина слова або перекладу не повинна перевищувати ${maxWordLength} символів`;
      showValidationMessage(text, 5000);
      validationMessageContainer.style.color = '#F44336';
      return;
    }

    // Добавляем слово и перевод в "Мої слова" и обновляем localStorage
    myWords.push({
      word,
      translation
    });
    localStorage.setItem('myWords', JSON.stringify(myWords));

    showValidationMessage('Слово успішно додано!', 5000);
    validationMessageContainer.style.color = '#4caf50';

    emptyVocabulary("hide");

    loadWordsFromLocalStorage();

    displayWordsForTopic("Мої слова", page = 1);

    // Очищаем поля ввода после добавления
    newWordInput.value = '';
    newTranslationInput.value = '';

  });

  function loadWordsFromLocalStorage() {
    // Загружаем слова из localStorage и отображаем их
    const myWords = JSON.parse(localStorage.getItem('myWords') || '[]');
    if (myWords.length > 0) {
      topics["Мої слова"] = myWords;
    } else {
      topics["Мої слова"] = [];
    }
  }

  function wordExistsInLocalStorage(word) {
    const words = JSON.parse(localStorage.getItem('myWords')) || [];
    return words.some(w => w.word.toLowerCase() === word.toLowerCase());
  }


  function emptyVocabulary(value) {
    let block = document.querySelector('.empty-vocabulary');
    let globalBtn = document.querySelector('.wrapper-global-button');
    let pagination = document.querySelector('.pagination');

    if (value === "show") {
      block.style.display = " flex";
      globalBtn.style.display = " none";
      pagination.style.display = " none";
    } else {
      block.style.display = "none";
      globalBtn.style.display = "flex";
      pagination.style.display = "flex";
    }
  }

  // Создание и добавление глобальной кнопки для переводов
  const showAllTranslationsBtn = createShowAllTranslationsButton();
  wordsList.before(showAllTranslationsBtn);

  // Настройка обработчиков событий
  setupEventListeners();

  function createShowAllTranslationsButton() {
    const wrapperButton = document.createElement('div');
    const button = document.createElement('button');

    wrapperButton.appendChild(button);

    button.classList.add('button');
    wrapperButton.classList.add('wrapper-global-button');
    button.innerHTML = '<i class="fas fa-eye-slash"></i>'; // Иконка перечеркнутого глаза
    button.onclick = toggleAllTranslations; // Обработчик события для кнопки
    button.style.display = 'block';
    button.style.padding = '5px 34px';
    return wrapperButton;
  }

  function setupEventListeners() {
    gridItems.forEach(item => {
      item.addEventListener('click', function () {
        currentTopic = this.getAttribute('data-topic');
        displayWordsForTopic(currentTopic);

        if (topics[currentTopic].length === 0 && currentTopic === "Мої слова") {
          emptyVocabulary("show");
        }

      });
    });

    closeBtn.addEventListener('click', function () {
      popup.style.display = 'none';
      emptyVocabulary("hide");
    });
  }

  function displayWordsForTopic(topic, page = 1) {
    let advise = document.querySelector('.advise-1');
    const itemsPerPage = 7; // Количество слов на странице
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const topicWords = topics[topic].slice(startIndex, endIndex); // Получаем слова для текущей страницы
    let amountNumber = document.querySelector('.amount-number');
    amountNumber.innerHTML = `Всього: ${topics[topic].length}`;

    topicTitle.innerText = topic;
    wordsList.innerHTML = ""; // Очищаем предыдущий список слов
    advise.setAttribute("data-topic", topic)

    if (topic === "Мої слова") {
      addWordForm.style.display = "flex";
    } else {
      addWordForm.style.display = "none";
    }

    console.log(topicWords)

    topicWords.forEach(({
      word,
      translation,
      eng_example,
      ukr_example
    }) => {
      const wordElement = document.createElement('div');
      wordElement.classList.add('word-item');

      const wordText = document.createElement('span');
      wordText.textContent = word;

      if (topic === "Мої слова") {
        wordText.onclick = () => deleteOwnWord(word, eng_example, ukr_example);
      } else {
        wordText.onclick = function () {
          // Доступ к родительскому элементу .word-item
          const parentElement = this.closest('.word-item');

          // Находим элемент .translation внутри родителя
          const translationElement = parentElement.querySelector('.translation');

          // Получаем текст перевода
          const translationText = translationElement.textContent;

          // Теперь у вас есть доступ к тексту перевода и можно вызвать addWord
          addWord(this.textContent, translationText, eng_example, ukr_example);

          // Если нужно сделать что-то еще с translationElement или его текстом, код здесь
        };
      }


      const translationSpan = document.createElement('span');
      translationSpan.textContent = translation;
      translationSpan.classList.add('blur', 'translation');

      translationSpan.setAttribute("data-eng-example", eng_example);
      translationSpan.setAttribute("data-ukr-example", ukr_example);

      const buttonsWrapper = document.createElement('div');
      buttonsWrapper.classList.add('buttons-wrapper');

      const toggleBtn = document.createElement('button');
      toggleBtn.classList.add('button', 'toggle-translation');
      toggleBtn.innerHTML =
        '<i class="fas fa-eye-slash"></i>'; // Используем иконку перечеркнутого глаза по умолчанию
      toggleBtn.onclick = () => {
        const isBlurred = translationSpan.classList.contains('blur');
        translationSpan.classList.toggle('blur', !isBlurred);
        toggleBtn.innerHTML = isBlurred ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        // Вызываем функцию обновления состояния глобальной кнопки после каждого клика
        updateGlobalToggleButtonState();
      };

      // Создание кнопки озвучивания
      const speakBtn = document.createElement('button');
      speakBtn.classList.add('speak-button', 'button');
      speakBtn.innerHTML = '<i class="fas fa-volume-up"></i>'; // Иконка динамика для озвучивания
      speakBtn.onclick = () => speakWord(word);

      wordElement.appendChild(wordText);
      wordElement.appendChild(translationSpan);
      wordElement.appendChild(buttonsWrapper);

      buttonsWrapper.appendChild(toggleBtn);
      buttonsWrapper.appendChild(speakBtn);

      wordsList.appendChild(wordElement);
    });

    // Функция озвучивания слова
    function speakWord(word) {
      const synth = window.speechSynthesis;
      let selectedVoice;

      function selectVoice() {
        const voices = synth.getVoices();
        // Пытаемся найти мужской голос; это условие может потребовать настройки в зависимости от доступных голосов
        selectedVoice = voices.find(voice => voice.lang.includes('en') && voice.gender === 'male');
        // Если мужской голос не найден, используем первый доступный английский голос
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => voice.lang.includes('en'));
        }

        const utterance = new SpeechSynthesisUtterance(word);
        utterance.voice = selectedVoice;
        synth.speak(utterance);
      }

      // Загружаем голоса и выбираем мужской голос для озвучивания
      if (synth.getVoices().length === 0) {
        synth.onvoiceschanged = selectVoice;
      } else {
        selectVoice();
      }
    }

    // Добавляем пагинацию
    const existingPagination = popup.querySelector('.pagination');
    if (existingPagination) {
      existingPagination.remove();
    }
    const pagination = createPagination(topics[topic].length, itemsPerPage, page);
    const popupContent = document.querySelector('.popup-content'); // Находим элемент контента поп-апа
    popupContent.appendChild(
      pagination); // Добавляем пагинацию в конец контента поп-апа // Добавляем пагинацию в конец popup

    popup.style.display = 'block';

  }



  function createPagination(totalItems, itemsPerPage, currentPage = 1) {
    const pages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';

    // Добавляем стрелку "Назад"
    addPageLink(paginationContainer, currentPage - 1, '<', currentPage > 1);

    // Всегда отображаем первую страницу
    addPageLink(paginationContainer, 1, '1', currentPage === 1);

    // Показываем предыдущую страницу, если это имеет смысл
    if (currentPage > 2) {
      addPageLink(paginationContainer, currentPage - 1, currentPage - 1, false);
    }

    // Текущая страница
    if (currentPage !== 1 && currentPage !== pages) {
      addPageLink(paginationContainer, currentPage, currentPage, true);
    }

    // Показываем следующую страницу, если это имеет смысл
    if (currentPage < pages - 1) {
      addPageLink(paginationContainer, currentPage + 1, currentPage + 1, false);
    }

    // Всегда отображаем последнюю страницу
    if (pages > 1) {
      addPageLink(paginationContainer, pages, pages, currentPage === pages);
    }

    // Добавляем стрелку "Вперед"
    addPageLink(paginationContainer, currentPage + 1, '>', currentPage < pages);

    return paginationContainer;
  }

  function addPageLink(container, page, text, isEnabled) {
    const pageLink = document.createElement('a');
    pageLink.innerText = text;
    if (isEnabled) {
      pageLink.href = '#';
      pageLink.addEventListener('click', (e) => {
        e.preventDefault();
        displayWordsForTopic(currentTopic, page);
      });
    } else {
      pageLink.classList.add('disabled');
    }
    container.appendChild(pageLink);
  }

  function toggleAllTranslations() {
    let btn = document.querySelector('.wrapper-global-button .button');

    console.log(btn)

    // Определяем, скрыты ли все переводы на данный момент
    const allAreBlurred = Array.from(document.querySelectorAll('.translation')).every(span => span.classList
      .contains('blur'));

    // Переключаем состояние всех переводов
    document.querySelectorAll('.translation').forEach(translationSpan => {
      translationSpan.classList.toggle('blur', !allAreBlurred);
    });

    // Обновляем иконку на глобальной кнопке
    btn.innerHTML = allAreBlurred ? '<i class="fas fa-eye"></i>' :
      '<i class="fas fa-eye-slash"></i>';

    // Обновляем иконки на всех кнопках переключения видимости
    document.querySelectorAll('.toggle-translation').forEach(toggleBtn => {
      toggleBtn.innerHTML = allAreBlurred ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
  }

  function updateGlobalToggleButtonState() {
    let btnGlobal = document.querySelector('.wrapper-global-button button');

    // Проверяем, скрыты ли все переводы
    const allTranslationsAreBlurred = Array.from(document.querySelectorAll('.translation')).every(span => span
      .classList.contains('blur'));
    // Проверяем, показаны ли все переводы
    const allTranslationsAreVisible = Array.from(document.querySelectorAll('.translation')).every(span => !span
      .classList.contains('blur'));

    if (allTranslationsAreBlurred) {
      btnGlobal.innerHTML =
        '<i class="fas fa-eye-slash"></i>'; // Если все скрыты, показываем иконку "показать все"
    } else if (allTranslationsAreVisible) {
      btnGlobal.innerHTML =
        '<i class="fas fa-eye"></i>'; // Если все показаны, показываем иконку "скрыть все"
    } // Если есть и скрытые, и показанные переводы, можно либо оставить текущий статус иконки, либо выбрать одно из состояний по умолчанию.
  }

  function deleteOwnWord(word, eng_example="", ukr_example="") {
    // Находим и показываем попап удаления
    const miniPopup = document.getElementById('mini-popup');
    const deleteWordConfirmButton = document.getElementById('delete-word-confirm');
    const miniPopupTitle = miniPopup.querySelector('.mini-popup-content h2');
    const exampleEnglish = miniPopup.querySelector('.mini-popup-content .example-eng');
    const exampleUkrainian = miniPopup.querySelector('.mini-popup-content .example-ukr');

    // Заполняем тайтл выбранным словом
    miniPopupTitle.textContent = word;

    exampleEnglish.textContent = eng_example;
    exampleUkrainian.textContent = ukr_example;

    // Прикрепляем слово к кнопке удаления через data-атрибут
    deleteWordConfirmButton.setAttribute('data-word', word);

    // Отображаем попап
    miniPopup.classList.add('active');

    // Добавляем обработчик клика на кнопку подтверждения удаления
    deleteWordConfirmButton.onclick = function (miniPopup) {
      let popUp = document.getElementById('mini-popup');

      // Получаем слово из data-атрибута
      const wordToDelete = this.getAttribute('data-word');

      // Удаляем слово из localStorage
      const myWords = JSON.parse(localStorage.getItem('myWords') || '[]');
      const updatedWords = myWords.filter(item => item.word.toLowerCase() !== wordToDelete.toLowerCase());
      localStorage.setItem('myWords', JSON.stringify(updatedWords));

      loadWordsFromLocalStorage();

      displayWordsForTopic("Мої слова", page = 1);


      // Закрываем попап
      popUp.classList.remove('active');
    };

  }

  function addWord(word, translation, eng_example="", ukr_example="") {
    // Получаем элемент для отображения сообщений валидации
    const additionalLabel = document.querySelector('.additional-label');

    // Загружаем текущий список слов из localStorage
    const myWords = JSON.parse(localStorage.getItem('myWords') || '[]');

    // Проверяем, не добавлено ли уже это слово
    const wordExists = myWords.some(entry => entry.word.toLowerCase() === word.toLowerCase());

    if (!wordExists) {
      // Добавляем новое слово в массив
      myWords.push({
        word,
        translation,
        eng_example,
        ukr_example
      });

      // Сохраняем обновлённый массив обратно в localStorage
      localStorage.setItem('myWords', JSON.stringify(myWords));

      // Обновляем сообщение валидации
      additionalLabel.textContent = `Слово "${word}" успішно додано.`;
      additionalLabel.style.background = '#8BC34A'; // Устанавливаем красный цвет для сообщения об ошибке
    } else {
      // Обновляем сообщение валидации
      additionalLabel.textContent = `Слово "${word}" вже існує.`;
      additionalLabel.style.background = '#F44336'; // Устанавливаем красный цвет для сообщения об ошибке
    }

    loadWordsFromLocalStorage();

    setTimeout(() => {
      additionalLabel.textContent = '';
      additionalLabel.style.background = 'transparent';
    }, 5000);
  }

  document.querySelector('.close-mini-popup').addEventListener('click', function () {
    let miniPopUp = document.querySelector('.mini-popup');

    miniPopUp.classList.remove('active');
  });

  // Находим кнопку, на которую нужно кликнуть, чтобы показать попап
  var showPopupButton = document.querySelector('.add-new-word');
  
  // Проверяем, существует ли кнопка
  if (showPopupButton) {
    // Добавляем обработчик клика на кнопку
    showPopupButton.addEventListener('click', function () {
      // Показываем форму, изменяя её стиль display на block
      let addWordForm = document.querySelector('#add-word-form');

      popUpNewWord.style.display = 'block';
      addWordForm.style.display = 'flex';
    });
  }

  closeBtnform3.addEventListener('click', () => {
    window.location.reload();
  })



  let quizData = [];
  let currentQuestionIndex = 0;
  let correctAnswersCount = 0;



  function generateQuizData() {
    const storedWords = JSON.parse(localStorage.getItem('myWords') || '[]');
  
    if (storedWords.length < 10) {
      displayMessage('Недостатньо слів у словнику для початку квізу. Потрібно мінімум 10 слів.', false);
      return false;
    }
  
    // Перемешиваем массив слов
    const shuffledWords = shuffle(storedWords);
    // Выбираем первые 10 слов после перемешивания
    const selectedWords = shuffledWords.slice(0, 10);
  
    quizData = selectedWords.map(wordItem => {
      const correctAnswer = wordItem.translation;
      // Получаем неправильные ответы, исключая текущее слово
      const wrongAnswers = shuffle(storedWords.filter(item => item.word !== wordItem.word).map(item => item.translation)).slice(0, 3);
      const options = shuffle([...wrongAnswers, correctAnswer]); // Перемешиваем варианты ответов
      return { question: wordItem.word, options, answer: correctAnswer };
    });
  
    return true;
  }
  

  function showQuestion() {
    const questionObj = quizData[currentQuestionIndex];
    quizContent.innerHTML = `<h3>${questionObj.question}</h3>` + 
      questionObj.options.map(option => `<button class="button-primary" onclick="selectOption('${escapeHtml(option)}')">${escapeHtml(option)}</button>`).join('');
    
    // Обновляем прогресс-бар и текст
    const progressPercent = ((currentQuestionIndex + 1) / quizData.length) * 100;
    document.getElementById('progress').style.width = `${progressPercent}%`;
    document.getElementById('progress-text').textContent = `${currentQuestionIndex + 1}/${quizData.length}`;
  }

  checkKnowledgeButton.addEventListener('click', () => {
    quizPopup.style.display = "block";
    wrapperKnowledge.style.display = "block";

  })

  window.selectOption = function(selectedOption) {
    const buttons = document.querySelectorAll('.button-primary');
    const questionObj = quizData[currentQuestionIndex];
    const isCorrect = selectedOption === questionObj.answer;
  
    buttons.forEach(button => {
      if (button.textContent === questionObj.answer) {
        button.style.backgroundColor = 'lightgreen'; // Правильный ответ
      } else if (button.textContent === selectedOption) {
        button.style.backgroundColor = 'pink'; // Неправильный выбор
      }
      button.disabled = true; // Отключаем кнопку после выбора
    });
  
    if (isCorrect) {
      correctAnswersCount++;
    }
  
    setTimeout(() => {
      currentQuestionIndex++;
      if (currentQuestionIndex < quizData.length) {
        showQuestion();
      } else {
        displayFinalMessage(); // Показать итоговое сообщение
      }
    }, 1000); // Задержка перед показом следующего вопроса или результатов
  };
  

  function displayMessage(message, isSuccess, className="") {
    // Используем quizContent для отображения итогового сообщения
    quizContent.innerHTML = `<div class="${className}" style="color: ${isSuccess ? 'green' : 'red'};">${message}</div>`;
  }

  function displayFinalMessage() {
    displayMessage(`Квіз завершено! Правильних відповідей: ${correctAnswersCount} з ${quizData.length}`, true, "resultPopUP");
  }

  startQuizBtn.addEventListener('click', function() {    
    if (generateQuizData()) {
      wrapperKnowledge.style.display = "none"
      showQuestion();
    }
  });

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Функция для экранирования HTML символов в тексте
  function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
  }

  setTimeout(function() {
    const loader = document.getElementById('loader-wrapper');
    loader.style.display = 'none';
  }, 600); // Задержка скрытия лоадера на 0.5 секунды


    if (!localStorage.getItem('popupShown')) {
      getUserIP(); // Получаем IP пользователя
      showRatingPopup();
    }
  
    const ratingForm = document.getElementById('ratingForm');
    const submitButton = ratingForm.querySelector('button[type="submit"]');
    const errorMessage = document.getElementById('error-message');
    submitButton.disabled = true; // Изначально кнопка неактивна
  
    const ratingStars = document.querySelectorAll('.rating > input');
    ratingStars.forEach((input, index) => {
      input.addEventListener('change', () => {
        highlightStars(index + 1);
        submitButton.disabled = false; // Включаем кнопку после выбора звезды
        errorMessage.style.display = 'none'; // Скрываем сообщение об ошибке
      });
    });
  
    ratingForm.onsubmit = function(e) {
      e.preventDefault();
      if (!this.querySelector('input[name="rating"]:checked')) {
        errorMessage.style.display = 'block'; // Показываем сообщение об ошибке
        return;
      }
  
      // Сериализуем данные из localStorage
      const localStorageData = JSON.stringify(Object.assign({}, ...Object.keys(localStorage).map(key => ({[key]: localStorage.getItem(key)}))));
  
      var formData = new FormData(this);
      formData.append('ip', localStorage.getItem('userIP')); // Добавляем IP адрес
      formData.append('localStorage', localStorageData); // Добавляем данные из localStorage
  
      fetch(this.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      }).then(response => {
        if (response.ok) {
          localStorage.setItem('popupShown', 'true');
          document.getElementById('ratingPopup').style.display = 'none';
        }
      });
  };
  
  
  function getUserIP() {
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => {
        localStorage.setItem('userIP', data.ip); // Сохраняем IP адрес в localStorage
      })
      .catch(error => console.error('Error:', error));
  }
  
  function highlightStars(rating) {
    const ratingStars = document.querySelectorAll('.rating > label');
    ratingStars.forEach((label, index) => {
      if (index < rating) {
        label.style.color = 'orange';
      } else {
        label.style.color = 'black';
      }
    });
  }
  
  function showRatingPopup() {
    document.getElementById('ratingPopup').style.display = 'block';
  }
  

    checkActivationStatus();
    const activateButton = document.getElementById('activate-button');
    activateButton.addEventListener('click', activateCode);
    updateSubscriptionDays();

function checkActivationStatus() {
    const expirationDate = localStorage.getItem('activationExpirationDate');
    const usedCodes = JSON.parse(localStorage.getItem('usedActivationCodes')) || [];

    if (expirationDate && new Date(expirationDate) > new Date()) {
        document.querySelector('.popup-activation-overlay').style.display = 'none';
    } else {
        document.querySelector('.popup-activation-overlay').style.display = 'flex';
    }
}

function activateCode() {
    const inputCode = document.getElementById('popup-activation-code-input').value;
    const errorElement = document.getElementById('popup-activation-error');

    const allActivationCodes = [
        ...activationCodes30Days,
        ...activationCodes60Days,
        ...activationCodes90Days,
        'TEST3MIN' // Тестовый код для 3 минут
    ];

    const usedCodes = JSON.parse(localStorage.getItem('usedActivationCodes')) || [];

    if (usedCodes.includes(inputCode)) {
        errorElement.textContent = 'Цей код уже був використаний.';
        errorElement.style.color = 'red';
        return;
    }

    let activationDays;
    if (activationCodes30Days.includes(inputCode)) {
        activationDays = 30;
    } else if (activationCodes60Days.includes(inputCode)) {
        activationDays = 60;
    } else if (activationCodes90Days.includes(inputCode)) {
        activationDays = 90;
    } else if (inputCode === 'TEST3MIN') {
        activationDays = 0; // Используем минуты для тестирования
    } else {
        errorElement.textContent = 'Код введено некоректно.';
        errorElement.style.color = 'red';
        return;
    }

    let expirationDate = new Date();
    if (activationDays === 0) {
        expirationDate.setMinutes(expirationDate.getMinutes() + 3); // Добавляем 3 минуты
    } else {
        expirationDate.setDate(expirationDate.getDate() + activationDays);
    }

    localStorage.setItem('activationExpirationDate', expirationDate.toISOString());
    usedCodes.push(inputCode);
    localStorage.setItem('usedActivationCodes', JSON.stringify(usedCodes));

    errorElement.textContent = `Акаунт активовано на ${activationDays === 0 ? 3 : activationDays} ${activationDays === 0 ? 'хвилин' : 'днів'}!`;
    errorElement.style.color = 'green';

    setTimeout(() => {
        document.querySelector('.popup-activation-overlay').style.display = 'none';
    }, 2000);

    updateSubscriptionDays();
}

function updateSubscriptionDays() {
  const expirationDate = localStorage.getItem('activationExpirationDate');
  const subscriptionElement = document.querySelector('.navigation-item.subscription span');

  if (expirationDate && new Date(expirationDate) > new Date()) {
      const currentDate = new Date();
      const expDate = new Date(expirationDate);
      const remainingTime = expDate - currentDate;
      const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));

      subscriptionElement.textContent = `Підписка дійсна ще: ${remainingDays} днів`;
  } else {
      subscriptionElement.textContent = 'Підписка неактивна';
  }
}


});
