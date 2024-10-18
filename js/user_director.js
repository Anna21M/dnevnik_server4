// код: страница директора

const fio = document.getElementById("fio")  // Элемент Html: надпись для имени пользователя (ФИО)
const but_logout = document.getElementById("but_logout") // Элемент Html: кнопка "Выйти"

// Запрос имени пользователя у сервера
async function getUserName() {
const res = await fetch("/get_user", { 
    method: "POST"    
  })          
  const result = await res.json() // ответ от сервера
  fio.innerHTML = result.user_name  // заполняем поле "ФИО"
}

// выполяняем запрос
getUserName()

// Обработка нажатия кнопки "Выйти"
but_logout.addEventListener('click', async ()=>{
    const res = await fetch("/logout", { 
        method: "POST"    
      })          
      const result = await res.json()
      if (result.logout) {
        // Успешно вышли из логина -> Обновляем страницу
        document.location.href = "/"
      }
})