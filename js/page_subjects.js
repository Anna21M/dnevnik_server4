// код: список предметов

const list = document.getElementById("list") // Элемент Html: Список

// Нажатие на список
list.onclick = async function(event) {
    let target = event.target;        
    if (target.tagName != 'BUTTON') return; 
    const v_id = target.getAttribute('tag')
    const v_class = target.getAttribute('class')
    
    switch(v_class) {
        // Нажата кнопка "Изменить"
        case "but_update":
            // Говорим серверу, чтобы запомнил, выбранный нами, предмет
            const res = await fetch("/subject_put_memory", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({id: v_id}) 
              })          
              const result = await res.json() 
              if (result.goodMemory) {
                // Загружаем страницу "Изменение предмета"
                document.location.href = "/page_subjects_update" 
              }
        break
        // Нажата кнопка "Удалить"
        case "but_delete":
            const resDel = await fetch("/subject_db_delete", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({id: v_id}) 
              })          
              const resultDel = await resDel.json() 
              if (resultDel.goodDelete) {
                document.location.href = "/page_subjects" 
              } 
    }    
  }

// Запрос у сервера списка всех предметов
async function getAllSubjects() {
    const res = await fetch("/subjects_list", { 
        method: "POST"    
      })          
      const result = await res.json()      
      let outHtml = ""
      if (result.length > 0) {
        for (let i=0; i<result.length; i++) {            
            outHtml += `
            <li>
            <div style="display:flex">
            <p class="menu_item">${result[i].name}</p>                        
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
getAllSubjects()