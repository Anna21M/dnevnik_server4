// код: добавить польователя

const pole_login = document.getElementById("login") // Элемент Html: логин
const pole_pass = document.getElementById("pass")   // Элемент Html: пароль
const pole_fio = document.getElementById("fio") // Элемент Html: ФИО
const pole_type = document.getElementById("type")   // Элемент Html: тип пользователя
const but_add = document.getElementById("but_add")  // Элемент Html: кнопка "Добавить"

// Нажата кнопка "Добавить"
but_add.addEventListener('click', async ()=>{
    // 18.10 - новое: .trim(
    if (pole_login.value.trim() == "") {
        alert("Введите логин!")
        return
    }
    if (pole_pass.value.trim() == "") {
        alert("Введите пароль!")
        return
    }
    if (fio.value.trim() == "") {
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
    const res = await fetch("/user_db_add", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            login: pole_login.value,    // лониг 
            password: pole_pass.value,  // пароль
            fio: pole_fio.value,        // ФИО         
            type: pole_type.value       // тип пользователя
        }) 
      })          
      const result = await res.json()     
      if (result.goodAdded == true) {
        // Успешно добавили в базу                
        // Возвращаемся к списку пользователей
        document.location.href = "/page_users"
      } 

})

