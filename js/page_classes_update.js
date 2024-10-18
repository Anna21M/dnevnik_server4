// Код: обновить класс

const pole_name = document.getElementById("name")     // Элемент Html: наименование класса
const but_update = document.getElementById("but_update")  // Элемент Html: кнопка "Обновить"
const list_teacher = document.getElementById("list")  // Элемент Html: список учитилей


// Запрос у сервера списка всех учителей
async function getAllTeachers() {
  const res = await fetch("/users_list_teachers", { 
      method: "POST"    
    })          
    const result = await res.json()
    let outHtml = ""
    if (result.length > 0) {
      for (let i=0; i<result.length; i++) {
        outHtml += `
          <option value="${result[i].id}">${result[i].fio}</option>            
            `
      }
    }
    list_teacher.innerHTML = outHtml
}
// Выполняем запрос
getAllTeachers()

// Заполняем поля данными редактируемого класса (сервер запомнил)
// Запрос данных изменяемого класса у сервера (Функция)
async function getClassMemory() {
  const res = await fetch("/class_get_memory", { 
      method: "POST"    
    })          
    const result = await res.json()   // Ответ от сервера    
    pole_name.value = result.name
    list_teacher.value = result.id_teacher    
}  
// Выполняем запрос
getClassMemory()

// Нажата кнопка "Обновить" класс
but_update.addEventListener('click', async ()=>{
    if (pole_name.value == "") {
        alert("Введите имя класса!")
        return
    }
    
    // Проверка на наличие только букв и цифр
    const namePattern = /^[A-Za-zА-Яа-яЁё0-9]+$/; // Разрешает только буквы и цифры
    if (!namePattern.test(pole_name.value.trim())) {
        alert("Имя предмета должно содержать только буквы и цифры!");
        return;
    }
        
    // Данные введены -> отправляем на сервер
    const res = await fetch("/class_db_update", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({name: pole_name.value, id_teacher: list.value}) 
      })          
      const result = await res.json()     
      if (result.goodUpdated == true) {
        // Успешно обновили в базе
        // Возвращаемся к списку классов
        document.location.href = "/page_classes"
      } 
})

