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

// This function handles the options selection
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
                // TODO: View Employees by Manager
                // TODO: View Employees by Department
                // TODO: View Total Department Budgets
                "Add A Department",
                "Add A Role",
                "Add An Employee",
                "Update An Employee's Role",
                // TODO: Update Employee Managers
                // TODO: Delete A Department
                // TODO: Delete A Role
                // TODO: Delete An Employee
                "Exit"
            ],
            message: "Please select an operation."
        }
    ])

    switch(menu.select) {

        case "View All Departments":
            viewDepartment();
            break;

        case "View All Roles":
            viewRoles();
            break;

        case "View All Employees":
            viewEmployees();
            break;

        case "Add A Department":
            addDepartment();
            break;

        case "Add A Role":
            addRole();
            break;

        case "Add An Employee":
            addEmployee();
            break;

        case "Update An Employee's Role":
            updateEmployeeRole();
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

// VIEW FUNCTIONS
// ==============================

// Displays all departments and their id, with aliases for better reading
function viewDepartment() {
    db.promise().query(
        `SELECT
            name AS Department,
            id as ID
        FROM departments`,
    ).then( ([rows]) =>{
        console.table(rows);
    }).then(()=>{
        init();
    });  
};


// Displays all roles and their associated departments and salaries, with aliases
function viewRoles() {
    db.promise().query(
        `SELECT
            roles.title AS JobTitle,
            roles.id AS ID,
            departments.name AS Department,
            roles.salary as Salary
        FROM departments
        JOIN roles
        ON departments.id = roles.department_id`,
    ).then( ([rows])=>{
        console.table(rows);
    }).then(()=>{
        init()
    });
};

// Displays all employees, their id, role, department, salary, and manager
function viewEmployees() {
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
    ).then( ([rows])=>{
        console.table(rows);
    }).then(()=>{
        init()
    });
};

// ADD FUNCTIONS
// ==============================

// Allows a user to add a new department
async function addDepartment() {
    // Getting new department name from user
    const newDept = await inquirer.prompt([
        {
            name: "department",
            type: "input",
            message: "Please enter the name of the new department."
        }
    ]);

    // Adds new department to departments table
    db.promise().query(
        `INSERT INTO departments(name) VALUES (?)`,
    [newDept.department]).then(()=>{
        console.log("Added",newDept.department);
        init();
    });
}

// Allows user to add a new employee
function addRole() {
    // Pulls department names and ids for list prompt
    db.promise().query(
        `SELECT name, id FROM departments`
    ).then(async function([rows]) {
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

        // Finds ID of user-selected department
        const deptId = idFinder(rows,roleDept.name)
        
        // Retrieves more user-defined information
        const roleInfo = await inquirer.prompt([
            {
                name: "name",
                type: "input",
                message: "Please enter the role's title."
            },
            {
                name: "salary",
                type: "input",
                message: "Please enter the role's salary."
            }
        ]);
        
        // Adds new role to roles table
        db.promise().query(
            `INSERT INTO roles(title,salary,department_id)
                VALUES
                (?,?,?)`,
        [roleInfo.name,roleInfo.salary,deptId]).then(()=>{
            console.log("Added",roleTitle.name);
            init();
        });
    });
}

// Allows user to add a new employee
function addEmployee() {
    // Retrieves list of roles for selection
    db.promise().query(
        `SELECT title AS name, id FROM roles`
    ).then(async function([rows]) {
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

        // Gets ID of user-selected role
        const roleId = idFinder(roles,newEmp.role);

        // Retrieves list of employees for manager selection
        db.promise().query(
            `SELECT CONCAT(first_name," ",last_name) AS name, id FROM employees`
        ).then(async function ([rows]) {

            // Appends a "No Manager" option to the front of the manager list
            const noManager = {
                name: 'No Manager',
                id: null
            }
            rows.unshift(noManager)

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

            // Gets ID of user-selected manager
            const managerId = idFinder(rows,manager.select);

            // Adds new employee to database
            db.promise().query(
                `INSERT INTO employees(first_name, last_name, role_id, manager_id)
                VALUES (?,?,?,?)`,
            [newEmp.firstName,newEmp.lastName,roleId,managerId]).then(()=>{
                console.log(`Added the ${newEmp.role}, ${newEmp.firstName} ${newEmp.lastName}, to the database.`)
                init();
            })
        })
    });
}

// UPDATE FUNCTIONS
// ==============================

// Allows a user to update the role of an employee
function updateEmployeeRole() {
    // Retrieves list of employees for user selection
    db.promise().query(
        `SELECT CONCAT(first_name," ",last_name) AS name, id FROM employees`
    ).then(async function([rows]) {
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
        
        // Retrieves list of roles for user selection
        db.promise().query(
            `SELECT title AS name, id FROM roles`,
        ).then(async function([rows]) {
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

            // Changes user-selected employee's role to the new role
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
}

// HELPER FUNCTIONS
// ==============================

// Used to find IDs of SQL data
// MUST format query with the desired search column as name, and the return
// column as id
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