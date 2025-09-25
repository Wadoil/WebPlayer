// Подключение необходимых модулей Firebase через CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getDatabase, ref, get, child, push, update } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";

// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDBFHstrlcCLb9a_x4kUGzXvx4ExnNYCr8",
    authDomain: "gamereviewer-8d8d4.firebaseapp.com",
    databaseURL: "https://gamereviewer-8d8d4-default-rtdb.firebaseio.com",
    projectId: "gamereviewer-8d8d4",
    storageBucket: "gamereviewer-8d8d4.firebasestorage.app",
    messagingSenderId: "1065714068803",
    appId: "1:1065714068803:web:5ebd0e850e4efec078d3f6",
    measurementId: "G-4XTEWL99WH"
  };
// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Получаем все статьи одним запросом
const AuthRef = ref(db, 'Authorisation');
const UsersRef = ref(db, 'Client');
const AuthSnapshot = await get(AuthRef);
const UserSnapshot = await get(UsersRef);
if (!AuthSnapshot.exists()) {
  throw new Error('No data available');
}
if (!UserSnapshot.exists()) {
  throw new Error('No data available');
}
  // Преобразуем снимок в массив
const loginsData = [];
const usersData = [];
AuthSnapshot.forEach((childSnapshot) => {
  const login = childSnapshot.val();
  
  loginsData.push({
    ID_Authorisation: login.ID_Authorisation,
    Login: login.Login,
    Password: login.Password
  });
});
UserSnapshot.forEach((childSnapshot) => {
  const user = childSnapshot.val();
  
  usersData.push({
    ID_Client: user.ID_Client,
    ID_Authorisation: user.ID_Authorisation,
    Name: user.Name,
    Surname: user.Surname,
    Nickname: user.Nickname,
    DoB: user.Dateofbirth
  });
});

var loginID, userID, password, newNick, newName, newSurename, newDob, newMail, newPass;
LoadUser();

// Функция для изменений данных пользователя
async function LoadUser() {
  try {
    // ищем элементы внутри newsBlock
    const NickElement = document.querySelector('.Nickname');
    const BigNickElement = document.querySelector('.BigNickname');
    const MailElement = document.querySelector('.Mail');
    const PasswordElement = document.querySelector('.Password');
    const NameElement = document.querySelector('.Name');
    const SurenameElement = document.querySelector('.Surname');
    const DoBElement = document.querySelector('.DoB');

    for (var i = 0; i != loginsData.length; i++){
      if (loginsData[i].Login == localStorage.userEmail){
        for (var j = 0; j != usersData.length; j++){
          if (usersData[j].auth == loginsData[i].id){
            NickElement.textContent = usersData[j].Nickname;
            BigNickElement.textContent = usersData[j].Nickname;
            MailElement.textContent = loginsData[i].Login;
            NameElement.textContent = usersData[j].Name;
            SurenameElement.textContent = usersData[j].ID_Client;
            DoBElement.textContent = usersData[j].DoB;
            PasswordElement.textContent = "*".repeat(loginsData[j].Password.length);
            password = loginsData[j].Password;
            loginID = loginsData[i].ID_Authorisation;
            userID = usersData[j].ID_Client;
        }
      }
    }
  }
  } catch (error) {
    console.error('При загрузке пользователя произошла ошибка:', error);
  }
}


