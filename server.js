// код: работа сервера

import express from 'express'
import fs from 'fs'
import mysql from 'mysql2'

let curUserID = -1      // Вошедший пользователь: id в БД (Если "-1", то нет пользователей)
let curUserName = ""    // Вошедший пользователь: ФИО
let curUserType = 0     // Вошедший пользователь: тип (0-админ, 1-директор, 2-учитель)

let updatedUserID = -1      // Изменяемый пользователь: id в БД
let updatedUserLogin = ""   // Изменяемый пользователь: Логин
let updatedUserPass = ""    // Изменяемый пользователь: Пароль
let updatedUserName = ""    // Изменяемый пользователь: ФИО
let updatedUserType = 0     // Изменяемый пользователь: тип (0-админ, 1-директор, 2-учитель)

// Изменяемый класс
let updatedClassID = -1
let updatedClassName = ""
let updatedClassIDTeacher = -1

// Изменяемый предмет
let updatedSubjectID = -1
let updatedSubjectName = ""

// Изменяемый ученик
let updatedStudentID = -1
let updatedStudentName = ""
let updatedStudentIDClass = -1

// Изменяемая оценка
let updatedQuarter = -1             // выбранная четверть
let updatedQuarterID = -1            // id оценки
let updatedQuarterStudentID = -1     // Ученик, которому выставляется оценка
let updatedQuarterSubjectID = -1     // Предмет, по которому выставляется оценка
let updatedQuarterGrade = -1         // Оценка

const PORT = 5000		// порт, который будет прослушивать сервер
const app = express()	// создаем объект фреймворка
app.use(express.json()) // говорим экспрессу, чтобы использовала JSON-формат

app.listen(PORT, ()=>{  // говорим серверу, чтобы прослушивал порт PORT
    // console.log('Сервер "Школьного дневника" запущен.')
})

//  создаем пул (для работы с БД)
const pool = mysql.createPool({
    connectionLimit : 100,
    host: "localhost",
    user: "root",
    database: "dnevnik",
    password: "root"
})
const promisePool  = pool.promise()

// -------------------------------------------------------------------------------------------------
//  БАЗА ДАННЫХ (MySQL) 
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
//  БАЗА ДАННЫХ (СПИСОК ПОЛЬЗОВАТЕЛЕЙ) 
// -------------------------------------------------------------------------------------------------
// БД: Список пользователей: Проверить на наличие (корректность пары логина и пароля)
async function db_getUser(login, password) {     
    const [data] = await promisePool.query("SELECT * FROM users WHERE login = '"+login+"' AND password = '"+password+"'")
    return data
}
// БД: Список пользователей: Получить всех учителей (type == 2)
async function db_getTeachers() {     
    const [data] = await promisePool.query("SELECT * FROM users WHERE type = 2")
    return data
}
// БД: Список пользователей: Данные пользователя по его id
async function db_getUserById(pId) {     
    const [data] = await promisePool.query("SELECT * FROM users WHERE id = "+pId)
    return data
}
// БД: Список пользователей: Вытащить список всех пользователей
async function db_getAllUsers() {     
    const [data] = await promisePool.query("SELECT * FROM users")
    return data
}
// БД: Список пользователей: Добавить нового пользователя
async function db_addUser(fio, login, pass, type) {     
    const [data] = await promisePool.query("INSERT INTO users (fio, login, password, type) VALUES ('"+fio+"', '"+login+"', '"+pass+"',"+type+")")
    return data
}
// БД: Список пользователей: Обновить данные пользователя
async function db_updateUser(id, fio, login, pass, type) {     
    const [data] = await promisePool.query("UPDATE users SET fio ='"+fio+"', login = '"+login+"', password ='"+pass+"', type = "+type+" WHERE id = "+id)
    return data
}
// БД: Список пользователей: Удалить пользователя
async function db_deleteUser(id) {     
    const [data] = await promisePool.query("DELETE FROM users WHERE id = "+id)
    return data
}


// -------------------------------------------------------------------------------------------------
//  БАЗА ДАННЫХ (СПИСОК КЛАССОВ) 
// -------------------------------------------------------------------------------------------------

// БД: Список классов: Вытащить список всех классов
async function db_getAllClasses() {     
    const [data] = await promisePool.query("SELECT * FROM classes")
    return data
}
// БД: Список классов: Получить имя класса по его id
async function db_getClassById(pId) {     
    const [data] = await promisePool.query("SELECT * FROM classes WHERE id = "+pId)
    return data
}
// БД: Список классов: Получить класс по id учителя
async function db_getClassByTeacherId(pId_teacher) {     
    const [data] = await promisePool.query("SELECT * FROM classes WHERE id_teacher = "+pId_teacher)
    return data
}
// БД: Список классов: Добавить новый класс
async function db_addClass(name, pId_teacher) {     
    const [data] = await promisePool.query("INSERT INTO classes (name, id_teacher) VALUES ('"+name+"',"+pId_teacher+")")
    return data
}
// БД: Список классов: Обновить имя и учителя класса
async function db_updateClass(id, name, id_teacher) {     
    const [data] = await promisePool.query("UPDATE classes SET name ='"+name+"', id_teacher = '"+id_teacher+"' WHERE id = "+id)
    return data
}
// БД: Список классов: Удалить класс
async function db_deleteClass(id) {
    // 18.10 Начало
    // Чтобы удалить класс, сначала нужно получить список учеников этого класса
    const [data1] = await promisePool.query("SELECT * FROM students WHERE id_class = "+id)        
    if (data1.length > 0) {
        // Есть ученики, удаляем их
        for (let i=0; i<data1.length; i++) {
            db_deleteStudents(data1[i].id)            
        }
    }   

    // Удаляем класс
    const [data] = await promisePool.query("DELETE FROM classes WHERE id = "+id)
    return data
}

// -------------------------------------------------------------------------------------------------
//  БАЗА ДАННЫХ (СПИСОК ПРЕДМЕТОВ) 
// -------------------------------------------------------------------------------------------------

// БД: Список предметов: Вытащить список всех предметов
async function db_getSubjectsAll() {     
    const [data] = await promisePool.query("SELECT * FROM subjects")
    return data
}
// БД: Список предметов: Получить имя предмета по его id
async function db_getSubjectById(pId) {     
    const [data] = await promisePool.query("SELECT * FROM subjects WHERE id = "+pId)
    return data
}
// БД: Список предметов: Добавить новый предмет
async function db_addSubject(name) {     
    const [data] = await promisePool.query("INSERT INTO subjects (name) VALUES ('"+name+"')")
    return data
}
// БД: Список предметов: Обновить имя предмета
async function db_updateSubject(id, name) {     
    const [data] = await promisePool.query("UPDATE subjects SET name ='"+name+"' WHERE id = "+id)
    return data
}
// БД: Список предметов: Удалить предмет
async function db_deleteSubject(id) {     
    const [data] = await promisePool.query("DELETE FROM subjects WHERE id = "+id)
    return data
}

