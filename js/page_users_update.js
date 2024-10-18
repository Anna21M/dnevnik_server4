// код: изменить пользователя

const pole_login = document.getElementById("login") // Элемент Html: логин
const pole_pass = document.getElementById("pass")   // Элемент Html: пароль
const pole_fio = document.getElementById("fio")     // Элемент Html: ФИО
const pole_type = document.getElementById("type")   // Элемент Html: тип пользователя
const but_update = document.getElementById("but_update")    // Элемент Html: кнопка "Обновить"

// Заполняем поля данными редактируемого пользователя (сервре запомнил)
// Запрос данных изменяемого пользователя у сервера 
async function getUserMemory() {
    const res = await fetch("/user_get_memory", { 
        method: "POST"    
      })          
      const result = await res.json()   // ответ от пользователя
      pole_login.value = result.login   // заполняем поле "логин"
      pole_pass.value = result.pass     // заполняем поле "пароль"
      pole_fio.value = result.fio       // заполняем поле "ФИО"
      pole_type.value = result.type     // заполняем поле "тип"
}
    
// выполняем запрос
getUserMemory()

// Нажата кнопка "Обновить"
but_update.addEventListener('click', async ()=>{
    if (pole_login.value == "") {
        alert("Введите логин!")
        return
    }
    if (pole_pass.value == "") {
        alert("Введите пароль!")
        return
    }
    if (fio.value == "") {
        alert("Введите ФИО!")
        return
    }
    // Проверка на наличие пробелов и цифр в ФИО
    const fioPattern = /^[А-Яа-яЁё\s]+$/; // Разрешает только буквы и пробелы
    if (!fioPattern.test(pole_fio.value.trim())) {
        alert("ФИО должно содержать только буквы без цифр и пробелов!");
        return;
    }

    // Данные введены -> отправляем на сервер
    const res = await fetch("/user_db_update", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            login: pole_login.value,    // новый логин
            password: pole_pass.value,  // новый пароль
            fio: pole_fio.value,        // новое фИО
            type: pole_type.value       // новый тип
        }) 
      })          
      const result = await res.json()     
      if (result.goodUpdated == true) {
        // Успешно обновили в базе                
        // Возвращаемся к списку пользователей
        document.location.href = "/page_users"
      } 

})

