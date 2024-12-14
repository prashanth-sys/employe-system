const express = require("express")
const {open} = require("sqlite")
const sqlite3 = require("sqlite3")
const path = require("path")
const bcrypt = require("bcrypt")
const app = express() 
const dbPath = path.join(__dirname, "Employee-System.db") 
let db = null 
app.use(express.json())

const initializeDBAndServer = async () => {
    try{
        db = await open({
            filename:dbPath,
            driver:sqlite3.Database
        });
        app.listen(3000, () => {
            console.log("Server Running at http://localhost:3000/")
        });
    }catch (e) {
        console.log(`DB Error: ${e.message}`)
        process.exit(1)
    }
} 

initializeDBAndServer()

// The above code for connection of database 

// APIs For All Of The Employee Management System (CURD) Operations 

app.post("/users", async(request,response) => {
    const {username, email,password} = request.body 
    const hasedPassword = await bcrypt.hash(request.body.password, 10)
    const selectUserQuery = `SELECT * FROM users WHERE username = '${username}';`;
    const dbUser = await db.get(selectUserQuery) 
    if (dbUser === undefined){
        const createUserQuery = `
        INSERT INTO 
        users (username, email, password)
        VALUES 
        (
        "${username}",
        "${email}",
        "${hasedPassword}"
        );
        `; 
        const dbResponse = await db.run(createUserQuery)
        response.send("Created New User")
    } else{
        response.status(400)
        response.send("User Already Existed")
    }
})

// GET API 

app.get("/employees/", async(request,response) => {
    const getEmployeeQuery = `
    SELECT 
    *
    FROM 
    employees 
    ORDER BY 
    id;`; 
    const employeeArray = await db.all(getEmployeeQuery)
    response.send(employeeArray)
}); 

// POST API

app.post("/employee/", async(request,response) => {
    const employeeDetails = request.body 
    const {name, email, position, department, salary} = employeeDetails 
    const addEmployeeQuery = `
    INSERT INTO 
    employees (name,email,position,department,salary) 
    VALUES
    (
    "${name}",
    "${email}",
    "${position}",
    "${department}",
    "${salary}"
    );`;
    const dbResponse = await db.run(addEmployeeQuery)
    response.send("Employee Details Uploaded Successfully")
}); 

// GET API for specific employee

app.get("/employee/:id", async (request,response) => {
    const {id} = request.params 
    const getEmployeeQuery = `
    SELECT 
    *
    FROM 
    employees 
    WHERE 
    id = ${id};`; 
    const employeeDetails = await db.get(getEmployeeQuery)
    response.send(employeeDetails)
});  

// PUT API

app.put("/employee/:id", async(request,response) => {
    const {id} = request.params 
    const employeeDetails = request.body 
    const {name, email, position, department, salary} = employeeDetails 
    const updateEmployeeDetails = `
    UPDATE 
    employees 
    SET 
    name = "${name}",
    email = "${email}",
    position = "${position}",
    department = "${department}",
    salary = "${salary}" 
    WHERE 
    id = ${id};`;
    await db.run(updateEmployeeDetails)
    response.send("Employee Details Updated Successfully")
}); 

// DELETE API 

app.delete("/employee/:id", async(request,response) => {
    const {id} = request.params 
    const deleteEmployee = `
    DELETE FROM  
    employees 
    WHERE 
    id = ${id};`;
    await db.run(deleteEmployee)
    response.send("Successfully Deleted Employee Details")
})