// код: изменить предмет

const pole_name = document.getElementById("name")   // Элемент Html: имя предмета
const but_update = document.getElementById("but_update")  // Элемент Html: кнопка "Обновить"

// Заполняем поля данными редактируемого предмета (сервер запомнил)
// Запрос данных изменяемого предмета у сервера 
async function getSubjectMemory() {
  const res = await fetch("/subject_get_memory", { 
      method: "POST"    
    })          
    const result = await res.json()    // отвте от сервера
    pole_name.value = result.name     // заполняем поле имени предмета
}
  
// выполняем запрос
getSubjectMemory()

// Нажата кнопка "Обновить" предмет
but_update.addEventListener('click', async ()=>{
    if (pole_name.value == "") {
        alert("Введите имя предмета!")
        return
    }

    // Проверка на наличие только букв и цифр
    const namePattern = /^[A-Za-zА-Яа-яЁё]+$/; // Разрешает только буквы и цифры
    if (!namePattern.test(pole_name.value.trim())) {
        alert("Имя предмета должно содержать только буквы!");
        return;
    }    
    
    // Данные введены -> отправляем на сервер
    const res = await fetch("/subject_db_update", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pole_name.value   // новое имя предмета
        }) 
      })          
      const result = await res.json()     
      if (result.goodUpdated == true) {
        // Успешно обновили в базе
        // Возвращаемся к списку предметов
        document.location.href = "/page_subjects"
      } 

})

