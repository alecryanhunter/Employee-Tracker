// USER STORY
// AS A business owner
// I WANT to be able to view and manage the departments, roles, and employees in my company
// SO THAT I can organize and plan my business

// ACCEPTANCE CRITERIA
// GIVEN a command-line application that accepts user input
// WHEN I start the application
// THEN I am presented with the following options: view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role
// WHEN I choose to view all departments
// THEN I am presented with a formatted table showing department names and department ids
// WHEN I choose to view all roles
// THEN I am presented with the job title, role id, the department that role belongs to, and the salary for that role
// WHEN I choose to view all employees
// THEN I am presented with a formatted table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
// WHEN I choose to add a department
// THEN I am prompted to enter the name of the department and that department is added to the database
// WHEN I choose to add a role
// THEN I am prompted to enter the name, salary, and department for the role and that role is added to the database
// WHEN I choose to add an employee
// THEN I am prompted to enter the employee’s first name, last name, role, and manager, and that employee is added to the database
// WHEN I choose to update an employee role
// THEN I am prompted to select an employee to update and their new role and this information is updated in the database

// ==============================

// View All Departments
    // Department Name
    // Department ID
// View All Roles
    // Job Title
    // Role ID
    // Relevant Department
    // Salary
// View All Employees
    // Employee ID
    // First Name
    // Last Name
    // Job Titles
    // Departments
    // Salaries
    // Managers

// Add a Department
    // Department Name
// Add a Role
    // Role Name
    // Salary
    // Relevant Department
// Add an Employee
    // First Name
    // Last Name
    // Role
    // Manager

// Update Employee Role
    // Select Employee
    // New Role

// Update Employee Managers
// View Employees by Manager
// View Employees by Department
// Delete departments, roles, and employees
// View total budget of a department

const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");

const db = mysql.createConnection(
    {
        host:"localhost",
        user:"root",
        password:"password",
        database:"employee_db"
    },
    console.log("Connected to the employee database")
);

