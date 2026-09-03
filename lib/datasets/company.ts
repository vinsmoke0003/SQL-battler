import type { Dataset } from "./types";

export const company: Dataset = {
  id: "company",
  name: "Company",
  description:
    "Employees, departments, projects and the hours people log against them.",
  seed: `
CREATE TABLE departments (
  department_id   INTEGER PRIMARY KEY,
  department_name TEXT NOT NULL,
  location        TEXT NOT NULL
);

CREATE TABLE employees (
  employee_id   INTEGER PRIMARY KEY,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  department_id INTEGER REFERENCES departments(department_id),
  salary        INTEGER NOT NULL,
  hire_date     TEXT NOT NULL,
  manager_id    INTEGER REFERENCES employees(employee_id)
);

CREATE TABLE projects (
  project_id    INTEGER PRIMARY KEY,
  project_name  TEXT NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(department_id),
  budget        INTEGER NOT NULL,
  start_date    TEXT NOT NULL,
  end_date      TEXT
);

CREATE TABLE employee_projects (
  employee_id  INTEGER NOT NULL REFERENCES employees(employee_id),
  project_id   INTEGER NOT NULL REFERENCES projects(project_id),
  hours_worked INTEGER NOT NULL,
  PRIMARY KEY (employee_id, project_id)
);

INSERT INTO departments VALUES
  (1, 'Engineering',     'Bengaluru'),
  (2, 'Marketing',       'Mumbai'),
  (3, 'Finance',         'Mumbai'),
  (4, 'Human Resources', 'Delhi'),
  (5, 'Sales',           'Delhi'),
  (6, 'Product',         'Bengaluru'),
  (7, 'Legal',           'Mumbai');

INSERT INTO employees VALUES
  (1,  'Arjun',     'Mehta',    'arjun.mehta@company.com',     1, 145000, '2019-03-11', NULL),
  (2,  'Priya',     'Sharma',   'priya.sharma@company.com',    1,  98000, '2020-07-01', 1),
  (3,  'Rahul',     'Verma',    'rahul.verma@company.com',     1,  87000, '2021-01-18', 1),
  (4,  'Sneha',     'Iyer',     'sneha.iyer@company.com',      1, 102000, '2020-11-23', 2),
  (5,  'Karan',     'Singh',    'karan.singh@company.com',     1,  64000, '2023-02-06', 2),
  (6,  'Ananya',    'Rao',      'ananya.rao@company.com',      2,  88000, '2018-09-15', NULL),
  (7,  'Vikram',    'Nair',     'vikram.nair@company.com',     2,  61000, '2021-06-21', 6),
  (8,  'Divya',     'Menon',    'divya.menon@company.com',     2,  63000, '2022-04-04', 7),
  (9,  'Rohan',     'Gupta',    'rohan.gupta@company.com',     3, 105000, '2017-05-30', NULL),
  (10, 'Kavya',     'Reddy',    'kavya.reddy@company.com',     3,  72000, '2020-02-10', 9),
  (11, 'Aman',      'Joshi',    'aman.joshi@company.com',      3,  69000, '2021-09-13', 9),
  (12, 'Neha',      'Kapoor',   'neha.kapoor@company.com',     4,  76000, '2019-12-02', NULL),
  (13, 'Siddharth', 'Das',      'siddharth.das@company.com',   4,  48000, '2023-07-17', 12),
  (14, 'Meera',     'Pillai',   'meera.pillai@company.com',    5,  82000, '2018-01-08', NULL),
  (15, 'Aditya',    'Kulkarni', 'aditya.kulkarni@company.com', 5,  55000, '2022-10-24', 14),
  (16, 'Pooja',     'Bhatt',    'pooja.bhatt@company.com',     5,  52000, '2023-03-20', 14),
  (17, 'Nikhil',    'Saxena',   'nikhil.saxena@company.com',   5,  59000, '2021-11-01', 14),
  (18, 'Ishita',    'Chawla',   'ishita.chawla@company.com',   6, 118000, '2019-08-19', NULL),
  (19, 'Manish',    'Tiwari',   'manish.tiwari@company.com',   6,  79000, '2022-01-31', 18),
  (20, 'Ritu',      'Agarwal',  'ritu.agarwal@company.com',    1,  54000, '2024-04-15', 2),
  (21, 'Farhan',    'Ali',      'farhan.ali@company.com',      NULL, 45000, '2024-06-03', NULL);

INSERT INTO projects VALUES
  (1, 'Atlas Platform',    1, 2500000, '2023-01-10', '2023-12-20'),
  (2, 'Mobile App v2',     1, 1800000, '2024-02-01', NULL),
  (3, 'Brand Refresh',     2,  600000, '2023-06-01', '2023-09-30'),
  (4, 'Festive Campaign',  2,  950000, '2024-09-01', '2024-11-15'),
  (5, 'Audit Automation',  3,  700000, '2023-03-15', '2024-01-31'),
  (6, 'Sales CRM Rollout', 5, 1200000, '2024-01-05', NULL),
  (7, 'Onboarding Portal', 4,  400000, '2023-10-01', '2024-03-31'),
  (8, 'Roadmap 2025',      6,  300000, '2024-07-01', NULL);

INSERT INTO employee_projects VALUES
  (1, 1, 120), (2, 1, 340), (3, 1, 410), (4, 1, 280), (5, 1, 150),
  (2, 2, 260), (4, 2, 300), (5, 2, 220), (20, 2, 180), (3, 2, 90),
  (6, 3, 150), (7, 3, 210), (8, 3, 190),
  (6, 4, 80),  (7, 4, 240), (8, 4, 260),
  (9, 5, 100), (10, 5, 320), (11, 5, 290),
  (14, 6, 130), (15, 6, 300), (17, 6, 310), (2, 6, 40),
  (12, 7, 200), (13, 7, 260),
  (18, 8, 140), (19, 8, 220), (1, 8, 60);
`,
};
