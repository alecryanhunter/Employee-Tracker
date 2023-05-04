# Employee Tracker

## Description
This is a command-line database tool that helps you manage and keep track of your employees. It utilizes Inquirer to create the command line interaction, and MySQL2 to interact with the database. It also uses console.table to print SQL tables to the console in a more aesthetically pleasing manner.

This program allows you to view the database in multiple different ways, as well as adding and deleting rows to the three tables in the database. It currently has limited capacity to update data.

This program was at first a very large struggle to even get started on, since I struggled with this section. However, after I got the initial templates down, it started to click. The different routes are not too dissimilar, allowing me to re-use and modify different parts of my code. This made it easy to add additional selection options.

## Usage
A video demonstrating this program can be found [here]().

After following the [Installation](#installation) instructions below, run the command `npm start` in the main directory. Then just select whichever options you'd like to use.

## Program Options
This is an in-depth description of the options available in the program.

### View All Departments
This gives a table of all the departments in the database, and their corresponding IDs.
### View All Roles
This gives a table of all the roles in the databse, and their corresponding IDs and salaries.
### View All Employees
This gives a table of all the employees in the databse, as well as their IDs, job titles, departments, salaries, and managers.
### View Employees By Manager
This allows the user to select a manager, and a list of their subordinates, along with their job titles and IDs, will be printed. If the selected employee has no subordinates, it will inform the user and send them back to the main menu.
### View Employees By Department
This allows the user to select a department, which will print all employees in that department, along with their job titles and IDs. The program will inform the user if that department has no employees.
### View A Department Budget
This allows the user to select a department, and it will print the budget for that department. If no employees exist in that department (meaning no budget), it will inform the user.
### Add Options
Each of the three "Add A(n) ___" options allow the user to enter a new row into the respective table by following the prompts.
### Update An Employee's Role
This prompts a user to select an employee, then their new role. It will then update their role in the database.
### Update An Employee's Manager
This prompts the user to select two employees. The first will be the employee whose manager will be changed, and the second is the first's new manager.
### Delete Options
Each of the three "Delete A(n) ___" options allow the user to select a respective entry in the table to delete.

## Installation
Follow these instructions in order to use this program on your local machine.

1. Clone the repository to your local machine.
2. Navigate to the Employee-Tracker folder.
3. Run the `npm i` command.
4. Login to MySql using the command `mysql -uUSER -pPASSWORD`, replacing `USER` and `PASSWORD` with your relevant credentials.
5. In the SQL command line, run the commands `SOURCE db/schema.sql;` and `SOURCE db/seeds.sql;` in that order, then `exit` your SQL command line.

## Future Development
This project is one that I see a lot of potential for refinement in. My code is clunky and poorly organized, and is also just in one long file. I'd like to split out the different options into a seperate file or even multiple files to make things easier. On a smaller scale, I'd like to adjust my code to rely less on `.then()`, if possible. Putting validations on the inputs would also be very helpful.

## Credits
This program uses the MySQL2, Inquirer, and console.table NPM packages. All other work was done by myself exclusively.