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
    const menuOpts = [
        "View All Departments",
        "View All Roles",
        "View All Employees",
        "View Employees by Manager",
        "View Employees by Department",
        "View A Department Budget",
        "Add A Department",
        "Add A Role",
        "Add An Employee",
        "Update An Employee's Role",
        "Update An Employee's Manager",
        "Delete A Department",
        "Delete A Role",
        "Delete An Employee",
        "Exit"
    ]

    const menu = await inquirer.prompt([
        {
            name: "select",
            type: "list",
            loop: "false",
            pageSize: menuOpts.length,
            choices: menuOpts,
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

        case "View Employees by Manager":
            viewEmployeesbyManager();
            break;

        case "View Employees by Department":
            viewEmployeesbyDepartment();
            break;

        case "View A Department Budget":
            viewADepartmentBudget();
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

        case "Update An Employee's Manager":
            updateEmployeeManager();
            break;

        case "Delete A Department":
            deleteDepartment();
            break;

        case "Delete A Role":
            deleteRole();
            break;

        case "Delete An Employee":
            deleteEmployee();
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
        init();
    });
};

// Displays all the subordinates for a given manager
function viewEmployeesbyManager() {
    db.promise().query(
        `SELECT
            CONCAT(first_name," ",last_name) AS name, id
        FROM employees`
    ).then(async ([rows])=>{
        const manager = await inquirer.prompt([
            {
                name: "select",
                type: "list",
                choices: rows,
                loop: false,
                pageSize: rows.length,
                message: "Please select an employee to view their subordinates."
            }
        ]);

        // Finds the user-provided manager's id
        const managerId = idFinder(rows,manager.select);

        // Joins tables to output employee names, ids, and titles
        db.promise().query(
            `SELECT
                CONCAT(employees.first_name," ",employees.last_name) as Name,
                employees.id AS ID,
                roles.title AS JobTitle
            FROM employees
            JOIN employees as managers
            ON employees.manager_id = managers.id
            JOIN roles
            ON employees.role_id = roles.id
            WHERE employees.manager_id = ?`,
        [managerId]).then(([rows])=>{
            // Checks if output is empty, giving a message if it is
            if(rows[0]){
                console.table(rows);
            } else {
                console.log(`\n${manager.select} has no subordinates!\n`)
            }
        }).then(()=>{
            init();
        });
    })
}

// Displays all the employees in a given department
function viewEmployeesbyDepartment() {
    db.promise().query(
        `SELECT name, id FROM departments`
    ).then(async ([rows])=>{
        const dept = await inquirer.prompt([
            {
                name: "select",
                type: "list",
                choices: rows,
                loop: false,
                pageSize: rows.length,
                message: "Please select an department to view it's employees."
            }
        ]);

        // Finds the user-provided department's id
        const deptId = idFinder(rows,dept.select);

        // Joins tables to output employee names, ids, and titles
        db.promise().query(
            `SELECT
                CONCAT(employees.first_name," ",employees.last_name) as Name,
                employees.id AS ID,
                roles.title AS JobTitle
            FROM employees
            JOIN roles
            ON employees.role_id = roles.id
            JOIN departments
            ON roles.department_id = departments.id
            WHERE departments.id = ?`,
        [deptId]).then(([rows])=>{
            // Checks if output is empty, giving a message if it is
            if(rows[0]){
                console.table(rows);
            } else {
                console.log(`\nThe ${dept.select} Department has no employees!}\n`)
            }
        }).then(()=>{
            init();
        });
    })
}

