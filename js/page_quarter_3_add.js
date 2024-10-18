// код: добавить оценку для 3 четверти

const list_students = document.getElementById("listStudents")  // Элемент Html: список учеников
const list_subjects = document.getElementById("listSubjects")  // Элемент Html: список предметов
const pole_grade = document.getElementById("grade")           // Элемент Html: оценка
const but_add = document.getElementById("but_add")            // Элемент Html: кнопка "Доабавить"

// Запрос у сервера списка всех учеников
async function getAllStudents() {
  const res = await fetch("/students_list", { 
      method: "POST"    
    })          
    const result = await res.json()    // ответ от сервера
    let outHtml = ""
    if (result.length > 0) {
      for (let i=0; i<result.length; i++) {
        outHtml += `
          <option value="${result[i].id}">${result[i].name}</option>            
            `
      }
    }
    list_students.innerHTML = outHtml
}
// выполняем запрос
getAllStudents()

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
          <option value="${result[i].id}">${result[i].name}</option>            
            `
      }
    }
    list_subjects.innerHTML = outHtml
}
// выполняем запрос
getAllSubjects()

// Нажата кнопка "Добавить" оценку
but_add.addEventListener('click', async ()=>{
    if (pole_grade.value == "") {
        alert("Введите оценку!")
        return
    }   
    
    // Проверяем что число    
    let v_grade = 0
    try {
      v_grade = Number.parseInt(pole_grade.value)      
    } catch(err) {
      alert("Введите число в поле Оценка!")
      return
    }
    if (v_grade < 1 || v_grade > 5) {
      alert("Оценка может быть от 1 до 5")
      return
    }    
    
    // Данные введены -> отправляем на сервер
    const res = await fetch("/quarter_3_db_add", { 
      
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_student: list_students.value,  // id ученика
          id_subject: list_subjects.value,  // id предмета
          grade: pole_grade.value           //  оценка
        }) 
      })          
      const result = await res.json()     
      if (result.goodAdded == true) {
        // Успешно добавили в базу                
        // Возвращаемся к списку оценок
        document.location.href = "/page_quarter_3"
      } 

})

