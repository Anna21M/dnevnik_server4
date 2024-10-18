// код:  страница учителя

const fio = document.getElementById("fio")  // Элемент Html: надпись для имени пользователя (ФИО)
const label_class = document.getElementById("label_class") // Элемент Html: Класс учителя
const but_logout = document.getElementById("but_logout")    // Элемент Html: кнопка "выйти"

// id учителя
let id_teacher = -1
// id класса учителя
let id_class = -1
// массив учеников класса учителя
//let mas_ids_students = []

// Запрос имени пользователя у сервера 
async function getUserName() {
const res = await fetch("/get_user", { 
    method: "POST"    
  })          
  const result = await res.json()   // ответ от сервера
  id_teacher = result.id  // id учителя для нахождения его класса
  fio.innerHTML = result.user_name  // Заполняем поле "ФИО"
}

// Запрос класса, приклепленного к учителю
async function getClassByTeacher() {    
  const res = await fetch("/class_by_teacher", { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({id_teacher: id_teacher}) 
  })          
  const result = await res.json()     
  id_class = result[0].id_class // id класса учителя
  label_class.innerHTML = "Класс: "+result[0].name_class // Заполняем класс учителя
}

// Выполняем запросы
getUserName().then(data=> {  
  getClassByTeacher().then(data=>{
    getStudentsByClass()
  }) 
})

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