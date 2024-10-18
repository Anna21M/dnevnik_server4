// код: изменить оценку для 4 четверти

const student = document.getElementById("student")  // Элемент Html: Ученик
const subject = document.getElementById("subject")  // Элемент Html: Предмет
const pole_grade = document.getElementById("grade") // Элемент Html: оценка
const but_update = document.getElementById("but_update") // Элемент Html: кнпока "Обновить"

// Массив загруженных учеников (пока пустой)
let masStudents = []
// Массив загруженных предметов (пока пустой)
let masSubjects = []
// Оценка (пока пустая)
let id_grade = -1

// Запрос у сервера списка всех учеников 
async function getAllStudents() {
  const res = await fetch("/students_list", { 
      method: "POST"    
    })          
    const result = await res.json()
    // Копируем ответ от сервера в наш массив учеников
    masStudents = result.map((element) => element)    
}

// Запрос у сервера списка всех предметов
async function getAllSubjects() {
  const res = await fetch("/subjects_list", { 
      method: "POST"    
    })          
    const result = await res.json()
    // Копируем ответ от сервера в наш массив предметов
    masSubjects = result.map((element) => element)    
}

// Заполняем поля данными редактируемой оценки (сервер запомнил)
// Запрос данных изменяемой оценки у сервера 
async function getGradeMemory() {
  const res = await fetch("/quarter_4_get_memory", { 
      method: "POST"    
    })          
    const result = await res.json()    // ответ от сервреа
        
    id_grade = result.id  // id оценки
    // Ищем индексы в массивах учеников и предметов для нашей оценки
    const ind_mas = masStudents.findIndex((item) => item.id == result.id_student)
    const ind_mas2 = masSubjects.findIndex((item) => item.id == result.id_subject)
    // Отображаем в Html имя ученика
    student.innerHTML = masStudents[ind_mas].name
    // Отображаем в Html имя предмета
    subject.innerHTML = masSubjects[ind_mas2].name
    // Отображаем в Html саму оценку
    pole_grade.value = result.grade    
}
  
// Выполняем запросы

// Считываем всех учеников
getAllStudents().then(  
  // Затем считываем все предметы
  getAllSubjects().then(  
    // Замем считываем параметры сохраненной на сервере оценки
    getGradeMemory()  
  )
)

// Нажата кнопка "Обновить" оценку
but_update.addEventListener('click', async ()=>{
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
    const res = await fetch("/quarter_4_db_update", {       
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({id:id_grade, grade: pole_grade.value}) 
      })          
      const result = await res.json()     
      if (result.goodUpdated == true) {
        // Успешно обновили в базе
        // Возвращаемся к списку оценок
        document.location.href = "/page_quarter_4"
      } 
})

