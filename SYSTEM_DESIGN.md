# Part A - System Design Documentation

## EdTech Assignment Tracking System

### 1. System Architecture

#### High-Level Architecture
```
┌─────────────────┐    HTTP/REST API    ┌─────────────────┐    ORM/SQL    ┌─────────────────┐
│   Frontend      │ ◄─────────────────► │   Backend       │ ◄───────────► │   Database      │
│   (React)       │                     │   (Django)      │               │   (SQLite)      │
│                 │                     │                 │               │                 │
│ • Login/Signup  │                     │ • Authentication│               │ • Users         │
│ • Assignment UI │                     │ • API Endpoints │               │ • Assignments   │
│ • Submission UI │                     │ • Business Logic│               │ • Submissions   │
│ • File Upload   │                     │ • File Handling │               │                 │
└─────────────────┘                     └─────────────────┘               └─────────────────┘
```

#### Component Architecture
```
Frontend (React - Port 3000)
├── Authentication Module
│   ├── Login Component
│   ├── Register Component
│   └── Auth Context/Provider
├── Teacher Module
│   ├── Assignment Creation Form
│   ├── Assignment List
│   └── Submissions Viewer
├── Student Module
│   ├── Assignment Browser
│   ├── Submission Form
│   └── My Submissions
└── Shared Components
    ├── Navigation
    ├── File Upload
    └── API Service

Backend (Django - Port 8000)
├── Authentication App
│   ├── Custom User Model
│   ├── JWT Authentication
│   └── Role-based Permissions
├── Assignments App
│   ├── Assignment Model
│   ├── CRUD Operations
│   └── Teacher-only Access
├── Submissions App
│   ├── Submission Model
│   ├── File Upload Handling
│   └── Student-Teacher Relations
└── API Documentation
    ├── Swagger/OpenAPI
    └── Auto-generated Docs
```

### 2. Core Entities and Relationships

#### Entity Relationship Diagram (Tabular Format)

| Entity | Attributes | Primary Key | Foreign Keys | Relationships |
|--------|------------|-------------|--------------|---------------|
| **User** | id, email, username, first_name, last_name, role, password, created_at | id | - | 1:N with Assignment (as teacher)<br>1:N with Submission (as student) |
| **Assignment** | id, title, description, due_date, created_at, updated_at | id | teacher_id → User.id | N:1 with User (teacher)<br>1:N with Submission |
| **Submission** | id, content, file_path, submitted_at, grade, feedback | id | assignment_id → Assignment.id<br>student_id → User.id | N:1 with Assignment<br>N:1 with User (student) |

#### Detailed Entity Specifications

**User Entity:**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(150) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(10) CHECK (role IN ('TEACHER', 'STUDENT')) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Assignment Entity:**
```sql
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP NOT NULL,
    teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Submission Entity:**
```sql
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    file_path VARCHAR(500),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    grade INTEGER CHECK (grade >= 0 AND grade <= 100),
    feedback TEXT,
    UNIQUE(assignment_id, student_id)
);
```

#### Relationship Details
- **User ↔ Assignment**: One teacher can create many assignments (1:N)
- **User ↔ Submission**: One student can make many submissions (1:N)
- **Assignment ↔ Submission**: One assignment can have many submissions (1:N)
- **Constraint**: One student can submit only once per assignment (UNIQUE constraint)

### 3. API Endpoints Design

#### Authentication Endpoints
```http
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/refresh/
POST /api/auth/logout/
```

#### Core Functionality Endpoints

**3.1 Teacher Creates Assignment**
```http
POST /api/assignments/
Authorization: Bearer <teacher_jwt_token>
Content-Type: application/json

Request Body:
{
  "title": "Mathematics Assignment 1",
  "description": "Solve problems 1-20 from Chapter 5",
  "due_date": "2024-12-31T23:59:59Z"
}

