# Employee Rostering System - Backend

## Project Setup

**1. Prerequisites**

- **Python 3.x**
- **MySQL**
- **virtualenv** (recommended)

**2. Setting Up the Environment**

- **Clone the repository to your local machine:** 
```
cd backend
```
- **Create and activate a virtual environment:**
  - For macOS/Linux: 
  ```
  python3 -m venv venv 
  source venv/bin/activate
  ```
  - For Windows: 
  ```
  venv\Scripts\activate
  ```
- **Install the dependencies:** 
```
pip install -r requirements.txt
```
- **Set up the .env file:**
  - Create a .env file in the backend/backend direcotry
  - Edit .env and fill in the database details: 
  ```
  DB_NAME=roster 
  DB_USER=your_user
  DB_PASSWORD=your_password
  DB_HOST=localhost 
  DB_PORT=port
  ```

**3. Database Setup**

- **Install MySQL** if it's not already installed.
- **Create the database:**
  - Log into the MySQL shell
  - Then, create the database:

```  
 CREATE DATABASE roster;
```
- **Create a MySQL user (optional):**

```
 CREATE USER 'your_user'@'localhost' IDENTIFIED BY 'your_password';
 GRANT ALL PRIVILEGES ON roster.\* TO 'your_user'@'localhost';
 FLUSH PRIVILEGES;
 ```
- **Run Migrations to create the required tables:** 
```
python manage.py migrate
```

**4. Running the Development Server**

- **Run the Django development server:** 
```
python manage.py runserver
```
- **Access the API documentation:**
  - Swagger: 
  ```
  http://127.0.0.1:8000/swagger/
  ```

