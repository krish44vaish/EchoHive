# EchoHive - Anonymous Social Platform

A social platform designed for college students to share content anonymously or publicly. Users can create posts, interact with others, and participate in unique features like the "drip" question game. The platform fosters campus engagement while maintaining user privacy when desired.

## ✨ Features

### 🔐 Authentication
- JWT-based secure authentication
- Email verification via Nodemailer
- Password reset functionality

### 📝 Post System
- **Post Types**: Confession/Question/Meme
- **Content Options**:
  - Images/GIFs (via Cloudinary)
  - Pollspublic
- **Visibility**: Anonymous or Public
- Comments on posts
- College-specific or global visibility
- Commenting system

### 💧 Drip Feature
- Daily random questions
- Tag friends in responses
- Shuffle answer options
- Activity feed and response inbox

### 🤝 Social Features
- User search and profiles
- Follow/unfollow system
- Real-time notifications (Socket.io)

### 🏫 College Community
- College-specific feeds
- New user notifications
- Trending campus content

### User Management
- Profile customization
- Password changes
- Account settings

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React.js | Frontend framework |
| Redux | State management |
| Socket.io-client | Real-time updates |
| Axios | API requests |
| Cloudinary | Image uploads |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Server framework |
| MongoDB | Database |
| Mongoose | ODM for MongoDB |
| JWT | Authentication |
| Nodemailer | Email services |
| Cloudinary | File storage |
| Socket.io | Real-time server |

## 🚀 Installation

### Prerequisites
- Node.js v16+
- MongoDB Atlas account or local MongoDB
- Cloudinary account
- Email credentials for Nodemailer

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/ambrollins619/EchoHive.git
   cd EchoHive
   ```
2. **Backend Setup**
   ```bash
    cd backend
    npm install
    cp .env.example .env
   ```
3. **Frontend Setup**
   ```bash
    cd frontend
    npm install
   ```
4. Environment Variables
    backend/.env:
    ```env
    JWT_SECRET=your_jwt_secret
    MONGODB_URI=mongodb+srv://your-mongo-uri
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    EMAIL_USER=your_email@example.com
    EMAIL_PASS=your_email_password
    ```

5. **Running the Application**
    ```bash
    # In separate terminals:
    cd server && npm run dev
    cd client && npm start
    ```
