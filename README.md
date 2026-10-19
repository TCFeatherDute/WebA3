# Charity Events Management System

A full-stack charity events management website developed for **PROG2002 – Web Development II, Assignment 3**.

The project provides a public-facing website for discovering and registering for charity events, an administration interface for managing event information, and a RESTful API connected to a MySQL database.

## 1. Project Overview

Charity organisations need an effective way to promote their activities and connect with potential participants.

This project aims to provide a dynamic platform where visitors can discover charity events, search for relevant activities, view event details, and submit registrations online.

An administrative application supports the management of charity events and associated information.

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| Client Frontend | Angular 22, TypeScript, HTML, CSS |
| Admin Frontend | Angular, TypeScript |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Database Driver | mysql2 |
| API Communication | RESTful API, JSON |
| External API | Open-Meteo Weather API |
| Version Control | Git and GitHub |
| Deployment | SCU cPanel (deployment pending) |

## 3. Main Features

### Public Website

**Dynamic Homepage**
- Displays charity events retrieved from the backend.
- Shows event statistics and fundraising totals.
- Uses reusable event cards.
- Handles loading, empty and error states.

**Event Search**
- Search events by keyword and location.
- Filter events by category and status.
- Display matching results dynamically.
- Reset search filters.

**Event Details**
- Display event description, purpose, date and location.
- Show ticket prices and fundraising progress.
- Display event registration records.
- Provide navigation to the registration page.

**Event Registration**
- Submit attendee information and ticket quantities.
- Validate required form fields.
- Send registration requests to the backend.
- Display confirmation messages and registration IDs.
- Handle duplicate registration errors.

**Weather Information**
- Integrates with the Open-Meteo API.
- Uses event coordinates to request weather forecasts.
- Displays weather conditions when forecasts are available.
- Handles events outside the supported forecast period.

### Administration Website

The administration application is intended to support:

- Management of charity events.
- Creation, editing and deletion of event information.
- Management of registration records.
- Interaction with the shared backend API.

Administrative functionality should be verified against the latest project version before final submission.

## 4. Project Structure

```text
WebA3/
├── charity-client/
│   ├── src/
│   │   └── app/
│   │       ├── core/
│   │       │   ├── config/
│   │       │   ├── models/
│   │       │   └── services/
│   │       ├── layout/
│   │       ├── pages/
│   │       │   ├── home/
│   │       │   ├── search/
│   │       │   ├── event-detail/
│   │       │   └── registration/
│   │       └── shared/
│   │           └── event-card/
│   └── package.json
│
├── charity-api/
│   ├── routes/
│   │   ├── events.js
│   │   ├── registrations.js
│   │   ├── categories.js
│   │   └── charities.js
│   ├── db.js
│   ├── server.js
│   └── package.json
│
├── database/
│   └── [SQL database export]
│
├── [Angular admin project]/
│
└── README.md
```

The exact administration directory and SQL export filename should be confirmed from the final repository.

## 5. Database Design

The application uses a relational MySQL database containing four main entities.

| Table | Purpose |
|---|---|
| `charity` | Stores charity organisation information |
| `category` | Defines charity event categories |
| `event` | Stores event details and fundraising information |
| `registration` | Stores attendee registration records |

The database uses foreign key relationships to maintain referential integrity.

A unique constraint on the combination of `event_id` and `email` prevents the same email address from registering more than once for the same event.

## 6. REST API

The backend provides RESTful endpoints for the client and administration applications.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events` | Retrieve events and apply search filters |
| GET | `/api/events/:id` | Retrieve event details and registrations |
| POST | `/api/events` | Create an event |
| PUT | `/api/events/:id` | Update an event |
| DELETE | `/api/events/:id` | Delete an event |
| POST | `/api/registrations` | Submit a registration |
| PUT | `/api/registrations/:id` | Update a registration |
| DELETE | `/api/registrations/:id` | Delete a registration |
| GET | `/api/categories` | Retrieve event categories |
| GET | `/api/charities` | Retrieve charity organisations |

**Example:**

```http
GET /api/events?keyword=Sydney&status=Active
```

The API returns JSON responses and appropriate HTTP status codes for successful requests and errors.

## 7. Local Development

### Prerequisites

Install the following software:

- Node.js and npm
- MySQL Server
- Angular CLI
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/TCFeatherDute/WebA3.git
cd WebA3
```

### Step 2: Configure the Database

Create a MySQL database and import the SQL export included in the project.

Configure the backend database connection using a local `.env` file inside `charity-api`.

Example:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
PORT=3000
NODE_ENV=development
```

Do not commit database passwords or production credentials to GitHub.

### Step 3: Start the Backend

```bash
cd charity-api
npm ci
node server.js
```

The backend is configured for local development at:

```text
http://localhost:3000
```

Example API endpoint:

```text
http://localhost:3000/api/events
```

### Step 4: Start the Client Website

Open another terminal:

```bash
cd charity-client
npm ci
npx ng serve
```

Open:

```text
http://localhost:4200
```

### Step 5: Start the Administration Website

Navigate to the administration project's directory and install its dependencies:

```bash
npm ci
```

Start the administration Angular application using its configured development command and port.

The exact directory and local address should be checked against the latest administration project configuration.

## 8. Production Deployment

The project is intended to be deployed using the university-provided cPanel hosting environment.

The deployment process includes:

1. Creating a MySQL database in cPanel.
2. Importing the database SQL schema and sample records.
3. Configuring the Express API with the server database credentials.
4. Building the Angular client and admin applications for production.
5. Uploading the compiled frontend files to their configured web directories.
6. Updating frontend API URLs to use the deployed backend address.
7. Testing database access, API endpoints, page navigation and event registration.

Deployment-specific URLs and configuration instructions will be added after the hosting environment has been verified.

## 9. Testing

The following functionality has been tested during local development:

- Angular production build.
- Event data retrieval from MySQL through Express.
- Dynamic homepage statistics and event display.
- Event search and filtering.
- Event details retrieval.
- Successful event registration with a generated registration ID.
- Weather information fallback for dates outside the forecast period.

Additional production deployment testing and administration workflow verification are required.

## 10. Team Collaboration

The project is developed collaboratively using Git and GitHub.

Development contributions include:

- Frontend component and page development.
- REST API implementation.
- Database schema and sample data preparation.
- Administration interface development.
- API integration and functional testing.
- Deployment and documentation.

Individual contributions can be reviewed through the repository's commit history and the project's peer evaluation documentation.

## 11. Security Notes

- Database credentials must not be committed to the repository.
- The `node_modules` directories should be excluded from version control.
- Environment-specific settings should be maintained separately.
- The administration interface requires appropriate access protection before use in a public production environment.
- Test registration data should not contain real personal information.

## 12. Project Status

Core public-facing features have been implemented and tested locally.

Final hosting deployment, administrative functionality verification and production testing are pending.


## 13. AI Generator
I acknowledge that I have used GenAI tools to complete this assessment. I used Doubao AI to generate the data in the database and the required images within the parameters outlined in the Assessment Brief and by the Unit Assessor.


---

**Course:** PROG2002 – Web Development II  
**Assessment:** Assignment 3 – Dynamic Website  
**Repository:** https://github.com/TCFeatherDute/WebA3
