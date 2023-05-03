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

        case "View All Departments":
            db.promise().query(
                `SELECT
                    name AS Department,
                    id as ID
                FROM departments`,
            ).then( ([rows,fields]) =>{
                console.table(rows);
            }).then(()=>{
                init();
            });
            break;

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

        case "Add A Department":
            console.log("WIP...adding a department");
            init();
            break;

        case "Add A Role":
            console.log("WIP...adding a role");
            init();
            break;

        case "Add An Employee":
            console.log("WIP...adding an employee");
            init();
            break;

        case "Update An Employee's Role":
            console.log("WIP...updating an employee's role");
            init();
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