// -------------------------------------------------------------------------------------------------
//  БАЗА ДАННЫХ (СПИСОК УЧЕНИКОВ) 
// -------------------------------------------------------------------------------------------------

// БД: Список учеников: Вытащить список всех учеников
async function db_getStudentsAll() {     
    
    let sql = "" // строка запроса к БД 
    
    // Если вошедший пользователь является учителем (curUserType == 2)
    if (curUserType == 2) {
        // Получаем класс учителя
        const [data1] = await promisePool.query("SELECT * FROM classes WHERE id_teacher = "+curUserID)        
        // Создаем строку запрса к БД для учителя
        // Здесь нам база вернет только тех учеников, которые принадлежат классу учителя
        sql = "SELECT * FROM students WHERE id_class="+data1[0].id
    } else {
        // Создаем строку запроса к БД для остальных пользователей    
        sql = "SELECT * FROM students"
    }
    // Выполняем запрос к БД
    const [data] = await promisePool.query(sql)
    return data
}
// БД: Список учеников: Получить учеников по id класса
async function db_getStudentsByClass(id_class) {     
    const [data] = await promisePool.query("SELECT * FROM students WHERE id_class="+id_class)
    return data
}
// БД: Список учеников: Получить имя ученика по его id
async function db_getStudentById(pId) {     
    const [data] = await promisePool.query("SELECT * FROM students WHERE id = "+pId)
    return data
}
// БД: Список учеников: Добавить нового ученика
async function db_addStudent(name, pId_class) {     
    const [data] = await promisePool.query("INSERT INTO students (name, id_class) VALUES ('"+name+"',"+pId_class+")")
    return data
}
// БД: Список учеников: Обновить имя и класс ученика
async function db_updateStudent(id, name, id_class) {     
    const [data] = await promisePool.query("UPDATE students SET name ='"+name+"', id_class = '"+id_class+"' WHERE id = "+id)
    return data
}
// БД: Список учеников: Удалить ученика
async function db_deleteStudents(id) {     
    const [data] = await promisePool.query("DELETE FROM students WHERE id = "+id)
    return data
}

// -------------------------------------------------------------------------------------------------
//  БАЗА ДАННЫХ (СПИСОК ОЦЕНОК УЧЕНИКОВ ) 
//   Прим.: Grade - оценка, Quarter - четверть, Subject - предмет
// -------------------------------------------------------------------------------------------------

// БД: Список оценок: Вытащить список оценок (относительно четверти)
async function db_getGradesAll(numQuarter) {     
    // numQuarter - номер четверти
    const [data] = await promisePool.query("SELECT * FROM quater_"+numQuarter)
    return data
}
// БД
async function db_getGradeById(numQuarter, id) {
    const nameTable = 'quater_'+numQuarter
    const [data] = await promisePool.query("SELECT * FROM "+nameTable+" WHERE id="+id)
    return data
}
// БД: Список оценок: Добавить оценку (относительно четверти)
async function db_addGrade(numQuarter, pId_student, pId_subject, pGrade) {         
    // Имя таблицы четверти относительно выбранной четверти
    const nameTable = 'quater_'+numQuarter    
    const [data] = await promisePool.query("INSERT INTO "+nameTable+" (id_student, id_subject, grade) VALUES ("+pId_student+","+pId_subject+", "+pGrade+")")
    return data
}
// БД: Список оценок: Обновить оценку (относительно четверти)
async function db_updateGrade(numQuarter, pId, pGrade) {         
    // Имя таблицы четверти относительно выбранной четверти
    const nameTable = 'quater_'+numQuarter    
    const [data] = await promisePool.query("UPDATE "+nameTable+" SET grade ="+pGrade+" WHERE id = "+pId)
    return data
}
// БД: Список оценок: Удалить ученика
async function db_deleteGrade(numQuarter, id) {     
    // Имя таблицы четверти относительно выбранной четверти
    const nameTable = 'quater_'+numQuarter    
    const [data] = await promisePool.query("DELETE FROM "+nameTable+" WHERE id = "+id)
    return data
}



//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
// Отдача браузеру всех запрашиваемых файлов JS
app.get('/*.js', (req,res)=>{ 
    fs.readFile('js/'+req.url.replace('/',''), (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/js'});
        res.write(data); 
        res.end();
    })
})
// Отдача браузеру всех запрашиваемых файлов CSS
app.get('/*.css', async (req,res)=>{ 
    fs.readFile('css/'+req.url, (err, data) => {
        //if (err) throw err; 
        if (!err){
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.write(data); 
        res.end();
        } else {
            res.writeHead(200, {'Content-Type': 'text/css'});
            res.end();
        }
    })
})


// Браузер запрашивает ГЛАВНУЮ страницу.. -------------------------------------------------------------
app.get('/', (req,res)=>{    
    if (curUserID == -1) {
        // Если нет текущего пользователя, то отправляем браузеру страницу логина (login.html)
        fs.readFile('html/login.html', (err, data) => {
            if (err) throw err; 
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data); 
            res.end();
        })
    } else {
        // Отправляем браузеру страницу пользователя в зависимости от типа пользователя
        sendUserPage(res)
    }
})


// ================================================================================================
//     ЗАПРОСЫ ОТ БРАУЗЕРА 
// ================================================================================================

// Пришли логин и пароль от браузера 
app.post('/login_data_from_user', async (req,res)=>{
    const dataLogin = req.body.login    // Логин от пользователя
    const dataPassword = req.body.password    // Пароль от пользователя
   
    // Проверяем, есть ли в БД такой пользователь
    db_getUser(dataLogin, dataPassword).then(data=>{        
        if (data !== null) {
            if (data.length > 0) {                
                // Есть - помечаем как текущего пользователя
                curUserID = data[0].id
                curUserName = data[0].fio
                curUserType = data[0].type                            
                // Отправляем браузеру ответ, что пользователь есть
                res.status(200).send({isUser: true})            
            } else {
                // Отправляем браузеру ответ, что пользователя НЕТ
                res.status(200).send({isUser: false})            
            }
        }        
    })           
})

