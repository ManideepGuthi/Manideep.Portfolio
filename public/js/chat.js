document.addEventListener('DOMContentLoaded', function() {
  const socket = io();
  const chatMessages = document.getElementById('chatMessages');
  const messageInput = document.getElementById('messageInput');
  const sendMessageBtn = document.getElementById('sendMessageBtn');
  const typingIndicator = document.getElementById('typingIndicator');
  const connectionStatus = document.getElementById('connectionStatus');

  let isTyping = false;
  let typingTimeout = undefined;
  const TYPING_TIMER_LENGTH = 1000; // 1 second

  // Join as user when connected
  socket.on('connect', () => {
    console.log('Connected to server');
    connectionStatus.textContent = 'Connected';
    connectionStatus.classList.add('connected');
    
    // Join as user
    socket.emit('user-join', {
      name: 'Anonymous User' // You could get this from a form or localStorage
    });
  });

  // Function to add a message to the chat display
  function addMessage(data, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'admin-message');

    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('message-avatar');
    avatarDiv.textContent = isUser ? 'U' : 'M'; // 'U' for User, 'M' for Admin

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
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to bottom
  }

  // Send message
  sendMessageBtn.addEventListener('click', function() {
    const message = messageInput.value.trim();
    if (message) {
      const messageData = {
        message: message,
        timestamp: new Date(),
        sender: 'user' // Assuming client is always the user
      };
      console.log('Sending user message:', messageData);
      socket.emit('message', messageData);
      addMessage(messageData, true); // Display user's own message
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
    if (!isTyping) {
      isTyping = true;
      socket.emit('typing', { sender: 'user' });
    }
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(stopTyping, TYPING_TIMER_LENGTH);
  });

  function stopTyping() {
    isTyping = false;
    socket.emit('stopTyping', { sender: 'user' });
  }

  // Socket.IO event listeners

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
    connectionStatus.textContent = 'Disconnected';
    connectionStatus.classList.remove('connected');
    connectionStatus.classList.add('disconnected');
  });

  socket.on('message', (data) => {
    console.log('Received message:', data);
    if (data.sender !== 'user') { // Only display messages from others
      console.log('Adding message from:', data.sender);
      addMessage(data, false);
    }
  });

  socket.on('typing', (data) => {
    if (data.sender !== 'user') {
      typingIndicator.style.display = 'flex';
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  });

  socket.on('stopTyping', (data) => {
    if (data.sender !== 'user') {
      typingIndicator.style.display = 'none';
    }
  });

  // Auto-focus input on load
  messageInput.focus();
});
