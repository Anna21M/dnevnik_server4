// код: обновить ученика

const pole_name = document.getElementById("name")     // Элемент Html: Имя ученика
const but_update = document.getElementById("but_update")  // Элемент Html: кнопка "Обновить"
const list = document.getElementById("list")  // Элемент Html: список классов

// Запрос у сервера списка всех классов
async function getAllClasses() {
  const res = await fetch("/classes_list", { 
      method: "POST"    
    })          
    const result = await res.json() // ответ от сервера
    let outHtml = ""
    if (result.length > 0) {
      for (let i=0; i<result.length; i++) {
        outHtml += `
          <option value="${result[i].id}">${result[i].name}</option>            
            `
      }
    }
    list.innerHTML = outHtml
}
// выполняем запрос
getAllClasses()

// Заполняем поля данными редактируемого ученика (сервер запомнил)
// Запрос данных изменяемого ученика у сервера 
async function getStudentMemory() {
  const res = await fetch("/student_get_memory", { 
      method: "POST"    
    })          
    const result = await res.json()    
    pole_name.value = result.name // заполняем поле имя
    list.value = result.id_class  // выбор с ниспадающем списке класса ученика
}
  
// выполянем запрос
getStudentMemory()

// Нажата кнопка "Обновить" ученика
but_update.addEventListener('click', async ()=>{
    if (pole_name.value == "") {
        alert("Введите имя ученика!")
        return
    }
    // Проверка на наличие только букв и одного пробела между именем и фамилией
    const namePattern = /^[A-Za-zА-Яа-яЁё]+ [A-Za-zА-Яа-яЁё]+$/; // Разрешает только буквы и один пробел
    if (!namePattern.test(pole_name.value.trim())) {
        alert("Имя и фамилия должны содержать только буквы и один пробел между ними!");
        return;
    }    

    // Данные введены -> отправляем на сервер
    const res = await fetch("/student_db_update", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pole_name.value, // новое имя ученика
          id_class: list.value  // новый класс ученика
        }) 
      })          
      const result = await res.json()     
      if (result.goodUpdated == true) {
        // Успешно обновили в базе
        // Возвращаемся к списку учеников
        document.location.href = "/page_students"
      } 

})

