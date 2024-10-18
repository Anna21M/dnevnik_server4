// код: добавить предмет

const pole_name = document.getElementById("name") // Элемент Html: имя предмета
const but_add = document.getElementById("but_add")  // Элемент Html: кнопка "Добавить"

// Нажата кнопка "Добавить" предмет
but_add.addEventListener('click', async ()=>{
  // 18.10 - новое .trim()
    if (pole_name.value.trim() == "") {
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
    const res = await fetch("/subject_db_add", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pole_name.value // новое имя предмета
        }) 
      })          
      const result = await res.json()     
      if (result.goodAdded == true) {
        // Успешно добавили в базу                
        // Возвращаемся к списку предметов
        document.location.href = "/page_subjects"
      } 

})

