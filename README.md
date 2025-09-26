# assignment-workflow-frontend
A role-based web application for managing assignments between teachers and students.

# Assignment Workflow Project

A workflow portal for teachers and students to manage and submit assignments.

## Tech Stack
- **Frontend**: React.JS  

---

## Local Setup

Follow these steps to run the project locally:

### 1. Install dependencies
```bash
npm install
```

### 2. Start the application
```bash
npm start
```

---

## Features

- **Single login** page for both teachers and students.  
- **Role-based dashboards**:  
  - Teacher → Create, publish, and review assignments.  
  - Student → View assignments and submit answers.  
- **Assignment lifecycle**: Draft → Published → Completed.  
- **Teacher actions**: Review student submissions and mark them as reviewed.  
- **Student actions**: Submit one answer per assignment.  

---

## Notes
- Ensure **PostgreSQL** is running locally before running migrations.  
- Keep your `.env` file private and **do not commit it** to GitHub.  
