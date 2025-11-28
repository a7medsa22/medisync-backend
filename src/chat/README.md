# 💬 Chat System API Documentation

## 🔌 WebSocket Connection

### Connect
```javascript
const socket = io('http://localhost:3000/chat', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});
```

---

## 📡 REST API Endpoints

### 1. Get All Conversations
```http
GET /chat/conversations
Authorization: Bearer {token}
Role: DOCTOR, PATIENT

Response:
[
  {
    "connectionId": "...",
    "chatId": "...",
    "participant": {
      "id": "...",
      "userId": "...",
      "name": "Dr. Ahmed Mohamed",
      "role": "DOCTOR"
    },
    "lastMessage": {
      "id": "...",
      "content": "Hello, how are you?",
      "createdAt": "2025-11-23T..."
    },
    "lastMessageAt": "2025-11-23T...",
    "unreadCount": 3,
    "status": "ACTIVE"
  }
]
```

### 2. Get or Create Chat
```http
POST /chat/connection/:connectionId
Authorization: Bearer {token}
Role: DOCTOR, PATIENT

Response:
{
  "id": "chat-id",
  "connectionId": "...",
  "lastMessageAt": null,
  "connection": { ... }
}
```

### 3. Get Chat Details
```http
GET /chat/:chatId
Authorization: Bearer {token}
Role: DOCTOR, PATIENT

Response:
{
  "id": "...",
  "connectionId": "...",
  "connection": {
    "doctor": { "user": { "firstName": "Ahmed" } },
    "patient": { "user": { "firstName": "Ali" } }
  }
}
```

### 4. Get Messages (Paginated)
```http
GET /chat/:chatId/messages?page=1&limit=20
Authorization: Bearer {token}
Role: DOCTOR, PATIENT

Query Parameters:
- page: number (default: 1)
- limit: number (default: 20, max: 100)
- before: string (messageId for cursor-based pagination)

Response:
{
  "messages": [
    {
      "id": "...",
      "chatId": "...",
      "senderId": "...",
      "content": "Hello!",
      "messageType": "TEXT",
      "isRead": true,
      "readAt": "2025-11-23T...",
      "createdAt": "2025-11-23T...",
      "sender": {
        "id": "...",
        "firstName": "Ahmed",
        "lastName": "Mohamed",
        "role": "DOCTOR"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasMore": true
  }
}
```

### 5. Send Message (REST Fallback)
```http
POST /chat/messages
Authorization: Bearer {token}
Role: DOCTOR, PATIENT

Body:
{
  "chatId": "...",
  "content": "Hello, how are you?",
  "messageType": "TEXT"
}

Response:
{
  "id": "...",
  "chatId": "...",
  "content": "Hello, how are you?",
  "sender": { ... },
  "createdAt": "2025-11-23T..."
}
```

### 6. Mark Message as Read
```http
PUT /chat/messages/:messageId/read
Authorization: Bearer {token}
Role: DOCTOR, PATIENT

Response:
{
  "id": "...",
  "isRead": true,
  "readAt": "2025-11-23T..."
}
```

### 7. Mark All Messages as Read
```http
PUT /chat/:chatId/read-all
Authorization: Bearer {token}
Role: DOCTOR, PATIENT

Response:
{
  "message": "All messages marked as read"
}
```

### 8. Delete Message
```http
DELETE /chat/messages/:messageId
Authorization: Bearer {token}
Role: DOCTOR, PATIENT (sender only)

Response:
{
  "message": "Message deleted successfully"
}
```

### 9. Get Unread Count (Total)
```http
GET /chat/unread/count
Authorization: Bearer {token}
Role: DOCTOR, PATIENT

Response:
{
  "count": 5
}
```

### 10. Get Unread Count for Chat
```http
GET /chat/:chatId/unread/count
Authorization: Bearer {token}
Role: DOCTOR, PATIENT

Response:
{
  "count": 2
}
```

---

## 🔌 WebSocket Events

### Client → Server

#### 1. Join Chat
```javascript
socket.emit('join_chat', { chatId: '...' });
```

#### 2. Leave Chat
```javascript
socket.emit('leave_chat', { chatId: '...' });
```

