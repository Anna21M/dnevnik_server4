// код: добавить ученика

const pole_name = document.getElementById("name")   // Элемент Html: имя ученика
const but_add = document.getElementById("but_add")  // Элемент Html: кнопка "Добавить"
const list = document.getElementById("list")      // Элемент Html: список классов


// Запрос у сервера списка всех классов
async function getAllClasses() {
  const res = await fetch("/classes_list", { 
      method: "POST"    
    })          
    const result = await res.json() // отвте от сервера
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

// Нажата кнопка "Добавить" ученика
but_add.addEventListener('click', async ()=>{
    // 18.10 - новое .trim()
    if (pole_name.value.trim() == "") {
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
    const res = await fetch("/student_db_add", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pole_name.value,  // имя ученика
          id_class: list.value    // id класса
        }) 
      })          
      const result = await res.json()     
      if (result.goodAdded == true) {
        // Успешно добавили в базу                
        // Возвращаемся к списку учеников
        document.location.href = "/page_students"
      } 

})

