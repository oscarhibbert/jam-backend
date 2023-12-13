# Jam Mental Health Tracker – Backend API
### Introduction
The Jam Mental Health Tracker backend API built on Node.js and Express designed for use with our without the Telegram frontend application.
### Features
* Journalling endpoints for creating, updating, searching and retrieving, filtering and deleting complex mood and emotional health data as well as viewing mental health statistics over a searchable period of time.
* Settings endpoints for managing user account and profile and managing mood health categories and activities.
* MongoDB Atlas models and full client side field level encryption.
* JWT and refresh token authentication supporting RBAC with Auth0 working in conjunction with passwordless user login authentication in the frontend.
* Validation middleware across all endpoints.
* User profile management and administration capability endpoints.
* Sentry integration and logging.
* Full Mixpanel events integration.
* Detailed logging with Winston.
### Installation Guide
* Clone this repository [here](https://github.com/oscarhibbert/aura-backend).
* Run npm install to install all dependencies.
* Create and populate the config directory for application secrets and other configurations. Please contact oscarhibbert1@gmail.com.
* To start the server run npm start.
* To gracefully shutdown the server control + C in terminal.
### Usage
* Run npm start to start the application.
* Connect to the API using Postman on port 5000.
### API Endpoints
| HTTP Verbs | Endpoints | Action |
| --- | --- | --- |
| POST | /api/v1/user | Create a new user, requires admin RBAC permissions. |
| DELETE | /api/v1/user | Delete an existing user, requires admin RBAC permissions. |
| POST | api/v1/entries | Create a new journal entry for the currrent users. Supports mood, emotional state, categories, activities, rich text and linking to existing journal entries. |
| PATCH | api/v1/entries | Edit an existing journal entry by journal ID. |
| DELETE | api/v1/entries | Delete an existing journal entry by journal ID. |
| GET | api/v1/entries | Get all journal entries for the current user. |
| GET | api/v1/entries | Get a single journey entry by journal ID. |
| GET | api/v1/entries | Get the most recent entry for the current user. |
| GET | api/v1/entries | Get mood and emotional health statistics between a start, end date and certain category. |
| POST | api/v1/settings/categories/default | Creates default categories based on category config for the current user. |
| POST | api/v1/settings/categories | Add categories for the current user. |
| PATCH | api/v1/settings/categories | Edit a category name by cateegory ID for the current user. |
| DELETE | api/v1/settings/categories | Delete specified categories by category ID for the current user. |
| GET | api/v1/settings/categories | Get all categories for the current user. |
| GET | api/v1/settings/categories/inuse | Check whether the current category is in use for the current user, returns boolean true or false. |
| POST | api/v1/settings/activities | Add an array of new activities for the current user. |
| PATCH | api/v1/settings/activities | Edit an existing activity for the current user by activity ID. |
| DELETE | api/v1/settings/activities | Specify an array of existing activities IDs for the current user to be deleted. |
| GET | api/v1/settings/activities | Get all activities for the current user. |
| GET | api/v1/settings/inuse | Check if the specified activity by activity ID is in use for the current user. |
| GET | api/v1/user/profile | Fetch an object of all settings for the current user. |
| DELETE | api/v1/user | Delete the currernt user and all associated data (delete me and my data). |

### Technologies Used
* [NodeJS](https://nodejs.org/) This is a cross-platform runtime environment built on Chrome's V8 JavaScript engine used in running JavaScript codes on the server. It allows for installation and managing of dependencies and communication with databases.
* [ExpressJS](https://www.expresjs.org/) This is a NodeJS web application framework.
* [MongoDB Atlas](https://www.mongodb.com/) MongoDB Atlas is an integrated suite of data services centered around a cloud database designed to accelerate and simplify how you build with data.
* [Auth0](https://auth0.com/) Auth0 is a cloud-based identity authentication platform for developers working on web, mobile and legacy applications.
* [Mixpanel](https://mixpanel.com/) Mixpanel is an event analytics service that tracks user interactions with web and mobile applications.

### License
This project is available for use under the MIT License.
