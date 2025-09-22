const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/portfolioDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Session setup for admin login
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/portfolioDB' }),
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

// Routes
const mainRoutes = require('./routes/main');
const adminRoutes = require('./routes/admin');

app.use('/', mainRoutes);
app.use('/admin', adminRoutes);

// Socket.IO connection handling
const connectedUsers = new Map();
const connectedAdmins = new Set();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle user connections (from chat page)
  socket.on('user-join', (userData) => {
    console.log('User joined:', socket.id, userData);
    connectedUsers.set(socket.id, {
      id: socket.id,
      name: userData.name || 'Anonymous User',
      joinTime: new Date()
    });
    
    // Notify all admins about new user
    connectedAdmins.forEach(adminId => {
      io.to(adminId).emit('user-connected', connectedUsers.get(socket.id));
    });
  });

  // Handle admin connections
  socket.on('admin-join', () => {
    console.log('Admin joined:', socket.id);
    connectedAdmins.add(socket.id);
    
    // Send current user list to admin
    connectedUsers.forEach(userData => {
      socket.emit('user-connected', userData);
    });
  });

  // Handle incoming messages from users
  socket.on('message', (data) => {
    console.log('Message from user:', data);
    data.senderId = socket.id;
    
    // Broadcast to all admins
    connectedAdmins.forEach(adminId => {
      io.to(adminId).emit('user-message', data);
    });
  });

  // Handle admin messages
  socket.on('admin-message', (data) => {
    console.log('Message from admin:', data);
    
    // Send to specific user
    if (data.targetUser) {
      const userMessage = {
        message: data.message,
        timestamp: data.timestamp,
        sender: 'admin'
      };
      
      console.log('Sending message to user:', data.targetUser, userMessage);
      io.to(data.targetUser).emit('message', userMessage);
      
      // Confirm delivery to admin
      socket.emit('message-delivered', { targetUser: data.targetUser });
    }
  });

  // Handle typing indicators from users
  socket.on('typing', (data) => {
    data.senderId = socket.id;
    connectedAdmins.forEach(adminId => {
      io.to(adminId).emit('user-typing', data);
    });
  });

  socket.on('stopTyping', (data) => {
    data.senderId = socket.id;
    connectedAdmins.forEach(adminId => {
      io.to(adminId).emit('user-stop-typing', data);
    });
  });

  // Handle admin typing indicators
  socket.on('admin-typing', (data) => {
    if (data.targetUser) {
      io.to(data.targetUser).emit('typing', { sender: 'admin' });
    }
  });

  socket.on('admin-stop-typing', (data) => {
    if (data.targetUser) {
      io.to(data.targetUser).emit('stopTyping', { sender: 'admin' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    if (connectedUsers.has(socket.id)) {
      // User disconnected
      const userData = connectedUsers.get(socket.id);
      connectedUsers.delete(socket.id);
      
      // Notify all admins
      connectedAdmins.forEach(adminId => {
        io.to(adminId).emit('user-disconnected', socket.id);
      });
    } else if (connectedAdmins.has(socket.id)) {
      // Admin disconnected
      connectedAdmins.delete(socket.id);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
