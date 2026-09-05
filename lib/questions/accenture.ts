import type { QuestionDef } from "./types";

/**
 * Accenture-style SQL questions.
 *
 * Modelled on how Accenture actually frames SQL in its assessments and
 * technical rounds: short business scenarios drawn from client delivery
 * (projects, clients, consultants, billing) rather than abstract puzzles,
 * with a ramp from single-table filtering to joins/aggregation and finally
 * window functions. The recurring archetypes below — subject matter experts,
 * filling missing client data, average project duration, average project
 * cost per year, conversion/ratio metrics, and second-highest salary both
 * overall and per group — are the ones reported most consistently.
 *
 * These are registered for lookup but kept out of the practice/battle pool
 * so mock-test questions stay reserved for the mock test.
 */
export const accentureQuestions: QuestionDef[] = [
  {
    id: "ACN01",
    datasetId: "consulting",
    title: "Consultants in Pune",
    description:
      "The Pune delivery centre needs a staffing list. Return the name and domain of every consultant based in Pune, sorted by name.",
    difficulty: "easy",
    tags: ["SELECT", "WHERE", "ORDER BY"],
    solution:
      "SELECT name, domain FROM employees WHERE city = 'Pune' ORDER BY name",
    orderMatters: true,
    hints: ["Filter with WHERE city = 'Pune' and sort with ORDER BY name."],
  },
  {
    id: "ACN02",
    datasetId: "consulting",
    title: "Subject matter experts",
    description:
      "A consultant qualifies as a subject matter expert once they have at least 8 years of experience. Return the employee_id, name and years_of_experience of every subject matter expert, most experienced first.",
    difficulty: "easy",
    tags: ["WHERE", "ORDER BY"],
    solution:
      "SELECT employee_id, name, years_of_experience FROM employees WHERE years_of_experience >= 8 ORDER BY years_of_experience DESC",
    orderMatters: true,
    hints: [
      "'At least 8' means >= 8, not > 8.",
      "Sort with ORDER BY years_of_experience DESC.",
    ],
  },
  {
    id: "ACN03",
    datasetId: "consulting",
    title: "Fill missing client data",
    description:
      "Some clients were onboarded without an industry. Return client_name and industry for every client, replacing any missing industry with the text 'Unclassified'. Sort by client_name.",
    difficulty: "easy",
    tags: ["NULL", "STRING FUNCTION", "ORDER BY"],
    solution:
      "SELECT client_name, COALESCE(industry, 'Unclassified') AS industry FROM clients ORDER BY client_name",
    orderMatters: true,
    hints: [
      "COALESCE(industry, 'Unclassified') returns the first non-NULL value.",
      "Alias the column back to industry with AS so the header matches.",
    ],
  },
  {
    id: "ACN04",
    datasetId: "consulting",
    title: "Average project duration",
    description:
      "Delivery wants a benchmark for how long an engagement runs. For completed projects only, return the average duration in days as avg_duration_days, rounded to 1 decimal place.",
    difficulty: "medium",
    tags: ["DATE FUNCTION", "AGGREGATION", "WHERE"],
    solution:
      "SELECT ROUND(AVG(julianday(end_date) - julianday(start_date)), 1) AS avg_duration_days FROM projects WHERE status = 'completed'",
    orderMatters: false,
    hints: [
      "julianday(end_date) - julianday(start_date) gives the length of one project in days.",
      "Average that expression, then ROUND(..., 1). Filter to status = 'completed' first.",
    ],
  },
  {
    id: "ACN05",
    datasetId: "consulting",
    title: "Average project cost per year",
    description:
      "Finance reviews spend by the year a project started. Return start_year (as text, e.g. '2022') and the average project cost as avg_cost rounded to the nearest whole number, in chronological order.",
    difficulty: "medium",
    tags: ["DATE FUNCTION", "GROUP BY", "AGGREGATION"],
    solution: `SELECT strftime('%Y', start_date) AS start_year, ROUND(AVG(cost)) AS avg_cost
FROM projects
GROUP BY start_year
ORDER BY start_year`,
    orderMatters: true,
    hints: [
      "strftime('%Y', start_date) extracts the year as text.",
      "GROUP BY that expression (or its alias) and average the cost.",
    ],
  },
  {
    id: "ACN06",
    datasetId: "consulting",
    title: "Clients without a single project",
    description:
      "Account management wants to chase dormant accounts. Return the client_name of every client that has no project at all, sorted by name.",
    difficulty: "medium",
    tags: ["LEFT JOIN", "NULL"],
    solution: `SELECT c.client_name
FROM clients c
LEFT JOIN projects p ON p.client_id = c.client_id
WHERE p.project_id IS NULL
ORDER BY c.client_name`,
    orderMatters: true,
    hints: [
      "A LEFT JOIN keeps clients even when no project matches.",
      "Rows with no match have NULL on the projects side — filter with WHERE p.project_id IS NULL.",
    ],
  },
  {
    id: "ACN07",
    datasetId: "consulting",
    title: "Billing by client",
    description:
      "Return each client that has billed hours, together with total_hours (the sum of hours billed across all of that client's projects). Highest total first, then client_name.",
    difficulty: "medium",
    tags: ["JOIN", "GROUP BY", "AGGREGATION"],
    solution: `SELECT c.client_name, SUM(a.hours_billed) AS total_hours
FROM clients c
JOIN projects p ON p.client_id = c.client_id
JOIN assignments a ON a.project_id = p.project_id
GROUP BY c.client_id, c.client_name
ORDER BY total_hours DESC, c.client_name`,
    orderMatters: true,
    hints: [
      "Chain three tables: clients → projects → assignments.",
      "SUM(a.hours_billed) grouped by the client.",
    ],
  },
  {
    id: "ACN08",
    datasetId: "consulting",
    title: "Second highest salary",
    description:
      "A classic Accenture question. Return the second highest salary in the employees table as second_highest_salary.",
    difficulty: "medium",
    tags: ["SUBQUERY", "AGGREGATION"],
    solution:
      "SELECT MAX(salary) AS second_highest_salary FROM employees WHERE salary < (SELECT MAX(salary) FROM employees)",
    orderMatters: false,
    hints: [
      "Find the highest salary first, then the highest of everything below it.",
      "SELECT MAX(salary) ... WHERE salary < (SELECT MAX(salary) FROM employees).",
    ],
  },
  {
    id: "ACN09",
    datasetId: "consulting",
    title: "Delivery mix per domain",
    description:
      "Return each domain with headcount (number of consultants) and avg_salary rounded to the nearest whole number, but only for domains with more than 2 consultants. Sort by avg_salary descending.",
    difficulty: "medium",
    tags: ["GROUP BY", "HAVING", "AGGREGATION"],
    solution: `SELECT domain, COUNT(*) AS headcount, ROUND(AVG(salary)) AS avg_salary
FROM employees
GROUP BY domain
HAVING COUNT(*) > 2
ORDER BY avg_salary DESC`,
    orderMatters: true,
    hints: [
      "Conditions on an aggregate go in HAVING, not WHERE.",
      "HAVING COUNT(*) > 2 after GROUP BY domain.",
    ],
  },
  {
    id: "ACN10",
    datasetId: "consulting",
    title: "Second highest salary in each domain",
    description:
      "The follow-up Accenture asks once you solve the single-value version. For every domain, return domain, name and salary of the consultant with the second highest salary in that domain, sorted by domain.",
    difficulty: "hard",
    tags: ["WINDOW FUNCTION", "CTE"],
    solution: `WITH ranked AS (
  SELECT domain, name, salary,
         DENSE_RANK() OVER (PARTITION BY domain ORDER BY salary DESC) AS rnk
  FROM employees
)
SELECT domain, name, salary
FROM ranked
WHERE rnk = 2
ORDER BY domain`,
    orderMatters: true,
    hints: [
      "DENSE_RANK() OVER (PARTITION BY domain ORDER BY salary DESC) ranks within each domain.",
      "A window function can't be used in WHERE — compute it in a CTE, then filter rnk = 2 outside.",
    ],
  },
  {
    id: "ACN11",
    datasetId: "consulting",
    title: "Project completion rate",
    description:
      "Leadership wants a single delivery health metric. Return completion_rate: the percentage of all projects whose status is 'completed', rounded to 1 decimal place.",
    difficulty: "hard",
    tags: ["CASE", "AGGREGATION"],
    solution:
      "SELECT ROUND(100.0 * SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*), 1) AS completion_rate FROM projects",
    orderMatters: false,
    hints: [
      "SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) counts the completed ones.",
      "Multiply by 100.0 rather than 100 so SQLite does floating-point division.",
    ],
  },
  {
    id: "ACN12",
    datasetId: "consulting",
    title: "Biggest project per client",
    description:
      "For each client that has at least one project, return client_name, project_name and cost for that client's most expensive project. Sort by cost, highest first.",
    difficulty: "hard",
    tags: ["WINDOW FUNCTION", "CTE", "JOIN"],
    solution: `WITH ranked AS (
  SELECT c.client_name, p.project_name, p.cost,
         ROW_NUMBER() OVER (PARTITION BY p.client_id ORDER BY p.cost DESC) AS rn
  FROM projects p
  JOIN clients c ON c.client_id = p.client_id
)
SELECT client_name, project_name, cost
FROM ranked
WHERE rn = 1
ORDER BY cost DESC`,
    orderMatters: true,
    hints: [
      "ROW_NUMBER() OVER (PARTITION BY client_id ORDER BY cost DESC) numbers each client's projects.",
      "Keep the rows where that number is 1.",
    ],
  },
];