Response (201 Created):
{
  "id": 1,
  "title": "Mathematics Assignment 1",
  "description": "Solve problems 1-20 from Chapter 5",
  "due_date": "2024-12-31T23:59:59Z",
  "teacher": {
    "id": 2,
    "first_name": "John",
    "last_name": "Doe"
  },
  "created_at": "2024-07-18T10:00:00Z",
  "updated_at": "2024-07-18T10:00:00Z"
}
```

**3.2 Student Submits Assignment**
```http
POST /api/submissions/
Authorization: Bearer <student_jwt_token>
Content-Type: multipart/form-data

Request Body:
- assignment_id: 1
- content: "Here is my solution to the assignment..."
- file: <uploaded_file> (optional)

Response (201 Created):
{
  "id": 1,
  "assignment": {
    "id": 1,
    "title": "Mathematics Assignment 1"
  },
  "student": {
    "id": 3,
    "first_name": "Jane",
    "last_name": "Smith"
  },
  "content": "Here is my solution to the assignment...",
  "file_path": "/media/submissions/assignment_1_student_3.pdf",
  "submitted_at": "2024-07-18T15:30:00Z",
  "grade": null,
  "feedback": null
}
```

**3.3 Teacher Views Submissions**
```http
GET /api/assignments/{assignment_id}/submissions/
Authorization: Bearer <teacher_jwt_token>

Response (200 OK):
[
  {
    "id": 1,
    "student": {
      "id": 3,
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane@example.com"
    },
    "content": "Here is my solution to the assignment...",
    "file_path": "/media/submissions/assignment_1_student_3.pdf",
    "submitted_at": "2024-07-18T15:30:00Z",
    "grade": 85,
    "feedback": "Good work! Consider improving the approach to problem 15."
  },
  {
    "id": 2,
    "student": {
      "id": 4,
      "first_name": "Bob",
      "last_name": "Wilson"
    },
    "content": "My assignment submission...",
    "file_path": null,
    "submitted_at": "2024-07-18T16:45:00Z",
    "grade": null,
    "feedback": null
  }
]
```

#### Complete API Endpoint List
```
Authentication:
├── POST   /api/auth/register/           # User registration
├── POST   /api/auth/login/              # User login
├── POST   /api/auth/refresh/            # Refresh JWT token
└── POST   /api/auth/logout/             # Logout user

Assignments:
├── GET    /api/assignments/             # List assignments
├── POST   /api/assignments/             # Create assignment (Teacher)
├── GET    /api/assignments/{id}/        # Get assignment details
├── PUT    /api/assignments/{id}/        # Update assignment (Teacher)
├── DELETE /api/assignments/{id}/        # Delete assignment (Teacher)
└── GET    /api/assignments/{id}/submissions/ # View submissions (Teacher)

Submissions:
├── GET    /api/submissions/             # List user's submissions
├── POST   /api/submissions/             # Submit assignment (Student)
├── GET    /api/submissions/{id}/        # Get submission details
└── PUT    /api/submissions/{id}/        # Update submission or grade

Utility:
├── GET    /swagger/                     # API documentation
├── GET    /redoc/                       # Alternative API docs
└── GET    /admin/                       # Django admin panel
```

### 4. Authentication Strategy

#### 4.1 Authentication Method: JWT (JSON Web Tokens)
```python
# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

#### 4.2 Role-Based Access Control
```python
# Custom User Model
class User(AbstractUser):
    ROLE_CHOICES = [
        ('TEACHER', 'Teacher'),
        ('STUDENT', 'Student'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'email'
```

#### 4.3 Permission Matrix

| Role | Create Assignment | View All Assignments | Submit Assignment | View Own Submissions | View All Submissions | Grade Submissions |
|------|------------------|---------------------|-------------------|---------------------|---------------------|-------------------|
| **TEACHER** | ✅ | ✅ (Own only) | ❌ | ❌ | ✅ (Own assignments) | ✅ |
| **STUDENT** | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |

#### 4.4 Security Implementation
```python
# Permission Classes
class IsTeacherOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == 'TEACHER'

class IsStudentOrTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['STUDENT', 'TEACHER']
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'TEACHER':
            return obj.assignment.teacher == request.user
        return obj.student == request.user
```