// Shows budgets of selected department
function viewADepartmentBudget() {
    // Retrieves departments for selection
    db.promise().query(
        `SELECT name, id FROM departments`,
    ).then(async ([rows])=>{
        const department = await inquirer.prompt ([
            {
                name: "select",
                type: "list",
                choices: rows,
                loop: false,
                pageSize: rows.length,
                message: "Please select a department to view their budget."
            }
        ])

        // Finds the department ID
        const deptId = idFinder(rows,department.select);

        // This query could easily be modified to show all budgets, by removing the WHERE
        db.promise().query(
            `SELECT
                departments.name AS name,
                SUM(salary) AS budget
            FROM employees
            JOIN roles
            ON employees.role_id = roles.id
            RIGHT JOIN departments
            ON roles.department_id = departments.id
            WHERE departments.id = ?`,
        [deptId]).then(([rows])=>{
            // Checks if the budget is null, meaning there are no employees
            if(rows[0].budget===null){
                console.log(`\nNo employees in the ${rows[0].name} department!\n`)
            } else{
                console.log(`\nThe budget of the ${rows[0].name} Department is ${rows[0].budget} dollars.\n`);
            }
        }).then(()=>{
            init();
        });
    })
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
            console.log("Added",roleInfo.name);
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

// Allows a user to update the manager of an employee
function updateEmployeeManager() {
    // Retrieves list of employees for user selection
    db.promise().query(
        `SELECT CONCAT(first_name," ",last_name) AS name, id FROM employees`
    ).then(async function([rows]) {
        const employees = rows
        const select = await inquirer.prompt([
            {
                name: "employee",
                type: "list",
                choices: rows,
                loop: false,
                pageSize: rows.length,
                message: "Please select an employee to update."
            },
            {
                name: "manager",
                type: "list",
                choices: rows,
                loop: false,
                pageSize: rows.length,
                message: "Please select a manager for this employee"
            }
        ])

        // This lets us find the ID for the correlating employee
        const empId = idFinder(employees,select.employee)
        const managerId = idFinder(employees,select.manager)

        // Changes user-selected employee's role to the new role
        db.promise().query(
            `UPDATE employees
            SET manager_id = ?
            WHERE id = ?`,
        [managerId,empId]).then(()=>{
            console.log(`${select.employee}'s manager is now: ${select.manager}.`);
            init();
        })
    })
};


// DELETE FUNCTIONS
// ==============================

function deleteDepartment(){
    // Retrieves departments for selection
    db.promise().query(
        `SELECT name, id FROM departments`,
    ).then(async ([rows])=>{
        const department = await inquirer.prompt ([
            {
                name: "select",
                type: "list",
                choices: rows,
                loop: false,
                pageSize: rows.length,
                message: "Please select a department to delete."
            }
        ])

        // Finds the department ID
        const deptId = idFinder(rows,department.select);

        db.promise().query(
            `DELETE FROM departments
            WHERE id = ?`,
        [deptId]).then(()=>{
            console.log(`\nDeleted the ${department.select} Department.\n`);
            init();
        })
    });
}

function deleteRole(){
    // Retrieves roles for selection
    db.promise().query(
        `SELECT title AS name, id FROM roles`,
    ).then(async ([rows])=>{
        const role = await inquirer.prompt ([
            {
                name: "select",
                type: "list",
                choices: rows,
                loop: false,
                pageSize: rows.length,
                message: "Please select a role to delete."
            }
        ])

        // Finds the role ID
        const roleId = idFinder(rows,role.select);

        db.promise().query(
            `DELETE FROM roles
            WHERE id = ?`,
        [roleId]).then(()=>{
            console.log(`\nDeleted the ${role.select} Role.\n`);
            init();
        })
    });
}

// Deletes a user-selected employee
function deleteEmployee(){
    // Retrieves employees for selection
    db.promise().query(
        `SELECT CONCAT(first_name," ",last_name) AS name, id FROM employees`,
    ).then(async ([rows])=>{
        const employee = await inquirer.prompt ([
            {
                name: "select",
                type: "list",
                choices: rows,
                loop: false,
                pageSize: rows.length,
                message: "Please select a employee's records to delete."
            }
        ])

        // Finds the employee ID
        const employeeId = idFinder(rows,employee.select);

        db.promise().query(
            `DELETE FROM employees
            WHERE id = ?`,
        [employeeId]).then(()=>{
            console.log(`\nDeleted ${employee.select}'s records.\n`);
            init();
        })
    });
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