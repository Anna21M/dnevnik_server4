// код: список учеников

const list = document.getElementById("list") // Элемент Html: Список учеников

// Нажатие на список
list.onclick = async function(event) {
    let target = event.target;        
    if (target.tagName != 'BUTTON') return; 
    const v_id = target.getAttribute('tag')
    const tag_class = target.getAttribute('class')
    
    switch(tag_class) {
        // Нажата кнопка "Обновить"
        case "but_update":
            // Говорим серверу, чтобы запомнил, выбранного нами, ученика
            const res = await fetch("/student_put_memory", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({id: v_id}) 
              })          
              const result = await res.json() 
              if (result.goodMemory) {
                // Загружаем страницу "Изменение ученика"
                document.location.href = "/page_students_update" 
              }
        break
        // Нажата кнопка "Удалить"
        case "but_delete":
            const resDel = await fetch("/student_db_delete", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({id: v_id}) 
              })          
              const resultDel = await resDel.json() 
              if (resultDel.goodDelete) {
                document.location.href = "/page_students" 
              } 
    }    
  }

// Запрос у сервера списка всех учеников
async function getAllStudents() {
    const res = await fetch("/students_list", { 
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
            <p class="menu_item">(${result[i].name_class})</p>            
            <button tag="${result[i].id}" class="but_update">Изменить</button>
            <button tag="${result[i].id}" class="but_delete">Удалить</button>
            </div>
            </li>
            `
        }
        list.innerHTML = outHtml
      }
}
// выполняем запрос
getAllStudents()