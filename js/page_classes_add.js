// Код: Добавить класс

const pole_name = document.getElementById("name")   // Элемент Html: наименование класса
const but_add = document.getElementById("but_add")  // Элемент Html: кнопка "Добавить"
const list_teacher = document.getElementById("list")  // Элемент Html: выпадающий список учитилей


// Запрос у сервера списка всех учителей
async function getAllTeachers() {
  const res = await fetch("/users_list_teachers", { 
      method: "POST"    
    })          
    const result = await res.json()   // Ответ от сервера
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

// Нажата кнопка "Добавить" класс
but_add.addEventListener('click', async ()=>{
    // 18.10 - новое .trim()
    if (pole_name.value.trim()  == "") {
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
    const res = await fetch("/class_db_add", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pole_name.value, 
          id_teacher: list.value
        }) 
      })          
      const result = await res.json()     
      if (result.goodAdded == true) {
        // Успешно добавили в базу                
        // Возвращаемся к списку классов
        document.location.href = "/page_classes"
      } 
})

