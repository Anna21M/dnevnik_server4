// код: страница входа

const mess = document.getElementById("mess")            // Элемент Html: текст сообщения (по умолчанию - пустой)
const but_login = document.getElementById("but_login")  // Элемент Html: кнопка "Войти"
const pole_login = document.getElementById("login")     // Элемент Html: поле ввода логина
const pole_pass = document.getElementById("pass")       // Элемент Html: поле ввода пароля

// Нажатия кнопка "Войти"
but_login.addEventListener('click', async ()=>{
    if (pole_login.value == "") {
        alert("Введите логин!")
        return
    }
    if (pole_pass.value == "") {
        alert("Введите пароль!")
        return
    }
    // Данные введены -> отправляем на сервер
    const res = await fetch("/login_data_from_user", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({login: pole_login.value, password: pole_pass.value}) 
      })          
      const result = await res.json()     // Ответ от сервера
      if (result.isUser == true) {
        // Есть такой пользователь
        mess.innerHTML =""
        pole_login.value = ""
        pole_pass.value = ""
        // Обновляем страницу (т.к. пользователь уже защёл, то при обновлении отобразиться его страница)
        document.location.href = "/"
      } else {        
        mess.innerHTML ="Нет такого пользователя!"
      }
})