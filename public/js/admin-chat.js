document.addEventListener('DOMContentLoaded', function() {
  const socket = io();
  const chatMessages = document.getElementById('chatMessages');
  const messageInput = document.getElementById('messageInput');
  const sendMessageBtn = document.getElementById('sendMessageBtn');
  const typingIndicator = document.getElementById('typingIndicator');
  const connectionStatus = document.getElementById('connectionStatus');
  const chatInputArea = document.getElementById('chatInputArea');
  const chatTitle = document.getElementById('chatTitle');
  const userList = document.getElementById('userList');
  const userCount = document.getElementById('userCount');

  let currentUser = null;
  let isTyping = false;
  let typingTimeout = undefined;
  const TYPING_TIMER_LENGTH = 1000; // 1 second
  let connectedUsers = new Map();

  // Initialize admin connection
  socket.emit('admin-join');

  // Function to add a message to the chat display
  function addMessage(data, isAdmin = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isAdmin ? 'admin' : 'user');

    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('message-avatar');
    avatarDiv.textContent = isAdmin ? 'A' : 'U';

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');

    const textSpan = document.createElement('span');
    textSpan.classList.add('message-text');
    textSpan.textContent = data.message;

    const timeSpan = document.createElement('span');
    timeSpan.classList.add('message-time');
    timeSpan.textContent = new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    contentDiv.appendChild(textSpan);
    contentDiv.appendChild(timeSpan);
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Function to update user list
  function updateUserList() {
    userList.innerHTML = '';
    userCount.textContent = `${connectedUsers.size} user${connectedUsers.size !== 1 ? 's' : ''}`;

    connectedUsers.forEach((userData, userId) => {
      const userItem = document.createElement('div');
      userItem.classList.add('user-item');
      if (currentUser && currentUser.id === userId) {
        userItem.classList.add('active');
      }

      const avatar = document.createElement('div');
      avatar.classList.add('user-avatar');
      avatar.textContent = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';

      const userInfo = document.createElement('div');
      userInfo.classList.add('user-info');

      const userName = document.createElement('div');
      userName.classList.add('user-name');
      userName.textContent = userData.name || 'Anonymous User';

      const userStatus = document.createElement('div');
      userStatus.classList.add('user-status');
      userStatus.textContent = 'Online';

      const onlineIndicator = document.createElement('div');
      onlineIndicator.classList.add('user-online-indicator');

      userInfo.appendChild(userName);
      userInfo.appendChild(userStatus);
      userItem.appendChild(avatar);
      userItem.appendChild(userInfo);
      userItem.appendChild(onlineIndicator);

      userItem.addEventListener('click', () => {
        selectUser(userId, userData);
      });

      userList.appendChild(userItem);
    });
  }

  // Function to select a user for chatting
  function selectUser(userId, userData) {
    currentUser = { id: userId, ...userData };
    
    // Update UI
    chatTitle.textContent = `Chatting with ${userData.name || 'Anonymous User'}`;
    chatInputArea.style.display = 'flex';
    
    // Clear messages and load conversation history
    chatMessages.innerHTML = '';
    
    // Add welcome message for this conversation
    const welcomeDiv = document.createElement('div');
    welcomeDiv.classList.add('message', 'admin');
    welcomeDiv.innerHTML = `
      <div class="message-avatar">A</div>
      <div class="message-content">
        <span class="message-text">You are now chatting with ${userData.name || 'Anonymous User'}</span>
        <span class="message-time">${new Date().toLocaleTimeString()}</span>
      </div>
    `;
    chatMessages.appendChild(welcomeDiv);
    
    // Update active user in sidebar
    document.querySelectorAll('.user-item').forEach(item => {
      item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Focus input
    messageInput.focus();
  }

  // Send message
  sendMessageBtn.addEventListener('click', function() {
    if (!currentUser) {
      console.log('No current user selected');
      return;
    }
    
    const message = messageInput.value.trim();
    if (message) {
      const messageData = {
        message: message,
        timestamp: new Date(),
        sender: 'admin',
        targetUser: currentUser.id
      };
      
      console.log('Sending admin message:', messageData);
      socket.emit('admin-message', messageData);
      addMessage(messageData, true); // Display admin's own message
      messageInput.value = '';
      stopTyping();
    }
  });

  // Send message on Enter key
  messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessageBtn.click();
    }
  });

  // Typing indicator logic
  messageInput.addEventListener('input', function() {
    if (!currentUser) return;
    
    if (!isTyping) {
      isTyping = true;
      socket.emit('admin-typing', { targetUser: currentUser.id });
    }
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(stopTyping, TYPING_TIMER_LENGTH);
  });

  function stopTyping() {
    if (!currentUser) return;
    
    isTyping = false;
    socket.emit('admin-stop-typing', { targetUser: currentUser.id });
  }

  // Socket.IO event listeners
  socket.on('connect', () => {
    console.log('Admin connected to server');
    connectionStatus.textContent = 'Connected';
    connectionStatus.style.color = '#4CAF50';
  });

  socket.on('disconnect', () => {
    console.log('Admin disconnected from server');
    connectionStatus.textContent = 'Disconnected';
    connectionStatus.style.color = '#ff6b6b';
  });

  // Handle user connections
  socket.on('user-connected', (userData) => {
    console.log('User connected:', userData);
    connectedUsers.set(userData.id, userData);
    updateUserList();
  });

  socket.on('user-disconnected', (userId) => {
    console.log('User disconnected:', userId);
    connectedUsers.delete(userId);
    updateUserList();
    
    // If current user disconnected, clear chat
    if (currentUser && currentUser.id === userId) {
      currentUser = null;
      chatTitle.textContent = 'Select a user to start chatting';
      chatInputArea.style.display = 'none';
      chatMessages.innerHTML = `
        <div class="welcome-message">
          <div class="welcome-icon">
            <i class="fas fa-comments"></i>
          </div>
          <h4>Welcome to Admin Chat</h4>
          <p>Select a user from the sidebar to start a conversation</p>
        </div>
      `;
    }
  });

  // Handle incoming messages from users
  socket.on('user-message', (data) => {
    console.log('Message from user:', data);
    console.log('Current user:', currentUser);
    console.log('Sender ID:', data.senderId);
    
    // Only show message if it's from the currently selected user
    if (currentUser && currentUser.id === data.senderId) {
      console.log('Adding message from selected user');
      addMessage(data, false);
    } else {
      console.log('Message not from selected user, ignoring');
    }
    
    // Update user list to show new message indicator
    updateUserList();
  });

  // Handle typing indicators from users
  socket.on('user-typing', (data) => {
    if (currentUser && currentUser.id === data.senderId) {
      typingIndicator.style.display = 'flex';
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  });

  socket.on('user-stop-typing', (data) => {
    if (currentUser && currentUser.id === data.senderId) {
      typingIndicator.style.display = 'none';
    }
  });

  // Handle admin message delivery confirmation
  socket.on('message-delivered', (data) => {
    console.log('Message delivered to user:', data);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
    // You could show a toast notification here
  });

  // Initialize with welcome message
  chatMessages.innerHTML = `
    <div class="welcome-message">
      <div class="welcome-icon">
        <i class="fas fa-comments"></i>
      </div>
      <h4>Welcome to Admin Chat</h4>
      <p>Select a user from the sidebar to start a conversation</p>
    </div>
  `;
});
