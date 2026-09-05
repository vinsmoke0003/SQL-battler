import type { Dataset } from "./types";

/**
 * Consulting-firm schema used by the Accenture mock test: consultants with a
 * delivery domain, the clients they serve, client projects with cost and
 * duration, and per-project billing. Mirrors the business context Accenture
 * frames its SQL questions around (projects, clients, billing, domains).
 */
export const consulting: Dataset = {
  id: "consulting",
  name: "Consulting Firm",
  description:
    "Consultants, clients, delivery projects and billed hours for an IT services firm.",
  seed: `
CREATE TABLE employees (
  employee_id         INTEGER PRIMARY KEY,
  name                TEXT NOT NULL,
  domain              TEXT NOT NULL,
  years_of_experience INTEGER NOT NULL,
  salary              INTEGER NOT NULL,
  city                TEXT NOT NULL,
  hire_date           TEXT NOT NULL
);

CREATE TABLE clients (
  client_id   INTEGER PRIMARY KEY,
  client_name TEXT NOT NULL,
  industry    TEXT,
  country     TEXT NOT NULL,
  signup_date TEXT NOT NULL
);

CREATE TABLE projects (
  project_id   INTEGER PRIMARY KEY,
  project_name TEXT NOT NULL,
  client_id    INTEGER NOT NULL REFERENCES clients(client_id),
  start_date   TEXT NOT NULL,
  end_date     TEXT,
  cost         INTEGER NOT NULL,
  status       TEXT NOT NULL
);

CREATE TABLE assignments (
  employee_id  INTEGER NOT NULL REFERENCES employees(employee_id),
  project_id   INTEGER NOT NULL REFERENCES projects(project_id),
  role         TEXT NOT NULL,
  hours_billed INTEGER NOT NULL,
  PRIMARY KEY (employee_id, project_id)
);

INSERT INTO employees VALUES
  (1,  'Ananya Krishnan', 'Data & Analytics',        9,  1850000, 'Bengaluru', '2016-06-13'),
  (2,  'Rohit Malhotra',  'Data & Analytics',        6,  1420000, 'Bengaluru', '2019-02-11'),
  (3,  'Sneha Pillai',    'Data & Analytics',        3,   980000, 'Chennai',   '2022-07-04'),
  (4,  'Karthik Reddy',   'Cloud',                   11, 2100000, 'Hyderabad', '2014-03-24'),
  (5,  'Meera Joshi',     'Cloud',                   7,  1560000, 'Pune',      '2018-09-10'),
  (6,  'Aditya Sharma',   'Cloud',                   2,   860000, 'Pune',      '2023-01-16'),
  (7,  'Farhan Qureshi',  'Cybersecurity',           8,  1720000, 'Mumbai',    '2017-11-06'),
  (8,  'Divya Nair',      'Cybersecurity',           5,  1280000, 'Mumbai',    '2020-05-18'),
  (9,  'Nikhil Bose',     'Application Development', 10, 1930000, 'Kolkata',   '2015-08-03'),
  (10, 'Priya Menon',     'Application Development', 4,  1120000, 'Kochi',     '2021-04-12'),
  (11, 'Sameer Kulkarni', 'Application Development', 6,  1380000, 'Pune',      '2019-10-21'),
  (12, 'Tanvi Desai',     'Consulting',              12, 2250000, 'Mumbai',    '2013-07-01'),
  (13, 'Arjun Verma',     'Consulting',              5,  1240000, 'Gurugram',  '2020-08-17'),
  (14, 'Ishita Rao',      'Consulting',              1,   720000, 'Gurugram',  '2024-02-05'),
  (15, 'Vikram Singh',    'Data & Analytics',        14, 2400000, 'Gurugram',  '2011-05-09');

INSERT INTO clients VALUES
  (1,  'Northwind Retail',    'Retail',      'India',     '2019-04-15'),
  (2,  'Meridian Bank',       'Banking',     'India',     '2018-01-22'),
  (3,  'Vertex Pharma',       NULL,          'Singapore', '2020-06-30'),
  (4,  'Aurora Energy',       'Energy',      'Australia', '2017-11-05'),
  (5,  'Blueleaf Logistics',  'Logistics',   'India',     '2021-03-19'),
  (6,  'Cobalt Telecom',      'Telecom',     'UK',        '2019-09-27'),
  (7,  'Delta Insurance',     NULL,          'India',     '2022-02-14'),
  (8,  'Everest Healthcare',  'Healthcare',  'USA',       '2020-10-08'),
  (9,  'Fintrust Capital',    'Banking',     'UK',        '2023-05-21'),
  (10, 'Grandview Hotels',    'Hospitality', 'India',     '2016-08-12');

INSERT INTO projects VALUES
  (1,  'Retail Data Platform',    1, '2022-01-10', '2022-11-30', 12500000, 'completed'),
  (2,  'Customer 360',            1, '2023-03-01', '2023-12-15',  9800000, 'completed'),
  (3,  'Core Banking Migration',  2, '2021-06-01', '2022-09-30', 24000000, 'completed'),
  (4,  'Fraud Detection Engine',  2, '2023-02-13', NULL,         15600000, 'in_progress'),
  (5,  'Clinical Trial Analytics',3, '2022-05-16', '2023-04-28', 11200000, 'completed'),
  (6,  'Grid Modernisation',      4, '2021-09-06', '2022-08-19', 18900000, 'completed'),
  (7,  'Fleet Optimisation',      5, '2023-07-03', NULL,          7400000, 'in_progress'),
  (8,  'Network Security Audit',  6, '2022-02-21', '2022-07-29',  5600000, 'completed'),
  (9,  '5G Rollout Support',      6, '2023-01-09', '2023-10-27', 21300000, 'completed'),
  (10, 'Claims Automation',       7, '2022-08-15', '2023-06-30',  8900000, 'completed'),
  (11, 'Patient Portal',          8, '2023-04-17', NULL,         10400000, 'in_progress'),
  (12, 'Risk Reporting Suite',    9, '2024-01-08', NULL,         13700000, 'in_progress'),
  (13, 'Legacy Decommission',     4, '2020-03-02', '2020-12-18',  6200000, 'cancelled'),
  (14, 'Cloud Cost Optimisation', 3, '2024-02-19', NULL,          4800000, 'in_progress');

INSERT INTO assignments VALUES
  (1,  1,  'Lead',      620),
  (2,  1,  'Developer', 880),
  (3,  1,  'Analyst',   540),
  (1,  2,  'Lead',      430),
  (2,  2,  'Developer', 760),
  (15, 3,  'Architect', 510),
  (9,  3,  'Lead',      940),
  (11, 3,  'Developer', 1020),
  (1,  4,  'Lead',      380),
  (3,  4,  'Analyst',   640),
  (15, 5,  'Architect', 470),
  (2,  5,  'Developer', 720),
  (4,  6,  'Architect', 690),
  (5,  6,  'Engineer',  850),
  (6,  6,  'Engineer',  610),
  (5,  7,  'Engineer',  420),
  (10, 7,  'Developer', 560),
  (7,  8,  'Lead',      340),
  (8,  8,  'Analyst',   480),
  (4,  9,  'Architect', 720),
  (6,  9,  'Engineer',  930),
  (7,  9,  'Lead',      410),
  (11, 10, 'Developer', 780),
  (10, 10, 'Developer', 650),
  (13, 10, 'Consultant',390),
  (9,  11, 'Lead',      520),
  (10, 11, 'Developer', 700),
  (12, 12, 'Partner',   280),
  (13, 12, 'Consultant',610),
  (8,  12, 'Analyst',   450),
  (4,  14, 'Architect', 330),
  (6,  14, 'Engineer',  290);
`,
};
