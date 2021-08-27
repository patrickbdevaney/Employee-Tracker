DROP DATABASE IF EXISTS workforce_DB;
CREATE DATABASE workforce_DB;

USE workforce_DB;

CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL
);

CREATE TABLE role (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL(10, 2) NOT NULL,
  dept_id INT, 
  FOREIGN KEY (dept_id) 
    REFERENCES department(id)
    ON DELETE CASCADE
);

CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT,
  manager_id INT NULL,
  FOREIGN KEY (role_id) 
    REFERENCES role(id)
    ON DELETE CASCADE,
  FOREIGN KEY (manager_id) 
    REFERENCES employee(id)
    ON DELETE CASCADE
);