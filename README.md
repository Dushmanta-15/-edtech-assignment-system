# EdTech Assignment Tracking System

A comprehensive assignment tracking system for educational institutions with role-based authentication for teachers and students.

## Features

- 🔐 Role-based authentication (Teachers & Students)
- 📚 Assignment creation and management (Teachers)
- 📝 Assignment submission with file upload (Students)
- 👀 View and manage submissions (Teachers)
- 📱 Responsive design for all devices
- 🔄 Real-time updates and feedback
- 📊 RESTful API with Swagger documentation

## Tech Stack

- **Backend**: Django + Django REST Framework + PostgreSQL
- **Frontend**: React + Tailwind CSS (+ vanilla HTML/CSS/JS option)
- **Authentication**: JWT with role-based access control
- **File Storage**: Local file system with cloud-ready architecture

## Quick Start

1. **Clone the repository**
2. **Setup Backend** (see setup.md)
3. **Setup Frontend** (see setup.md)
4. **Access the application** at http://localhost:3000

## API Documentation

- Swagger UI: http://localhost:8000/swagger/
- ReDoc: http://localhost:8000/redoc/

## Default Users

After running migrations and fixtures:
- Teacher: teacher@example.com / password123
- Student: student@example.com / password123

## License

MIT License
