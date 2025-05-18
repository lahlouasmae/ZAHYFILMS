# 🎥 ZAHY FILMS – Video Streaming Platform Based on Microservices
<p align="center">
  <img 
    alt="image" 
    src="https://github.com/user-attachments/assets/89f337a6-bfb7-444c-8fc4-b12f2d7850e2" 
    style="width: 300px; height: 300px;" 
  />
</p>

## 🧠 Project Overview

ZAHY FILMS is an innovative video streaming platform designed to offer an intuitive, personalized, and interactive experience. Built on a **microservices architecture**, it ensures scalability, modularity, and efficient management of video content, user interactions, and personalized recommendations.

## 🔑 Key Features

- User registration, login, and profile management
- Video uploading, categorization, and playback (free and subscription-based)
- Likes, dislikes, and comment system with sentiment analysis
- Personalized video recommendations based on:
  - Viewing history
  - Favorites
  - Comment sentiment
- Notification system for new videos and interactions
- Integrated chatbot assistant (CineBot)
- Admin dashboard for user and content management

---

## 🧱 Software Architecture

ZAHY FILMS follows a modern three-tier architecture:

![image](https://github.com/user-attachments/assets/d1a3571c-222b-4336-ba36-956013544e75)

### Frontend
- **Web**: Developed with Angular, TypeScript, HTML, and CSS
- **ia agent botpress**: Multilingual assistance, available 24/7, with answers to frequently asked questions about subscriptions and usage.
### Backend
- **Java & Spring Boot**: Modular microservices for Users, Videos, Comments, Recommendations, and Notifications
- **Python & Flask**: Sentiment analysis and AI services

### Databases & Storage
- **MySQL**: Relational data (users, subscriptions)
- **MongoDB**: Video metadata and user comments
- **MinIO**: Object-based storage for video files

### Communication
- **RabbitMQ**: Asynchronous service communication

## 🚀 Getting Started
## Prerequisites
- Java JDK 17+

- Node.js (v16+)
  
- MySQL Server
  
- Angular CLI
  
- Maven
  
- Git

### Backend Setup
```
bash
Copier
Modifier
git clone https://github.com/yourusername/zahy-films.git
cd backend
# Configure application.properties for DB access
mvn spring-boot:run
```
### Frontend Setup
```
bash
Copier
Modifier
cd frontend
npm install
ng serve --open
```
Frontend will run on: http://localhost:4200
Backend runs on: http://localhost:8080

## 🧪 Testing
✅ Unit Tests for each microservice

🔁 Integration Tests (User ↔ Video ↔ Recommendation)

🧪 API tests via Postman

📊 Code quality with SonarQube

## 📱 Features by Role
### 👤 User
- Register/Login

- Browse and watch videos

- Comment, like/dislike content

- Receive recommendations

- Access notification center

- Interact with CineBot (chat assistant)

### 🛠️ Admin
- Manage users and subscriptions

- Manage videos (upload, edit, delete)

- Moderate comments

- View platform stats (dashboard)

### 📚 Technologies Used
Frontend: Angular, TypeScript, HTML, CSS

Backend: Java, Spring Boot, Spring Security

AI Services: Python, Flask

Databases: MySQL, MongoDB

Storage: MinIO (S3 compatible)

Message Broker: RabbitMQ

Other Tools: Postman, Mailtrap, Botpress
AI agent: Botpress

## 🎥 Video Demo
A walkthrough of ZAHY FILMS features and architecture
https://github.com/user-attachments/assets/a4f16760-2ff6-4c65-aeff-5ef7b1557d4c

## 👨‍💻 Contributors
Asmae Lahlou 

Zineb Taghti

Hafsa Sabrou

Younes Amerga

Supervisor: Prof. Chafik Baidada – ENSA El Jadida

## 🤝 Contributing
We welcome contributions! If you’d like to improve or extend ZAHY FILMS:

Fork the repository

Create a new feature branch

Commit and push changes

Open a pull request

Let’s build something awesome together!

## 🏫 Academic Context
This project was developed as part of the Final Year Project (PFA) at the National School of Applied Sciences of El Jadida (ENSAJ) – Chouaib Doukkali University, 2024/2025.