// Запрос от браузера: Выйти из логина
app.post('/logout', async (req,res)=>{
    curUserID = -1  // "-1" означает, что никто не вошел
    res.status(200).send({logout: true})                
})

// Запрос от браузера: Получить имя пользователя
app.post('/get_user', async (req,res)=>{    
    // Отправляем браузеру имя пользователя
    res.status(200).send({id:curUserID, user_name: curUserName})                
})

// Функция: Отправить браузеру страницу пользователя (согласно его типу)
function sendUserPage(res) {
    switch(curUserType) {
        case 0: // Отправляем страницу администратора
            fs.readFile('html/user_admin.html', (err, data) => {
                if (err) throw err; 
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(data); 
                res.end();
            })
            break
        case 1: // Отправляем страницу директора
            fs.readFile('html/user_director.html', (err, data) => {
                if (err) throw err; 
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(data); 
                res.end();
            })
            break
        case 2: // Отправляем страницу учителя
            fs.readFile('html/user_teacher.html', (err, data) => {
                if (err) throw err; 
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(data); 
                res.end();
            })
            break
    }
}

// --------------------------------------------------------------------------------------------------
//  РАБОТА СО СПИСКОМ ПОЛЬЗОВАТЕЛЕЙ 
// --------------------------------------------------------------------------------------------------

