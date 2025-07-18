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

## 📋 Assignment Requirements

This project fulfills all requirements for the EdTech Assignment Tracking System:

### Part A - System Design ✅
- [x] **System Architecture**: Complete architecture diagram and component breakdown
- [x] **Entity Relationships**: Detailed ER diagrams and database schema
- [x] **API Endpoints**: Comprehensive API design with request/response examples
- [x] **Authentication Strategy**: JWT-based role-based authentication
- [x] **Scaling Strategy**: Future scaling roadmap and technology evolution

**📄 [View Complete System Design Documentation](SYSTEM_DESIGN.md)**

### Part B - Implementation ✅
- [x] **User Authentication**: Role-based signup/login (Teachers & Students)
- [x] **Assignment Management**: Create assignments (Teachers only)
- [x] **Submission System**: Submit assignments (Students only)
- [x] **Submission Review**: View submissions (Teachers only)
- [x] **Tech Stack**: Django + Django REST Framework + SQLite
- [x] **JSON Responses**: All APIs return proper JSON responses

### Frontend Implementation ✅
- [x] **React Interface**: Modern responsive UI
- [x] **Assignment Creation**: Teacher dashboard for creating assignments
- [x] **Assignment Submission**: Student interface for submitting work
- [x] **Submission Management**: Teacher interface for viewing submissions

### Bonus Features ✅
- [x] **File Upload**: Support for assignment file attachments
- [x] **API Documentation**: Complete Swagger/OpenAPI documentation
- [x] **UI/UX**: Modern responsive design with Tailwind CSS
- [x] **Additional**: Real-time updates, error handling, loading states