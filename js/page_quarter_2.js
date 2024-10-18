// код: список оценок для 2 четверти

const list = document.getElementById("list") // Элемент Html: Список оценок

// Нажатие на списке
list.onclick = async function(event) {
    let target = event.target;        
    if (target.tagName != 'BUTTON') return; 
    const tag_id = target.getAttribute('tag')
    const tag_class = target.getAttribute('class')
    
    switch(tag_class) {
        // Нажата кнопка "Обновить"
        case "but_update":
            // Говорим серверу, чтобы запомнил, выбранную нами, оценку
            const res = await fetch("/quarter_2_put_memory", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({id: tag_id}) 
              })          
              const result = await res.json() 
              if (result.goodMemory) {
                // Загружаем страницу "Изменение оценки"
                document.location.href = "/page_quarter_2_update" 
              }
        break
        // Нажата кнопка "Удалить"
        case "but_delete":
            const resDel = await fetch("/quarter_2_db_delete", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({id: tag_id}) 
              })          
              const resultDel = await resDel.json() 
              if (resultDel.goodDelete) {
                document.location.href = "/page_quarter_2" 
              } 
    }    
  }


// Запрос у сервера списка всех оценок (2 четверть)
async function getAllGrades() {
    const res = await fetch("/quarter_2_list", { 
        method: "POST"    
      })          
      const result = await res.json()      // ответ от сервера
      let outHtml = ""
      if (result.length > 0) {
        for (let i=0; i<result.length; i++) {            
            outHtml += `
            <li>
            <div style="display:flex">
            <p class="menu_item">${result[i].name_student}</p>            
            <p class="menu_item">${result[i].name_subject}</p>            
            <p class="menu_item">(${result[i].grade})</p>            
            <button tag="${result[i].id}" class="but_update">Изменить</button>
            <button tag="${result[i].id}" class="but_delete">Удалить</button>
            </div>
            </li>
            `
        }
        list.innerHTML = outHtml
      }
}
// выоплняем запрос
getAllGrades()