// Список пользователей: Отдаем браузеру Html-старницу (список)
app.get('/page_users', async (req,res)=>{
    fs.readFile('html/page_users.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })
})
// Список пользователей: Отдаем браузеру Html-старницу (добавить)
app.get('/page_users_add', async (req,res)=>{
    fs.readFile('html/page_users_add.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })
})
// Список пользователей: Отдаем браузеру Html-старницу (изменить)
app.get('/page_users_update', async (req,res)=>{
    fs.readFile('html/page_users_update.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })                
    
})

// Список пользователей: Запомнить изменяемого пользователя
app.post('/user_put_memory', async (req,res)=>{
    const dataId = req.body.id    // id изменяемого пользователя от браузера
    // Вытаскиваем из БД изменяемого пользователя по его id    
    db_getUserById(dataId).then(data=>{        
        if (data !== null) {
            if (data.length > 0) {                
                // Запоминаем изменяемого пользователя
                updatedUserID = data[0].id
                updatedUserLogin = data[0].login
                updatedUserPass = data[0].password
                updatedUserName = data[0].fio
                updatedUserType = data[0].type       
                res.status(200).send({goodMemory: true})     
            } 
        }        
    }) 
})

// Список пользователей: Вернуть браузеру данные изменяемого пользователя
app.post('/user_get_memory', async (req,res)=>{        
    res.status(200).send({login: updatedUserLogin, pass: updatedUserPass,  fio: updatedUserName, type: updatedUserType})
})

// Список пользователей: Отдаем браузеру список всех пользователей из БД
app.post('/users_list', async (req,res)=>{     
    // Вытаскиваем из БД всех пользователей
    db_getAllUsers().then(data=>{        
        if (data !== null) {
            // Отправляем браузеру список пользователей
            res.status(200).send(data)                        
        }        
    })           
})

// Список пользователей: Отдаем браузеру список всех учителей
app.post('/users_list_teachers', async (req,res)=>{     
    // Вытаскиваем из БД всех учителей
    db_getTeachers().then(data=>{        
        if (data !== null) {
            // Отправляем браузеру список учителей
            res.status(200).send(data)                        
        }        
    })           
})

// Список пользователей: Добавляем нового пользователя в БД
app.post('/user_db_add', async (req,res)=>{
    const dataLogin = req.body.login            // Логин нового пользователя
    const dataPassword = req.body.password      // Пароль нового пользователя
    const dataFio = req.body.fio                // ФИО нового пользователя
    const dataType = req.body.type              // Тип нового пользователя
       
    // Добавляем нового пользователя в БД
    db_addUser(dataFio, dataLogin, dataPassword, dataType).then(data=>{        
        if (data !== null) {
            // Отправляем браузеру ответ, что добавили пользователя
            res.status(200).send({goodAdded: true})                        
        }        
    })           
})

// Список пользователей: Обновить данные пользователя в БД
app.post('/user_db_update', async (req, res)=>{    
    const dataLogin = req.body.login
    const dataPass = req.body.password
    const dataFio = req.body.fio
    const dataType = req.body.type
    // Обновляем данные пользователя в БД
    db_updateUser(updatedUserID, dataFio, dataLogin, dataPass, dataType).then(data=>{        
        if (data !== null) {
            // Отправляем браузеру ответ, что обновили пользователя
            res.status(200).send({goodUpdated: true})                        
        }        
    })
})

// Список пользователей: Удалить пользователя из БД
app.post('/user_db_delete', async (req, res)=>{
    const dataId = req.body.id  // id удаляемого пользователя (от браузера)
    // Проверяем тип "Админ" у пользователя..
    await db_getUserById(dataId).then(data=>{        
        if (data !== null) {
            if (data.length > 0) {                
                if (data[0].type == 0) {
                    // Пользователь является админом, его удалять нельзя!
                    // Отправляем браузеру ответ, что удаление не удалось!
                    res.status(200).send({goodDelete: false})                        
                    return // выходим
                } else {
                    // Удаляем пользователя из БД
                    db_deleteUser(dataId).then(data=>{
                        if (data !== null) {
                            // Отправляем браузеру ответ, что удалили пользователя
                            res.status(200).send({goodDelete: true})                        
                        }
                    })
                }               
            } 
        }        
    })
    
})


// --------------------------------------------------------------------------------------------------
//  РАБОТА СО СПИСКОМ КЛАССОВ 
// --------------------------------------------------------------------------------------------------

// Список классов: Отдаем браузеру Html-старницу (список)
app.get('/page_classes', async (req,res)=>{
    fs.readFile('html/page_classes.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })
})
// Список классов: Отдаем браузеру Html-старницу (добавить)
app.get('/page_classes_add', async (req,res)=>{
    fs.readFile('html/page_classes_add.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })
})
// Список классов: Отдаем браузеру Html-старницу (изменить)
app.get('/page_classes_update', async (req,res)=>{
    fs.readFile('html/page_classes_update.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })                
    
})

// Список классов: Запомнить изменяемый класс
app.post('/class_put_memory', async (req,res)=>{
    const dataId = req.body.id    // id изменяемого класса от браузера
    // Вытаскиваем из БД изменяемого класса по его id    
    db_getClassById(dataId).then(data=> {        
        if (data !== null) {
            if (data.length > 0) {                
                // Запоминаем изменяемый класс
                updatedClassID = data[0].id
                updatedClassName = data[0].name   
                updatedClassIDTeacher = data[0].id_teacher             
                res.status(200).send({goodMemory: true})                        
            } 
        }        
    }) 
})

// Список классов: Вернуть браузеру имя изменяемого класса
app.post('/class_get_memory', async (req,res)=>{        
    res.status(200).send({name: updatedClassName, id_teacher: updatedClassIDTeacher})
})

// Список классов: получить класс по id учителя
app.post('/class_by_teacher', async (req, res)=>{
    const id_teacher = req.body.id_teacher  // id учителя
    let masOut = []
    db_getClassByTeacherId(id_teacher).then(data=>{
        if (data != null) {
            if (data.length > 0) {
                masOut.push({id_class: data[0].id, name_class: data[0].name})
            }
        }
        // Отправляем браузеру список классов
        res.status(200).send(masOut)
    })
})

// Список классов: Отдаем браузеру список всех классов из БД
app.post('/classes_list', async (req,res)=>{     
    // Вытаскиваем из БД все классы
    db_getAllClasses().then(dataClasses=>{        
        if (dataClasses !== null) {
            // Список классов получен, получаем всех учителей, что узнать ФИО по номеру учетеля
            db_getTeachers().then(dataTeachers=>{
                const massOut = []
                if (dataTeachers != null) {                    
                    if (dataClasses.length > 0 && dataTeachers.length >0) {
                        for (let i=0; i<dataClasses.length; i++) {
                            // Номер учителя класса
                            const indTeacher = dataClasses[i].id_teacher
                            // Ищем индекс учителя в массиве учителей
                            const v = dataTeachers.findIndex( (item) => item.id == indTeacher)                            
                            if (v != -1) {
                                massOut.push({
                                    id: dataClasses[i].id, 
                                    name: dataClasses[i].name, 
                                    fio_teacher: dataTeachers[v].fio
                                })
                            }
                        }
                    }
                }
                // Отправляем браузеру список классов
                res.status(200).send(massOut)                        
            })
            
        }        
    })           
})

// Список классов: Добавляем новый класс в БД
app.post('/class_db_add', async (req,res)=>{
    const dataName = req.body.name            // Имя нового класса
    const data_id_teacher = req.body.id_teacher      // Учитель класса
       
    // Добавляем новый класс в БД
    db_addClass(dataName, data_id_teacher).then(data=>{        
        if (data !== null) {
            // Отправляем браузеру ответ, что добавили класс
            res.status(200).send({goodAdded: true})                        
        }        
    })           
})

// Список классов: Обновить имя класса в БД
app.post('/class_db_update', async (req, res)=>{    
    const dataName = req.body.name
    const data_id_teacher = req.body.id_teacher
    // Обновляем имя класса в БД
    db_updateClass(updatedClassID, dataName, data_id_teacher).then(data=>{        
        if (data !== null) {
            // Отправляем браузеру ответ, что обновили класс
            res.status(200).send({goodUpdated: true})                        
        }        
    })
})

// Список классов: Удалить клас из БД
app.post('/class_db_delete', async (req, res)=>{
    const dataId = req.body.id  // id удаляемого класса (от браузера)
    // Удаляем класс из БД
    db_deleteClass(dataId).then(data=>{
        if (data !== null) {
            // Отправляем браузеру ответ, что удалили класс
            res.status(200).send({goodDelete: true})                        
        }
    }) 
    
})

// --------------------------------------------------------------------------------------------------
//  РАБОТА СО СПИСКОМ ПРЕДМЕТОВ
// --------------------------------------------------------------------------------------------------

// Список предметов: Отдаем браузеру Html-старницу (список)
app.get('/page_subjects', async (req,res)=>{
    fs.readFile('html/page_subjects.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })
})
// Список предметов: Отдаем браузеру Html-старницу (добавить)
app.get('/page_subjects_add', async (req,res)=>{
    fs.readFile('html/page_subjects_add.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })
})
// Список предметов: Отдаем браузеру Html-старницу (изменить)
app.get('/page_subjects_update', async (req,res)=>{
    fs.readFile('html/page_subjects_update.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })                
    
})

// Список предметов: Запомнить изменяемый предмет
app.post('/subject_put_memory', async (req,res)=>{
    const dataId = req.body.id    // id изменяемого предмета от браузера
    // Вытаскиваем из БД изменяемый предмет по его id    
    db_getSubjectById(dataId).then(data=> {        
        if (data !== null) {
            if (data.length > 0) {                
                // Запоминаем изменяемый предмет
                updatedSubjectID = data[0].id
                updatedSubjectName = data[0].name                   
                res.status(200).send({goodMemory: true})                        
            } 
        }        
    }) 
})

// Список предметов: Вернуть браузеру имя изменяемого предмета
app.post('/subject_get_memory', async (req,res)=>{        
    res.status(200).send({name: updatedSubjectName})
})

// Список предметов: Отдаем браузеру список всех предметов из БД
app.post('/subjects_list', async (req,res)=>{     
    // Вытаскиваем из БД все предеметы
    db_getSubjectsAll().then(data=>{        
        if (data !== null) {
            // Список предметов получен
            // Отправляем браузеру список предметов
            res.status(200).send(data)                        
        }        
    })           
})

// Список предметов: Добавляем новый предмет в БД
app.post('/subject_db_add', async (req,res)=>{
    const dataName = req.body.name    // Имя нового предмета от браузера
           
    // Добавляем новый предмет в БД
    db_addSubject(dataName).then(data=>{        
        if (data !== null) {
            // Отправляем браузеру ответ, что добавили предмет
            res.status(200).send({goodAdded: true})                        
        }        
    })           
})

// Список предметов: Обновить имя предмета в БД
app.post('/subject_db_update', async (req, res)=>{    
    const dataName = req.body.name
    
    // Обновляем имя предмета в БД
    db_updateSubject(updatedSubjectID, dataName).then(data=>{        
        if (data !== null) {
            // Отправляем браузеру ответ, что обновили предмет
            res.status(200).send({goodUpdated: true})                        
        }        
    })
})

// Список классов: Удалить предмет из БД
app.post('/subject_db_delete', async (req, res)=>{
    const dataId = req.body.id  // id удаляемого предмета (от браузера)
    // Удаляем предмет из БД
    db_deleteSubject(dataId).then(data=>{
        if (data !== null) {
            // Отправляем браузеру ответ, что удалили предмет
            res.status(200).send({goodDelete: true})                        
        }
    }) 
    
})


// --------------------------------------------------------------------------------------------------
//  РАБОТА СО СПИСКОМ УЧЕНИКОВ 
// --------------------------------------------------------------------------------------------------

// Список учеников: Отдаем браузеру Html-старницу (список)
app.get('/page_students', async (req,res)=>{
    fs.readFile('html/page_students.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })
})
// Список учеников: Отдаем браузеру Html-старницу (добавить)
app.get('/page_students_add', async (req,res)=>{
    fs.readFile('html/page_students_add.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })
})
// Список учеников: Отдаем браузеру Html-старницу (изменить)
app.get('/page_students_update', async (req,res)=>{
    fs.readFile('html/page_students_update.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })                
    
})

// Список учеников: Запомнить изменяемого ученика
app.post('/student_put_memory', async (req,res)=>{
    const dataId = req.body.id    // id изменяемого ученика (от браузера)
    // Вытаскиваем из БД изменяемого ученика по его id    
    db_getStudentById(dataId).then(data=> {        
        if (data !== null) {
            if (data.length > 0) {                
                // Запоминаем изменяемого ученика
                updatedStudentID = data[0].id
                updatedStudentName = data[0].name   
                updatedStudentIDClass = data[0].id_class
                res.status(200).send({goodMemory: true})                        
            } 
        }        
    }) 
})

// Список учеников: Вернуть браузеру имя изменяемого ученика
app.post('/student_get_memory', async (req,res)=>{        
    res.status(200).send({name: updatedStudentName, id_class: updatedStudentIDClass})
})

// Список учеников: Вернуть браузеру список id учеников выбранного класса
app.post('/students_by_class', async (req, res)=>{
    const id_class = req.body.id_class  // id класса
    
    let masOut = []
    db_getStudentsByClass(id_class).then(data=>{
        if (data !== null) {
            if (data.length > 0) {
                for (let i=0; i<data.length; i++) {
                    masOut.push(data[i].id)
                }//i
            }
        }
        // Отправляем браузеру список id учеников выбранного класса
        res.status(200).send(masOut) 
    })
})

// Список учеников: Отдаем браузеру список всех учеников из БД
app.post('/students_list', async (req,res)=>{     
    // Вытаскиваем из БД всех учеников
    db_getStudentsAll().then(dataStudents=>{        
        if (dataStudents !== null) {
            // Список учеников получен, получаем все классы, чтобы узнать класс ученика
            db_getAllClasses().then(dataClasses=>{
                const massOut = []
                if (dataClasses != null) {
                    
                    if (dataStudents.length > 0 && dataClasses.length >0) {
                        for (let i=0; i<dataStudents.length; i++) {
                            // Номер класса ученика
                            const indClass = dataStudents[i].id_class
                            // Ищем в списке классов имя класса
                            const v = dataClasses.findIndex( (item) => item.id == indClass)
                            
                            if (v != -1) {
                                massOut.push({id: dataStudents[i].id, name: dataStudents[i].name, name_class: dataClasses[v].name})
                            }
                        }
                    }
                }
                // Отправляем браузеру список учеников
                res.status(200).send(massOut)                        
            })
            
        }        
    })          
})

// Список учеников: Добавляем нового ученика в БД
app.post('/student_db_add', async (req,res)=>{
    const dataName = req.body.name            // Имя нового ученика
    const data_id_class = req.body.id_class      // Класс ученика
       
    // Добавляем нового ученика в БД
    db_addStudent(dataName, data_id_class).then(data=>{        
        if (data !== null) {
            // Отправляем браузеру ответ, что добавили класс
            res.status(200).send({goodAdded: true})                        
        }        
    })           
})

// Список учеников: Обновить имя и класс ученика в БД
app.post('/student_db_update', async (req, res)=>{    
    const dataName = req.body.name
    const data_id_class = req.body.id_class
    // Обновляем имя и класс ученика в БД
    db_updateStudent(updatedStudentID, dataName, data_id_class).then(data=>{        
        if (data !== null) {
            // Отправляем браузеру ответ, что обновили класс
            res.status(200).send({goodUpdated: true})                        
        }        
    })
})

// Список учеников: Удалить ученика из БД
app.post('/student_db_delete', async (req, res)=>{
    const dataId = req.body.id  // id удаляемого ученика (от браузера)
    // Удаляем ученика из БД
    db_deleteStudents(dataId).then(data=>{
        if (data !== null) {
            // Отправляем браузеру ответ, что удалили класс
            res.status(200).send({goodDelete: true})                        
        }
    }) 
    
})


// --------------------------------------------------------------------------------------------------
//  РАБОТА СО СПИСКОМ ОЦЕНОК (1 ЧЕТВЕРТЬ) 
// --------------------------------------------------------------------------------------------------
// Список оценок (1 четверть): Отдаем браузеру Html-старницу (список)
app.get('/page_quarter_1', async (req,res)=>{
    fs.readFile('html/page_quarter_1.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })
})
// Список оценок (1 четверть): Отдаем браузеру Html-старницу (добавить)
app.get('/page_quarter_1_add', async (req,res)=>{
    fs.readFile('html/page_quarter_1_add.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })
})
// Список оценок (1 четверть): Отдаем браузеру Html-старницу (изменить)
app.get('/page_quarter_1_update', async (req,res)=>{
    fs.readFile('html/page_quarter_1_update.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })  
})
// Список оценок (1 четверть): Отдаем браузеру список всех оценок из БД
app.post('/quarter_1_list', async (req,res)=>{         
    const massOut = [] // Массив оценок, который мы будем передавать браузеру

    // Вытаскиваем из БД все оценки
    db_getGradesAll(1).then(data=>{        
        if (data !== null) {
            // Список оценок получен, затем..            
            
                // Получаем всех учеников, чтобы узнать их имена
                db_getStudentsAll().then(dataStudents=>{                
                    if (dataStudents != null) {                      
                        // Получаем все предметы, чтобы получить их имена
                        db_getSubjectsAll().then(dataSubjects=>{
                            if (dataSubjects != null) {                            
                    
                            if (data.length>0 && dataStudents.length > 0 && dataSubjects.length >0) {
                                for (let i=0; i<data.length; i++) {
                                    // id ученика
                                    const idStudent = data[i].id_student
                                    // id предмета
                                    const idSubject = data[i].id_subject

                                    let nameStudent = ""
                                    let nameSubject = ""

                                    // Ищем имя ученика по его id
                                    const mas_ind = dataStudents.findIndex((item) => item.id == idStudent)                            
                                    if (mas_ind != -1) {
                                        nameStudent = dataStudents[mas_ind].name

                                    }
                                    // Ищем имя предмета по его id
                                    const mas_ind2 = dataSubjects.findIndex( (item) => item.id == idSubject)                            
                                    if (mas_ind2 != -1) {
                                        nameSubject = dataSubjects[mas_ind2].name
                                    }
                                    // Добавляем полную строку оценки (для браузера)
                                    if (mas_ind != -1 && mas_ind2 != -1)
                                        massOut.push({id: data[i].id, name_student: nameStudent, name_subject: nameSubject, grade: data[i].grade})
                                    
                                }//i
                                // Отправляем браузеру список оценок                                
                                res.status(200).send(massOut)                            
                            }
                        }
                    })
                }                
            })            
        }        
    }) 
})

// Список оценок (1 четверть): Запомнить изменяемую оценку
app.post('/quarter_1_put_memory', async (req,res)=>{
    const dataId = req.body.id    // id изменяемой оценки (от браузера)
    // Вытаскиваем из БД изменяемую оценку по её id    
    db_getGradeById(1, dataId).then(data=> {        
        if (data !== null) {
            if (data.length > 0) {                
                // Запоминаем изменяемую оценку
                updatedQuarter = 1
                updatedQuarterID = data[0].id
                updatedQuarterStudentID = data[0].id_student
                updatedQuarterSubjectID = data[0].id_subject  
                updatedQuarterGrade = data[0].grade    
                // Ответ браузеру, что изменяемая оценка сохранена                
                res.status(200).send({goodMemory: true})                        
            } 
        }        
    }) 
})
// Список оценок (1 четверть): Вернуть браузеру изменяемую оценку
app.post('/quarter_1_get_memory', async (req,res)=>{        
    res.status(200).send({id: updatedQuarterID, id_student: updatedQuarterStudentID, id_subject: updatedQuarterSubjectID, grade: updatedQuarterGrade})
})

// Список оценок (1 четверть): Добавляем новую оценку в БД
app.post('/quarter_1_db_add', async (req,res)=>{
    const data_id_student = req.body.id_student   // id ученика
    const data_id_subject = req.body.id_subject   // id предмета
    const data_grade = req.body.grade               // оценка
       
    // Добавляем новую оценку в БД
    db_addGrade(1, data_id_student, data_id_subject, data_grade).then(data=>{        
        if (data !== null) {
            // Отправляем браузеру ответ, что добавили оценку
            res.status(200).send({goodAdded: true})                        
        }        
    })           
})
// Список оценок (1 четверть): Обновить оценку в БД
app.post('/quarter_1_db_update', async (req,res)=>{
    const data_id = req.body.id   // id оценки    
    const data_grade = req.body.grade     // оценка
       
    // Обновляем оценку в БД
    db_updateGrade(1, data_id, data_grade).then(data=>{        
        if (data !== null) {
            // Отправляем браузеру ответ, что обновили оценку
            res.status(200).send({goodUpdated: true})                        
        }        
    })           
})
// Список оценок (1 четверть): Удалить оценку из БД
app.post('/quarter_1_db_delete', async (req, res)=>{
    const dataId = req.body.id  // id удаляемой оценки (от браузера)
    // Удаляем оценку из БД
    db_deleteGrade(1, dataId).then(data=>{
        if (data !== null) {
            // Отправляем браузеру ответ, что удалили оценку
            res.status(200).send({goodDelete: true})                        
        }
    }) 
    
})

// --------------------------------------------------------------------------------------------------
//  РАБОТА СО СПИСКОМ ОЦЕНОК (2 ЧЕТВЕРТЬ) 
// --------------------------------------------------------------------------------------------------
// Список оценок (2 четверть): Отдаем браузеру Html-старницу (список)
app.get('/page_quarter_2', async (req,res)=>{
    fs.readFile('html/page_quarter_2.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })
})
// Список оценок (2 четверть): Отдаем браузеру Html-старницу (добавить)
app.get('/page_quarter_2_add', async (req,res)=>{
    fs.readFile('html/page_quarter_2_add.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })
})
// Список оценок (2 четверть): Отдаем браузеру Html-старницу (изменить)
app.get('/page_quarter_2_update', async (req,res)=>{
    fs.readFile('html/page_quarter_2_update.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })  
})
// Список оценок (2 четверть): Отдаем браузеру список всех оценок из БД
app.post('/quarter_2_list', async (req,res)=>{         
    const massOut = [] // Массив оценок, который мы будем передавать браузеру

    // Вытаскиваем из БД все оценки
    db_getGradesAll(2).then(data=>{        
        if (data !== null) {
            // Список оценок получен, затем..            

            // Получаем всех учеников, чтобы узнать их имена
            db_getStudentsAll().then(dataStudents=>{                
                if (dataStudents != null) {                      
                    // Получаем все предметы, чтобы получить их имена
                    db_getSubjectsAll().then(dataSubjects=>{
                        if (dataSubjects != null) {                            
                            if (data.length>0 && dataStudents.length > 0 && dataSubjects.length >0) {
                                for (let i=0; i<data.length; i++) {
                                    // id ученика
                                    const idStudent = data[i].id_student
                                    // id предмета
                                    const idSubject = data[i].id_subject

                                    let nameStudent = ""
                                    let nameSubject = ""

                                    // Ищем имя ученика по его id
                                    const mas_ind = dataStudents.findIndex((item) => item.id == idStudent)                            
                                    if (mas_ind != -1) {
                                        nameStudent = dataStudents[mas_ind].name

                                    }
                                    // Ищем имя предмета по его id
                                    const mas_ind2 = dataSubjects.findIndex( (item) => item.id == idSubject)                            
                                    if (mas_ind2 != -1) {
                                        nameSubject = dataSubjects[mas_ind2].name
                                    }
                                    // Добавляем полную строку оценки (для браузера)
                                    if (mas_ind != -1 && mas_ind2 != -1)
                                        massOut.push({id: data[i].id, name_student: nameStudent, name_subject: nameSubject, grade: data[i].grade})
                                    
                                }//i
                                // Отправляем браузеру список оценок                                
                                res.status(200).send(massOut)                            
                            }
                        }
                    })
                }                
            })            
        }        
    }) 
})

// Список оценок (2 четверть): Запомнить изменяемую оценку
app.post('/quarter_2_put_memory', async (req,res)=>{
    const dataId = req.body.id    // id изменяемой оценки (от браузера)
    // Вытаскиваем из БД изменяемую оценку по её id    
    db_getGradeById(2, dataId).then(data=> {        
        if (data !== null) {
            if (data.length > 0) {                
                // Запоминаем изменяемую оценку
                updatedQuarter = 2
                updatedQuarterID = data[0].id
                updatedQuarterStudentID = data[0].id_student
                updatedQuarterSubjectID = data[0].id_subject  
                updatedQuarterGrade = data[0].grade    
                // Ответ браузеру, что успешно запомнили                
                res.status(200).send({goodMemory: true})                        
            } 
        }        
    }) 
})
// Список оценок (2 четверть): Вернуть браузеру изменяемую оценку
app.post('/quarter_2_get_memory', async (req,res)=>{            
    res.status(200).send({id: updatedQuarterID, id_student: updatedQuarterStudentID, id_subject: updatedQuarterSubjectID, grade: updatedQuarterGrade})
})

// Список оценок (2 четверть): Добавляем новую оценку в БД
app.post('/quarter_2_db_add', async (req,res)=>{
    const data_id_student = req.body.id_student   // id ученика
    const data_id_subject = req.body.id_subject   // id предмета
    const data_grade = req.body.grade               // оценка
       
    // Добавляем новую оценку в БД
    db_addGrade(2, data_id_student, data_id_subject, data_grade).then(data=>{        
        if (data !== null) {
            // Отправляем браузеру ответ, что добавили оценку
            res.status(200).send({goodAdded: true})                        
        }        
    })           
})
// Список оценок (2 четверть): Обновить оценку в БД
app.post('/quarter_2_db_update', async (req,res)=>{
    const data_id = req.body.id   // id оценки    
    const data_grade = req.body.grade     // оценка
       
    // Обновляем оценку в БД
    db_updateGrade(2, data_id, data_grade).then(data=>{        
        if (data !== null) {
            // Отправляем браузеру ответ, что обновили оценку
            res.status(200).send({goodUpdated: true})                        
        }        
    })           
})
// Список оценок (2 четверть): Удалить оценку из БД
app.post('/quarter_2_db_delete', async (req, res)=>{
    const dataId = req.body.id  // id удаляемой оценки (от браузера)
    // Удаляем оценку из БД
    db_deleteGrade(2, dataId).then(data=>{
        if (data !== null) {
            // Отправляем браузеру ответ, что удалили оценку
            res.status(200).send({goodDelete: true})                        
        }
    })     
})

// --------------------------------------------------------------------------------------------------
//  РАБОТА СО СПИСКОМ ОЦЕНОК (3 ЧЕТВЕРТЬ) 
// --------------------------------------------------------------------------------------------------
// Список оценок (3 четверть): Отдаем браузеру Html-старницу (список)
app.get('/page_quarter_3', async (req,res)=>{
    fs.readFile('html/page_quarter_3.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })
})
// Список оценок (3 четверть): Отдаем браузеру Html-старницу (добавить)
app.get('/page_quarter_3_add', async (req,res)=>{
    fs.readFile('html/page_quarter_3_add.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })
})
// Список оценок (3 четверть): Отдаем браузеру Html-старницу (изменить)
app.get('/page_quarter_3_update', async (req,res)=>{
    fs.readFile('html/page_quarter_3_update.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })  
})
// Список оценок (3 четверть): Отдаем браузеру список всех оценок из БД
app.post('/quarter_3_list', async (req,res)=>{         
    const massOut = [] // Массив оценок, который мы будем передавать браузеру

    // Вытаскиваем из БД все оценки
    db_getGradesAll(3).then(data=>{        
        if (data !== null) {
            // Список оценок получен, затем..            

            // Получаем всех учеников, чтобы узнать их имена
            db_getStudentsAll().then(dataStudents=>{                
                if (dataStudents != null) {                      
                    // Получаем все предметы, чтобы получить их имена
                    db_getSubjectsAll().then(dataSubjects=>{
                        if (dataSubjects != null) {                            
                            if (data.length>0 && dataStudents.length > 0 && dataSubjects.length >0) {
                                for (let i=0; i<data.length; i++) {
                                    // id ученика
                                    const idStudent = data[i].id_student
                                    // id предмета
                                    const idSubject = data[i].id_subject

                                    let nameStudent = ""
                                    let nameSubject = ""

                                    // Ищем имя ученика по его id
                                    const mas_ind = dataStudents.findIndex((item) => item.id == idStudent)                            
                                    if (mas_ind != -1) {
                                        nameStudent = dataStudents[mas_ind].name

                                    }
                                    // Ищем имя предмета по его id
                                    const mas_ind2 = dataSubjects.findIndex( (item) => item.id == idSubject)                            
                                    if (mas_ind2 != -1) {
                                        nameSubject = dataSubjects[mas_ind2].name
                                    }
                                    // Добавляем полную строку оценки (для браузера)
                                    if (mas_ind != -1 && mas_ind2 != -1)
                                        massOut.push({id: data[i].id, name_student: nameStudent, name_subject: nameSubject, grade: data[i].grade})
                                    
                                }//i
                                // Отправляем браузеру список оценок                                
                                res.status(200).send(massOut)                            
                            }
                        }
                    })
                }                
            })            
        }        
    }) 
})

// Список оценок (3 четверть): Запомнить изменяемую оценку
app.post('/quarter_3_put_memory', async (req,res)=>{
    const dataId = req.body.id    // id изменяемой оценки (от браузера)
    // Вытаскиваем из БД изменяемую оценку по её id    
    db_getGradeById(3, dataId).then(data=> {        
        if (data !== null) {
            if (data.length > 0) {                
                // Запоминаем изменяемую оценку
                updatedQuarter = 3
                updatedQuarterID = data[0].id
                updatedQuarterStudentID = data[0].id_student
                updatedQuarterSubjectID = data[0].id_subject  
                updatedQuarterGrade = data[0].grade    
                // Ответ браузеру, что успешно запомнили                
                res.status(200).send({goodMemory: true})                        
            } 
        }        
    }) 
})
// Список оценок (3 четверть): Вернуть браузеру изменяемую оценку
app.post('/quarter_3_get_memory', async (req,res)=>{            
    res.status(200).send({id: updatedQuarterID, id_student: updatedQuarterStudentID, id_subject: updatedQuarterSubjectID, grade: updatedQuarterGrade})
})

// Список оценок (3 четверть): Добавляем новую оценку в БД
app.post('/quarter_3_db_add', async (req,res)=>{
    const data_id_student = req.body.id_student   // id ученика
    const data_id_subject = req.body.id_subject   // id предмета
    const data_grade = req.body.grade               // оценка
       
    // Добавляем новую оценку в БД
    db_addGrade(3, data_id_student, data_id_subject, data_grade).then(data=>{        
        if (data !== null) {
            // Отправляем браузеру ответ, что добавили оценку
            res.status(200).send({goodAdded: true})                        
        }        
    })           
})
// Список оценок (3 четверть): Обновить оценку в БД
app.post('/quarter_3_db_update', async (req,res)=>{
    const data_id = req.body.id   // id оценки    
    const data_grade = req.body.grade     // оценка
       
    // Обновляем оценку в БД
    db_updateGrade(3, data_id, data_grade).then(data=>{        
        if (data !== null) {
            // Отправляем браузеру ответ, что обновили оценку
            res.status(200).send({goodUpdated: true})                        
        }        
    })           
})
// Список оценок (3 четверть): Удалить оценку из БД
app.post('/quarter_3_db_delete', async (req, res)=>{
    const dataId = req.body.id  // id удаляемой оценки (от браузера)
    // Удаляем оценку из БД
    db_deleteGrade(3, dataId).then(data=>{
        if (data !== null) {
            // Отправляем браузеру ответ, что удалили оценку
            res.status(200).send({goodDelete: true})                        
        }
    })     
})

// --------------------------------------------------------------------------------------------------
//  РАБОТА СО СПИСКОМ ОЦЕНОК (4 ЧЕТВЕРТЬ) 
// --------------------------------------------------------------------------------------------------
// Список оценок (4 четверть): Отдаем браузеру Html-старницу (список)
app.get('/page_quarter_4', async (req,res)=>{
    fs.readFile('html/page_quarter_4.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })
})
// Список оценок (4 четверть): Отдаем браузеру Html-старницу (добавить)
app.get('/page_quarter_4_add', async (req,res)=>{
    fs.readFile('html/page_quarter_4_add.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })
})
// Список оценок (4 четверть): Отдаем браузеру Html-старницу (изменить)
app.get('/page_quarter_4_update', async (req,res)=>{
    fs.readFile('html/page_quarter_4_update.html', (err, data) => {
        if (err) throw err; 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data); 
        res.end();
    })  
})
// Список оценок (4 четверть): Отдаем браузеру список всех оценок из БД
app.post('/quarter_4_list', async (req,res)=>{         
    const massOut = [] // Массив оценок, который мы будем передавать браузеру

    // Вытаскиваем из БД все оценки
    db_getGradesAll(4).then(data=>{        
        if (data !== null) {
            // Список оценок получен, затем..            

            // Получаем всех учеников, чтобы узнать их имена
            db_getStudentsAll().then(dataStudents=>{                
                if (dataStudents != null) {                      
                    // Получаем все предметы, чтобы получить их имена
                    db_getSubjectsAll().then(dataSubjects=>{
                        if (dataSubjects != null) {                            
                            if (data.length>0 && dataStudents.length > 0 && dataSubjects.length >0) {
                                for (let i=0; i<data.length; i++) {
                                    // id ученика
                                    const idStudent = data[i].id_student
                                    // id предмета
                                    const idSubject = data[i].id_subject

                                    let nameStudent = ""
                                    let nameSubject = ""

                                    // Ищем имя ученика по его id
                                    const mas_ind = dataStudents.findIndex((item) => item.id == idStudent)                            
                                    if (mas_ind != -1) {
                                        nameStudent = dataStudents[mas_ind].name

                                    }
                                    // Ищем имя предмета по его id
                                    const mas_ind2 = dataSubjects.findIndex( (item) => item.id == idSubject)                            
                                    if (mas_ind2 != -1) {
                                        nameSubject = dataSubjects[mas_ind2].name
                                    }
                                    // Добавляем полную строку оценки (для браузера)
                                    if (mas_ind != -1 && mas_ind2 != -1)
                                        massOut.push({id: data[i].id, name_student: nameStudent, name_subject: nameSubject, grade: data[i].grade})
                                    
                                }//i
                                // Отправляем браузеру список оценок                                
                                res.status(200).send(massOut)                            
                            }
                        }
                    })
                }                
            })            
        }        
    }) 
})

// Список оценок (4 четверть): Запомнить изменяемую оценку
app.post('/quarter_4_put_memory', async (req,res)=>{
    const dataId = req.body.id    // id изменяемой оценки (от браузера)
    // Вытаскиваем из БД изменяемую оценку по её id    
    db_getGradeById(4, dataId).then(data=> {        
        if (data !== null) {
            if (data.length > 0) {                
                // Запоминаем изменяемую оценку
                updatedQuarter = 4
                updatedQuarterID = data[0].id
                updatedQuarterStudentID = data[0].id_student
                updatedQuarterSubjectID = data[0].id_subject  
                updatedQuarterGrade = data[0].grade    
                // Ответ браузеру, что успешно запомнили                
                res.status(200).send({goodMemory: true})                        
            } 
        }        
    }) 
})
// Список оценок (4 четверть): Вернуть браузеру изменяемую оценку
app.post('/quarter_4_get_memory', async (req,res)=>{            
    res.status(200).send({id: updatedQuarterID, id_student: updatedQuarterStudentID, id_subject: updatedQuarterSubjectID, grade: updatedQuarterGrade})
})

// Список оценок (4 четверть): Добавляем новую оценку в БД
app.post('/quarter_4_db_add', async (req,res)=>{
    const data_id_student = req.body.id_student   // id ученика
    const data_id_subject = req.body.id_subject   // id предмета
    const data_grade = req.body.grade               // оценка
       
    // Добавляем новую оценку в БД
    db_addGrade(4, data_id_student, data_id_subject, data_grade).then(data=>{        
        if (data !== null) {
            // Отправляем браузеру ответ, что добавили оценку
            res.status(200).send({goodAdded: true})                        
        }        
    })           
})
// Список оценок (4 четверть): Обновить оценку в БД
app.post('/quarter_4_db_update', async (req,res)=>{
    const data_id = req.body.id   // id оценки    
    const data_grade = req.body.grade     // оценка
       
    // Обновляем оценку в БД
    db_updateGrade(4, data_id, data_grade).then(data=>{        
        if (data !== null) {
            // Отправляем браузеру ответ, что обновили оценку
            res.status(200).send({goodUpdated: true})                        
        }        
    })           
})
// Список оценок (4 четверть): Удалить оценку из БД
app.post('/quarter_4_db_delete', async (req, res)=>{
    const dataId = req.body.id  // id удаляемой оценки (от браузера)
    // Удаляем оценку из БД
    db_deleteGrade(4, dataId).then(data=>{
        if (data !== null) {
            // Отправляем браузеру ответ, что удалили оценку
            res.status(200).send({goodDelete: true})                        
        }
    })     
})