// код: страница администратора

const but_logout = document.getElementById("but_logout")  // Элемент Html: кнопка "выйти"

// Обработка нажатия кнопки "Выйти"
but_logout.addEventListener('click', async ()=>{
    const res = await fetch("/logout", { 
        method: "POST"    
      })          
      const result = await res.json()
      if (result.logout) {
        // Успешно вышли из логина -> Обновляем страницу
        document.location.href = "/"
      }
})