async function Edit() {
  function makeEditable(element) {
    const originalText = element.textContent;
    element.innerHTML = `<input type="text" class="text-black" value="${originalText}">`;
  }
  
  function makeUnEditable(element, text) {
    element.textContent = text;
  }

  // Скрываем кнопку редактирования
  const EditElement = document.getElementById('edit');
  EditElement.hidden = true;

  // Находим элементы с данными
  const NickElement = document.querySelector('.Nickname');
  const NameElement = document.querySelector('.Name');
  const SurenameElement = document.querySelector('.Surname');
  const DoBElement = document.querySelector('.DoB');
  const MailElement = document.querySelector('.Mail');
  const PassElement = document.querySelector('.Password');

  // Делаем поля редактируемыми
  makeEditable(NickElement);
  makeEditable(NameElement);
  makeEditable(SurenameElement);
  makeEditable(DoBElement);
  makeEditable(MailElement);
  makeEditable(PassElement);

  // Показываем блоки пароля
  const NewPasswordElement = document.querySelector('.NewPasswordBlock');
  const AcceptPasswordElement = document.querySelector('.AcceptPasswordBlock');
  const InfoLabel = document.querySelector('.PasswordInfoLabel');

  if (NewPasswordElement) NewPasswordElement.classList.remove('hidden');
  if (AcceptPasswordElement) AcceptPasswordElement.classList.remove('hidden');
  if (InfoLabel) {
      InfoLabel.classList.remove('hidden');
      InfoLabel.textContent = "";
  }

  const NewPassInput = document.querySelector('.NewPassword');
  const NewPassCheckInput = document.querySelector('.AcceptPassword');

  // Создаём кнопки
  const SaveElement = document.querySelector('.Save');
  if (!SaveElement) {
    console.error('Элемент .Save не найден!');
    return;
  }

  // Очищаем контейнер от старых кнопок
  SaveElement.innerHTML = '';

  // Создаем кнопку Accept
  const SaveButton = document.createElement('button');
  SaveButton.type = 'button'; // Важно указать type, чтобы форма не отправлялась
  SaveButton.className = 'SaveButton w-full text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-blue-800';
  SaveButton.textContent = 'Accept';

  // Создаем кнопку Cancel
  const CancelButton = document.createElement('button');
  CancelButton.type = 'button';
  CancelButton.className = 'CancelButton w-full text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-blue-800';
  CancelButton.textContent = 'Cancel';

  // Добавляем кнопки в контейнер
  SaveElement.appendChild(SaveButton);
  SaveElement.appendChild(CancelButton);

  function cleanup() {
    SaveElement.removeChild(SaveButton);
    SaveElement.removeChild(CancelButton);
    EditElement.hidden = false;
  }

  SaveButton.onclick = function() {
    newNick = NickElement.querySelector('input')?.value;
    newName = NameElement.querySelector('input')?.value;
    newSurename = SurenameElement.querySelector('input')?.value;
    newDob = DoBElement.querySelector('input')?.value;
    newMail = MailElement.querySelector('input')?.value;
    const oldPass = PassElement.querySelector('input')?.value;
    newPass = NewPassInput?.value;
    const newPassCheck = NewPassCheckInput?.value;

    // Проверка пароля
    const hiddenPass = "*".repeat(oldPass.length)
    if (password != oldPass && oldPass != hiddenPass) {
      if (InfoLabel) InfoLabel.textContent = "Old password doesn't match";
      return;
    }
    
    if (newPass != newPassCheck) {
      if (InfoLabel) InfoLabel.textContent = "Passwords don't match";
      return;
    }

    // Сохраняем изменения
    makeUnEditable(NickElement, newNick);
    makeUnEditable(NameElement, newName);
    makeUnEditable(SurenameElement, newSurename);
    makeUnEditable(DoBElement, newDob);
    makeUnEditable(MailElement, newMail);
    makeUnEditable(PassElement, "*".repeat(newPass?.length || oldPass.length));

    // Скрываем поля пароля
    NewPasswordElement.classList.add('hidden');
    AcceptPasswordElement.classList.add('hidden');
    InfoLabel.classList.add('hidden');

    cleanup();
    
    SendClientData();
    if (oldPass != hiddenPass){
      SendAuthData();
    }
  };

  CancelButton.onclick = function() {
    // Восстанавливаем оригинальные значения
    for (let i = 0; i < loginsData.length; i++) {
      if (loginsData[i].Login == localStorage.userEmail) {
        for (let j = 0; j < usersData.length; j++) {
          if (usersData[j].auth == loginsData[i].id) {
            makeUnEditable(NickElement, usersData[j].Nickname);
            makeUnEditable(MailElement, loginsData[i].Login);
            makeUnEditable(NameElement, usersData[j].Name);
            makeUnEditable(SurenameElement, usersData[j].Surname);
            makeUnEditable(DoBElement, usersData[j].DoB);
            makeUnEditable(PassElement, "*".repeat(loginsData[i].Password.length));
            break;
          }
        }
        break;
      }
    }

    // Скрываем поля пароля
    NewPasswordElement.classList.add('hidden');
    AcceptPasswordElement.classList.add('hidden');
    InfoLabel.classList.add('hidden');

    cleanup();
  };
}
async function SendClientData() {
  const db = getDatabase();

  const clientData = {
    ID_Client: userID,
    ID_Authorisation: loginID,
    Name: newName,
    Surname: newSurename,
    Nickname: newNick,
    DoB: newDob
  };

  // Создаём объект для обновления
  const updates = {};
  updates[`/Client/${userID}`] = clientData; // Используем userID как ключ

  try {
    await update(ref(db), updates);
    return true;
  } catch (error) {
    throw error;
  }
}
async function SendAuthData() {
  const db = getDatabase();

  const AuthData = {
    ID_Authorisation: loginID,
    Login: newMail,
    Password: newPass
  };

  // Создаём объект для обновления
  const updates = {};
  updates[`/Authorisation/${loginID}`] = AuthData; // Используем userID как ключ

  try {
    await update(ref(db), updates);
    return true;
  } catch (error) {
    throw error;
  }
}

// Добавление слушателя события click к кнопке входа
document.getElementById('edit').addEventListener('click', Edit);