#### 3. Send Message
```javascript
socket.emit('send_message', {
  chatId: '...',
  content: 'Hello!'
});
```

#### 4. Mark as Read
```javascript
socket.emit('mark_as_read', { messageId: '...' });
```

#### 5. Start Typing
```javascript
socket.emit('typing_start', { chatId: '...' });
```

#### 6. Stop Typing
```javascript
socket.emit('typing_stop', { chatId: '...' });
```

#### 7. Check Online Status
```javascript
socket.emit('check_online', { userId: '...' });
```

---

### Server → Client

#### 1. New Message
```javascript
socket.on('new_message', (message) => {
  console.log('New message:', message);
});
```

#### 2. Message Sent Confirmation
```javascript
socket.on('message_sent', (data) => {
  console.log('Message sent:', data.message);
});
```

#### 3. Message Read
```javascript
socket.on('message_read', (data) => {
  console.log('Message read:', data.messageId, data.readAt);
});
```

#### 4. User Typing
```javascript
socket.on('user_typing', (data) => {
  console.log(`${data.userId} is typing in chat ${data.chatId}`);
});
```

#### 5. User Stopped Typing
```javascript
socket.on('user_stopped_typing', (data) => {
  console.log(`${data.userId} stopped typing`);
});
```

#### 6. User Online
```javascript
socket.on('user_online', (data) => {
  console.log(`${data.userId} is now online`);
});
```

#### 7. User Offline
```javascript
socket.on('user_offline', (data) => {
  console.log(`${data.userId} is now offline`);
});
```

#### 8. User Status Response
```javascript
socket.on('user_status', (data) => {
  console.log(`${data.userId} is ${data.isOnline ? 'online' : 'offline'}`);
});
```

#### 9. Error
```javascript
socket.on('error', (error) => {
  console.error('Error:', error.message);
});
```

---

## 🔒 Access Control Rules

1. ✅ Can only chat with users in ACTIVE connections
2. ✅ Doctors can only see chats with their patients
3. ✅ Patients can only see chats with their doctors
4. ✅ Can only delete own messages
5. ✅ Can only mark messages as read if recipient (not sender)
6. ❌ Cannot send messages if connection is INACTIVE or BLOCKED

---

## 🔔 Automatic Notifications

### When are notifications sent?

1. **New Message** (recipient offline):
   - Type: `NEW_CHAT_MESSAGE`
   - Title: "New message from Dr. Ahmed"
   - Message: First 100 characters of the message
   - Metadata: `{ chatId, messageId, senderId }`

2. **Connection established**:
   - System message created automatically
   - No push notification (just in-chat message)

---

## 📊 Database Schema

```prisma
Chat
├── id (uuid)
├── connectionId (unique FK)
├── lastMessageAt
├── lastMessagePreview (cached)
└── messages []

Message
├── id (uuid)
├── chatId (FK)
├── senderId (FK)
├── content
├── messageType (TEXT, SYSTEM)
├── isRead
├── readAt
├── isDeleted
└── deletedAt

DoctorPatientConnection (updated)
├── lastMessageAt (cached)
├── unreadCount (cached)
└── chat (1:1 relation)
```

---

## ⚡ Performance Features

1. **Caching**:
   - Last message preview cached in Chat table
   - Unread count cached in Connection table
   - Reduces DB queries

2. **Pagination**:
   - Messages paginated (20 per page by default)
   - Supports cursor-based pagination

3. **Indexing**:
   - All foreign keys indexed
   - createdAt indexed for sorting
   - isRead indexed for unread queries

4. **WebSocket Rooms**:
   - Each chat is a separate room
   - Messages only sent to relevant users

---

## 🎯 Best Practices

### Frontend:
1. Always connect WebSocket on app load (if authenticated)
2. Join chat room when entering chat screen
3. Leave chat room when exiting
4. Stop typing after 3 seconds of inactivity
5. Show typing indicator for max 5 seconds
6. Mark messages as read when visible
7. Handle reconnection on disconnect

### Backend:
1. Rate limit: max 10 messages per minute
2. Message max length: 5000 characters
3. Auto-disconnect idle connections after 5 minutes
4. Validate all inputs
5. Log all WebSocket events for debugging