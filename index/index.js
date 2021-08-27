const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table')

const connection = require('../connection/connection');
const { connect } = require('../connection/connection');

const employee = () => {
    const employees = [];
    connection.query('SELECT CONCAT_WS(" ", employee.first_name, employee.last_name) AS Employee FROM employee ORDER BY Employee ASC', function(err, res) {
      if (err) throw err;
      res.forEach(({ Employee }) => employees.push(Employee));
    })
    return employees;
  };
  const role = () => {
    const roles = [];
    connection.query('SELECT * FROM role', function(err, res) {
      if (err) throw err;
      res.forEach(({ title }) => roles.push(title));
    })
    return roles;
  };
  
  const department = () => {
    const departments = [];
    connection.query('SELECT * FROM department', function(err, res) {
      if (err) throw err;
      res.forEach(({ department_name }) => departments.push(department_name));
    })
    return departments;
  };
  
  const startPrompts = async () => {
    return await inquirer
      .prompt([
        {
          name: 'action',
          type: 'rawlist',
          message: 'What would you like to do?',
          choices: [
            'EMPLOYEES: View',
            'EMPLOYEES: New Entry',
            'EMPLOYEES: Update Role',
  
            'ROLES: View',
            'ROLES: New Entry',
  
            'DEPARTMENTS: View',
            'DEPARTMENTS: New Entry',
          ],
        },
      ])
      .then((response) => {
        switch (response.action) {
          case 'EMPLOYEES: View':
            viewemployee();
            break;
  
          case 'EMPLOYEES: New Entry':
            createemployee();
            break;
  
          case 'EMPLOYEES: Update Role':
            updaterole();
            break;
  
          case 'ROLES: View':
            viewrole();
            break;
  
          case 'ROLES: New Entry':
            newrole();
            break;
  
          case 'DEPARTMENTS: View':
            viewdepartment();
            break;
  
          case 'DEPARTMENTS: New Entry':
            adddepartment();
            break;
  
          default:
            console.log(`Not Applicable`);
            break;
        }
      });
  };
  
  
  
  const welcome = () => {
    return inquirer
    .prompt([
      {
        type: 'input',
        name: 'welcome',
        message: 'You can edit, view, and create entries for departments, managers, and employees',
      },
    ])
    .then(startPrompts)
  };
  
  

  

  const createemployee = async() => {
    const employee = await inquirer
    .prompt([
      {
        name: 'first_name',  
        type: 'input',
        message: 'First name of employee.',
        validate: first_name => {
          if (first_name) {
            return true;
            } else {
              return false; 
            }
        },
      },
      {
        name: 'last_name',  
        type: 'input',
        message: ({ first_name }) => `Last name of ${first_name}?`,
        validate: last_name => {
          if (last_name) {
            return true;
          } else {
            return false; 
          }
        },
      },
      {
        name: 'role',  
        type: 'list',
        message: ({ first_name, last_name }) => `Use the menu to select the role.`,
        choices: role()
      },
      {
        name: 'manager',  
        type: 'list',
        message: ({ first_name, last_name }) => `Input manager via the menu`,
        choices: employee()
      },
    ])
    .then((answers) => {
      let title = answers.role;
      const findroleid = () => {
        connection.query('SELECT * FROM role WHERE title=?',
          [`${title}`],
          (err, res) => {
            if (err) throw err;
            roleID = res[0].id;
            
          }
        );
      };
      findroleid();
  
    const manager = answers.manager;
      let managerid;
      const findid = () => {
        connection.query('SELECT employee.id, CONCAT_WS(" ", employee.first_name, employee.last_name) AS Employee FROM employee HAVING Employee=?',
          [`${manager}`],
          (err, res) => {
            if (err) throw err;
            managerid = res[0].id;
           
          }
        );
      };
      findid();

      const newemployee = async () => { 
      const mySQLConnection = await connection.query('INSERT INTO employee SET ?',
          {
            first_name: answers.first_name,
            last_name: answers.last_name,
            role_id: roleID,
            manager_id: managerID
          },
          (err, res) => {
            if (err) throw err;
            startPrompts();
          }
        );
    }
      newemployee();
    });
  };
  
  const newrole = () => {
    return inquirer
    .prompt([
      {
        name: 'title',  
        type: 'input',
        message: 'Create a role.',
        validate: title => {
          if (title) {
            return true;
            } else {
              console.log (`Enter a role`);
              return false; 
            }
        },
      },
      {
      name: 'salary',  
      type: 'input',
      message: ({ title }) => `List salary for ${title}.`,
        validate: salary => {
          if (salary) {
            return true;
          } else {
            ({ title }) => console.log (`Enter a salary`);
            return false; 
          }
        },
      },
      {
        name: 'department',  
        type: 'input',
        message: ({ title }) => `Choose the department from the list below`,
        choices: department()
      },
    ])
    .then((answers) => {
      const departmentid = department().indexOf(val.department) +1
      connection.query('INSERT INTO role SET ?',
        {
          title: answers.title,
          salary: answers.salary,
          department_id: departmentid
        },
        (err, res) => {
          if (err) throw err;
          startPrompts();
        }
      );
      connection.end;
    })
  };
  
  const adddepartment = () => {
    return inquirer
      .prompt([
      {
        name: 'departmentName',  
        type: 'input',
        message: 'Input department name.',
        validate: departmentName => {
          if (departmentName) {
            return true;
            } else {
              return false; 
            }
        },
      },
    ])
    .then((answers) => {
      const query = 'INSERT INTO department SET ?';
      connection.query(query, [
        {
          department_name: answers.departmentName,
        },
      ],
      (err, res) => {
        if (err) throw err;
      },
      console.log(`${res.affectedRows} Department added`)
      );
      connection.end;
    })
  };
  
  
  function viewemployee() {
    let sql = `SELECT employee.first_name, employee.last_name, role.title, role.salary, department.department_name `
    sql += `CONCAT (e.first_name, ' ', e.last_name) AS Manager `
    sql += `FROM employee `;
    sql += `INNER JOIN role ON role.id = employee.role_id INNER JOIN department ON department.id = role.department_id `
    sql += `LEFT JOIN employee e ON employee.manager_id = e.id `
    sql += `ORDER BY last_name ASC`;
    connection.query(query, (err, res) => {
      if (err) throw err;
      console.table(res);
      connection.end;
    })
    startPrompts()
  }
  
  const viewrole = () => {
    let sql = `SELECT * FROM roles`
    sql += `INNER JOIN department ON role.department_id = department.id`
    sql += `ORDER BY title`
    connection.query(query, (err, res) => {
      if (err) throw err
      console.table(res)
      connection.end
    })
    startPrompts()
  }
  
  const viewdepartment = () => {
    let query = `SELECT * FROM departments `
    query += `ORDER BY department_name`
    connection.query(query, (err, res) => {
      if (err) throw err;
      console.table(res);
      connection.end;
    })
    startPrompts()
  }
  

  const updaterole = () => {
    return inquirer
      .prompt([
        {
        name: 'employee',  
        type: 'input',
        message: `Use the menu to update an employee`,
        choices: employee()
        },
      {
        name: 'role',  
        type: 'input',
        message: ({ employee }) => `Use the menu to update the role`,
        choices: role()
      },
    ])
    .then(answers => {
      const idrole = role().indexOf(val.role) +1
      const idmanager = employee().indexOf(val.employee) + 1
      connection.query(
        'INSERT INTO employees SET ?',
        { first_name: answers.first_name,
          last_name: answers.last_name,
          manager_id: idmanager,
          role_id: idrole
        },
        (err, res) => {
          if (err) throw err
          
        }
      )
      connection.end
    }),
    startPrompts()
  };
  

  const init = () => startPrompts()
  
    init();

 