async function init() {

    const menu = await inquirer.prompt([
        {
            name: "select",
            type: "list",
            loop: "false",
            pageSize: "8",
            choices: [
                "View All Departments",
                "View All Roles",
                "View All Employees",
                "Add A Department",
                "Add A Role",
                "Add An Employee",
                "Update An Employee's Role",
                "Exit"
            ],
            message: "Please select an operation."
        }
    ])

    switch(menu.select) {

        // done
        case "View All Departments":
            db.promise().query(
                `SELECT
                    name AS Department,
                    id as ID
                FROM departments`,
            ).then( ([array,fields]) =>{
                console.table(rows);
            }).then(()=>{
                init();
            });
            break;

        // done
        case "View All Roles":
            db.promise().query(
                `SELECT
                    roles.title AS JobTitle,
                    roles.id AS ID,
                    departments.name AS Department,
                    roles.salary as Salary
                FROM departments
                JOIN roles
                ON departments.id = roles.department_id`,
            ).then( ([rows,fields])=>{
                console.table(rows);
            }).then(()=>{
                init()
            });
            break;

        // done
        case "View All Employees":
            console.log("WIP...showing all employees");
            db.promise().query(
                `SELECT
                    CONCAT(employees.first_name,' ',employees.last_name) AS EmployeeName,
                    employees.id AS ID,
                    roles.title AS JobTitle,
                    departments.name AS Department,
                    roles.salary AS Salary,
                    CONCAT(managers.first_name,' ',managers.last_name) AS ManagerName
                FROM employees
                LEFT JOIN employees AS managers
                ON employees.manager_id = managers.id
                JOIN roles
                ON employees.role_id = roles.id
                JOIN departments
                ON roles.department_id = departments.id`
            ).then( ([rows,fields])=>{
                console.table(rows);
            }).then(()=>{
                init()
            });
            break;

        // done
        case "Add A Department":
            const newDept = await inquirer.prompt([
                {
                    name: "department",
                    type: "input",
                    message: "Please enter the name of the new department."
                }
            ]);
            db.promise().query(
                `INSERT INTO departments(name)
                    VALUES
                    (?)`,
            [newDept.department]).then(()=>{
                console.log("Added",newDept.department);
                init();
            });
            break;

        // done
        case "Add A Role":
            db.promise().query(
                `SELECT name FROM departments`
            ).then(async function([rows,fields]) {
                console.log(rows);
                const roleDept = await inquirer.prompt([
                    {
                        name: "name",
                        type: "list",
                        choices: rows,
                        loop: false,
                        pageSize: rows.length,
                        message: "Please select the department to add the role to."
                    }
                ]);
                console.log(roleDept.name)
                db.promise().query(
                    `SELECT id FROM departments WHERE name = ?`,
                [roleDept.name]).then(async function([rows,fields]){
                    const deptId = Object.values(rows[0])[0]
                    const roleTitle = await inquirer.prompt([
                        {
                            name: "name",
                            type: "input",
                            message: "Please enter the role's title."
                        }
                    ]);
                    const salary = await inquirer.prompt([
                        {
                            name: "salary",
                            type: "input",
                            message: "Please enter the role's salary."
                        }
                    ]);
                    db.promise().query(
                        `INSERT INTO roles(title,salary,department_id)
                            VALUES
                            (?,?,?)`,
                    [roleTitle.name,salary.salary,deptId]).then(()=>{
                        console.log("Added",roleTitle.name);
                        init();
                    });
                });
            });
            break;

        // done
        case "Add An Employee":
            db.promise().query(
                `SELECT title AS name, id FROM roles`
            ).then(async function([rows,fields]) {
                const roles = rows
                const newEmp = await inquirer.prompt([
                    {
                        name: "firstName",
                        type: "input",
                        message: "Please enter the new employee's first name."
                    },
                    {
                        name: "lastName",
                        type: "input",
                        message: "Please enter the new employee's last name."
                    },
                    {
                        name: "role",
                        type: "list",
                        choices: rows,
                        loop: false,
                        pageSize: rows.length,
                        message: "Please select the new employee's role."
                    }
                ])

                const roleId = idFinder(roles,newEmp.role);

                db.promise().query(
                    `SELECT CONCAT(first_name," ",last_name) AS name, id FROM employees`
                ).then(async function ([rows,fields]) {
                    // This adds an option to the beginning of the array for the
                    // employee to have no manager, setting the manager_id to null
                    const noManager = {
                        name: 'No Manager',
                        id: null
                    }
                    rows.unshift(noManager)
                    console.log(rows);
                    const manager = await inquirer.prompt([
                        {
                            name: "select",
                            type: "list",
                            choices: rows,
                            loop: false,
                            pageSize: rows.length,
                            message: "Please select the new employee's manager."
                        }
                    ])

                    const managerId = idFinder(rows,manager.select);

                    console.log(newEmp.firstName)
                    console.log(newEmp.lastName)
                    console.log(roleId)
                    console.log(managerId)
                    db.promise().query(
                        `INSERT INTO employees(first_name, last_name, role_id, manager_id)
                        VALUES (?,?,?,?)`,
                    [newEmp.firstName,newEmp.lastName,roleId,managerId]).then(()=>{
                        console.log(`Added the ${newEmp.role}, ${newEmp.firstName} ${newEmp.lastName}, to the database.`)
                        init();
                    })
                })
            })
            break;

        // done
        case "Update An Employee's Role":
            db.promise().query(
                `SELECT CONCAT(first_name," ",last_name) AS name, id FROM employees`
            ).then(async function([rows,fields]) {
                const employees = rows
                const empSelect = await inquirer.prompt([
                    {
                        name: "select",
                        type: "list",
                        choices: rows,
                        loop: false,
                        pageSize: rows.length,
                        message: "Please select an employee to update."
                    }
                ])

                // This lets us find the ID for the correlating employee
                const empId = idFinder(employees,empSelect.select)
                
                db.promise().query(
                    `SELECT title AS name, id FROM roles`,
                ).then(async function([rows,fields]) {
                    const roles = rows;
                    const roleSelect = await inquirer.prompt([
                        {
                            name: "select",
                            type: "list",
                            choices: rows,
                            loop: false,
                            pageSize: rows.length,
                            message: "Please select the new role for the employee."
                        }
                    ])

                    // This finds the ID of the corresponding role
                    const roleId = idFinder(roles,roleSelect.select)

                    db.promise().query(
                        `UPDATE employees
                        SET role_id = ?
                        WHERE id = ?`,
                    [roleId,empId]).then(()=>{
                        console.log(`${empSelect.select}'s role is now: ${roleSelect.select}.`);
                        init();
                    })
                })
            })
            break;

        case "Exit":
            console.log("Press Ctrl+C to end the program!");
            break;

        default: 
            console.log("Something has gone wrong...");
            break;
    }

    return;
}

init();

// This is a helper function I constructed that interfaces with SQL queries and
// Inquirer to find an ID based on an Inquirer selection.
// 'array' is the rows output of a query, with the 1st column being called 'name'
// and the 2nd column being called id
// 'match' is just whatever item you selected from that array you'd like to find
function idFinder(array, match) {
    let index
        for (i=0;i<array.length;i++) {
            if (array[i].name === match){
                index = i
                break;
            }
        }
    const id = array[index].id;
    return id;
}