#### 4.5 Authentication Flow
```
1. User Registration:
   Frontend → POST /api/auth/register/ → Backend
   ├── Validate data
   ├── Create user with role
   ├── Generate JWT tokens
   └── Return user data + tokens

2. User Login:
   Frontend → POST /api/auth/login/ → Backend
   ├── Validate credentials
   ├── Generate JWT tokens
   └── Return user data + tokens

3. Authenticated Requests:
   Frontend → API Request + Authorization Header → Backend
   ├── Verify JWT token
   ├── Check user role permissions
   ├── Process request
   └── Return response

4. Token Refresh:
   Frontend → POST /api/auth/refresh/ → Backend
   ├── Validate refresh token
   ├── Generate new access token
   └── Return new tokens
```

### 5. Future Scaling Strategies

#### 5.1 Database Scaling
```
Current: SQLite (Single file database)
└── Development & Small deployments

Phase 1: PostgreSQL Migration
├── Better concurrency support
├── Advanced indexing capabilities
├── Full-text search for assignments
└── Better data integrity

Phase 2: Database Optimization
├── Read Replicas for query distribution
├── Connection pooling (PgBouncer)
├── Database partitioning by institution
└── Caching layer (Redis)

Phase 3: Multi-Database Architecture
├── User service database
├── Assignment service database
├── File storage service database
└── Analytics database
```

#### 5.2 Application Architecture Scaling
```
Current: Monolithic Django Application
└── Single server deployment

Phase 1: Horizontal Scaling
├── Load balancer (Nginx)
├── Multiple Django instances
├── Shared file storage (AWS S3)
└── Session management (Redis)

Phase 2: Microservices Architecture
├── User Management Service
├── Assignment Service
├── Submission Service
├── Notification Service
├── File Upload Service
└── API Gateway

Phase 3: Cloud-Native Architecture
├── Containerization (Docker)
├── Orchestration (Kubernetes)
├── Service mesh (Istio)
└── Auto-scaling policies
```

#### 5.3 Performance Optimization
```
Frontend Scaling:
├── Code splitting and lazy loading
├── CDN for static assets
├── Progressive Web App (PWA)
├── Client-side caching
└── Bundle optimization

Backend Scaling:
├── Database query optimization
├── API response caching
├── Background task processing (Celery)
├── Rate limiting and throttling
└── Monitoring and logging

Infrastructure Scaling:
├── Cloud deployment (AWS/GCP/Azure)
├── Container orchestration
├── Auto-scaling groups
├── Global content delivery
└── Multi-region deployment
```

#### 5.4 Feature Scaling Roadmap
```
Phase 1: Core Enhancements
├── Real-time notifications (WebSockets)
├── Advanced file type support
├── Plagiarism detection integration
├── Grade analytics and reporting
└── Mobile app development

Phase 2: Advanced Features
├── Video submission support
├── Collaborative assignments
├── Peer review system
├── Integration with LMS platforms
└── AI-powered grading assistance

Phase 3: Enterprise Features
├── Multi-tenant architecture
├── SSO integration (SAML, OAuth)
├── Advanced analytics dashboard
├── Compliance and audit trails
└── White-label customization
```

#### 5.5 Technology Evolution
```
Current Stack: Django + React + SQLite
└── Suitable for: 100-1000 users

Intermediate Stack: Django + React + PostgreSQL + Redis
└── Suitable for: 1K-10K users

Enterprise Stack: Microservices + React + PostgreSQL + Redis + AWS
└── Suitable for: 10K+ users

Technology Considerations:
├── Django → FastAPI (for better async support)
├── REST → GraphQL (for flexible queries)
├── SQLite → PostgreSQL → Distributed databases
├── File system → Cloud storage (S3, Google Cloud)
└── Monolith → Microservices → Serverless
```

## Summary

This system design provides a solid foundation for an EdTech assignment tracking platform with:

✅ **Scalable Architecture**: Clean separation between frontend, backend, and database
✅ **Secure Authentication**: JWT-based with role-based access control  
✅ **RESTful API Design**: Well-defined endpoints with proper HTTP methods
✅ **Database Design**: Normalized schema with appropriate relationships
✅ **Future-Proof**: Clear scaling strategies for growth

The implementation successfully addresses all requirements while maintaining flexibility for future enhancements and scaling needs.