// код: список пользователей

const list = document.getElementById("list") // Элемент Html: Список

// Нажатие на списке
list.onclick = async function(event) {
    let target = event.target;        
    if (target.tagName != 'BUTTON') return; 
    const v_id = target.getAttribute('tag')
    const v_class = target.getAttribute('class')
    
    switch(v_class) {
        // Нажата кнопка "Изменить"
        case "but_update":
            // Говорим серверу, чтобы запомнил, выбранного нами, пользователя
            const res = await fetch("/user_put_memory", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({id: v_id}) 
              })          
              const result = await res.json() 
              if (result.goodMemory) {
                // Загружаем страницу "Изменение пользователя"
                document.location.href = "/page_users_update" 
              }
        break
        // Нажата кнопка "Удалить"
        case "but_delete":
            const resDel = await fetch("/user_db_delete", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({id: v_id}) 
              })          
              const resultDel = await resDel.json() 
              if (resultDel.goodDelete) {
                document.location.href = "/page_users" 
              } else {
                alert("Администратора удалить нельзя!")
              }
    }    
  }


// Запрос у сервера списка всех пользователей
async function getAllUsers() {
    const res = await fetch("/users_list", { 
        method: "POST"    
      })          
      const result = await res.json() // ответ от сервера
      let outHtml = ""
      if (result.length > 0) {
        for (let i=0; i<result.length; i++) {
            let ss_type = ""
            switch (result[i].type) {
                case 0: ss_type = "(Администратор)"
                break
                case 1: ss_type = "(Директор)"
                break
                case 2: ss_type = "(Учитель)"
            }

            outHtml += `
            <li>
            <div style="display:flex">
            <p class="menu_item">${result[i].fio}</p>
            <p class="menu_item">${result[i].login}</p>
            <p class="menu_item">${result[i].password}</p>
            <p class="menu_item">${ss_type}</p>
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
getAllUsers()