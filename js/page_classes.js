// Код: список школьных классов

const list = document.getElementById("list") // Элемент Html: Список классов

// Нажатие на списке классов --------------------------------------------
list.onclick = async function(event) {
    let target = event.target;        
    if (target.tagName != 'BUTTON') return; 
    const v_id = target.getAttribute('tag')
    const v_class = target.getAttribute('class')
    
    switch(v_class) {
        // Нажатие на кнопке "Обновить"
        case "but_update":
            // Говорим серверу, чтобы запомнил, выбранный нами, класс
            const res = await fetch("/class_put_memory", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({id: v_id}) 
              })          
              const result = await res.json() 
              if (result.goodMemory) {
                // Загружаем страницу "Изменение класса"
                document.location.href = "/page_classes_update" 
              }
        break
        // Нажатие на кнопке "Удалить"
        case "but_delete":
            const resDel = await fetch("/class_db_delete", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({id: v_id}) 
              })          
              const resultDel = await resDel.json() 
              if (resultDel.goodDelete) {
                document.location.href = "/page_classes" 
              } 
    }    
  }


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
            <li>
            <div style="display:flex">
            <p class="menu_item">${result[i].name}</p>            
            <p class="menu_item">${result[i].fio_teacher}</p>            
            <button tag="${result[i].id}" class="but_update">Изменить</button>
            <button tag="${result[i].id}" class="but_delete">Удалить</button>
            </div>
            </li>
            `
        }
        list.innerHTML = outHtml
      }
}
// Выполняем запрос
getAllClasses()