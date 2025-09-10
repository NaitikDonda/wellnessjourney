// Global variables
let currentScreen = 'home-screen';
let moodData = [];
let moodChart = null;

// Screen navigation
function showScreen(screenId) {
    // Hide current screen
    const currentScreenElement = document.getElementById(currentScreen);
    if (currentScreenElement) {
        currentScreenElement.classList.remove('active');
    }
    
    // Show new screen
    const newScreenElement = document.getElementById(screenId);
    if (newScreenElement) {
        newScreenElement.classList.add('active');
        currentScreen = screenId;
        
        // Initialize screen-specific functionality
        if (screenId === 'mood-screen') {
            initializeMoodTracker();
        } else if (screenId === 'chat-screen') {
            focusChatInput();
        }
        
        // Update dashboard when home screen is shown
        if (screenId === 'home-screen') {
            updateDashboard();
        }
    }
}

// Dashboard Personalization Functions
function updateDashboard() {
    updatePersonalizedGreeting();
    updateMoodStats();
    updateStreakStats();
    updateActivityStats();
    updateAIInsight();
    updateRecentActivity();
}

function updatePersonalizedGreeting() {
    const greetingElement = document.getElementById('personalized-greeting');
    const hour = new Date().getHours();
    
    let timeGreeting = '';
    if (hour < 12) {
        timeGreeting = 'Good morning';
    } else if (hour < 17) {
        timeGreeting = 'Good afternoon';
    } else {
        timeGreeting = 'Good evening';
    }
    
    // Get user's name from localStorage or use default
    const userName = localStorage.getItem('userName') || 'there';
    
    // Check if user has logged mood today
    const today = new Date().toLocaleDateString();
    const todayMood = moodData.find(entry => entry.date === today);
    
    if (todayMood) {
        const moodEmojis = {
            'happy': '😊',
            'neutral': '😐',
            'sad': '😢',
            'very-sad': '😭',
            'angry': '😠'
        };
        greetingElement.textContent = `${timeGreeting}, ${userName}! ${moodEmojis[todayMood.type]} You're feeling ${todayMood.type.replace('-', ' ')} today.`;
    } else {
        greetingElement.textContent = `${timeGreeting}, ${userName}! How are you feeling today?`;
    }
}

function updateMoodStats() {
    const moodValueElement = document.getElementById('mood-stat-value');
    const moodIconElement = document.querySelector('#mood-stat-card .stat-icon');
    
    const today = new Date().toLocaleDateString();
    const todayMood = moodData.find(entry => entry.date === today);
    
    if (todayMood) {
        moodValueElement.textContent = todayMood.emoji + ' ' + todayMood.type.replace('-', ' ');
        moodIconElement.textContent = todayMood.emoji;
    } else {
        moodValueElement.textContent = 'Not logged yet';
        moodIconElement.textContent = '😊';
    }
}

function updateStreakStats() {
    const streakValueElement = document.getElementById('streak-stat-value');
    
    if (moodData.length === 0) {
        streakValueElement.textContent = '0 days';
        return;
    }
    
    // Calculate streak
    let streak = 0;
    const today = new Date();
    const sortedData = moodData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    for (let i = 0; i < sortedData.length; i++) {
        const entryDate = new Date(sortedData[i].timestamp);
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (entryDate.toDateString() === expectedDate.toDateString()) {
            streak++;
        } else {
            break;
        }
    }
    
    streakValueElement.textContent = `${streak} day${streak !== 1 ? 's' : ''}`;
}

function updateActivityStats() {
    const activityValueElement = document.getElementById('activity-stat-value');
    
    // Get completed exercises from localStorage
    const completedExercises = JSON.parse(localStorage.getItem('completedExercises') || '[]');
    
    // Filter exercises from this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const thisWeekExercises = completedExercises.filter(exercise => 
        new Date(exercise.timestamp) > oneWeekAgo
    );
    
    activityValueElement.textContent = `${thisWeekExercises.length} this week`;
}

function updateAIInsight() {
    const insightMessageElement = document.getElementById('ai-insight-message');
    
    if (moodData.length === 0) {
        insightMessageElement.textContent = 'Start tracking your mood to get personalized insights!';
        return;
    }
    
    // Analyze mood patterns
    const recentMoods = moodData.slice(-7); // Last 7 entries
    const moodCounts = {};
    
    recentMoods.forEach(entry => {
        moodCounts[entry.type] = (moodCounts[entry.type] || 0) + 1;
    });
    
    // Generate insight based on patterns
    let insight = '';
    
    if (moodCounts['happy'] && moodCounts['happy'] >= 3) {
        insight = 'Great job! You\'ve been feeling happy frequently lately. Keep doing what makes you feel good!';
    } else if (moodCounts['sad'] || moodCounts['very-sad']) {
        insight = 'I notice you\'ve been feeling down lately. Remember to be kind to yourself and consider trying some breathing exercises or talking to someone you trust.';
    } else if (moodCounts['angry']) {
        insight = 'I see some frustration in your recent moods. Maybe try some physical activity or meditation to help manage these feelings.';
    } else if (moodCounts['neutral'] && Object.keys(moodCounts).length === 1) {
        insight = 'You\'ve been feeling quite balanced lately. That\'s good! Maybe try something new to add some excitement to your days.';
    } else {
        insight = 'Your moods show a healthy mix of feelings. This is normal and shows emotional awareness. Keep tracking to understand your patterns better!';
    }
    
    // Add time-based insight
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
        insight += ' Remember to get good sleep for better mental health!';
    }
    
    insightMessageElement.textContent = insight;
}

function updateRecentActivity() {
    const activityFeedElement = document.getElementById('activity-feed');
    
    // Get all activities
    const moodActivities = moodData.map(entry => ({
        type: 'mood',
        emoji: entry.emoji,
        title: 'Mood logged',
        description: `Feeling ${entry.type.replace('-', ' ')}`,
        timestamp: entry.timestamp
    }));
    
    const completedExercises = JSON.parse(localStorage.getItem('completedExercises') || '[]');
    const exerciseActivities = completedExercises.map(exercise => ({
        type: 'exercise',
        emoji: '🧘',
        title: 'Exercise completed',
        description: exercise.name,
        timestamp: exercise.timestamp
    }));
    
    const chatMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    const chatActivities = chatMessages.slice(-5).map(message => ({
        type: 'chat',
        emoji: '💬',
        title: 'Chat with AI',
        description: message.content.substring(0, 30) + (message.content.length > 30 ? '...' : ''),
        timestamp: message.timestamp
    }));
    
    // Combine and sort all activities
    const allActivities = [...moodActivities, ...exerciseActivities, ...chatActivities]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5); // Show last 5 activities
    
    if (allActivities.length === 0) {
        activityFeedElement.innerHTML = '<p class="no-activity">No activity yet. Start by logging your mood!</p>';
        return;
    }
    
    // Generate activity HTML
    const activityHTML = allActivities.map(activity => {
        const timeAgo = getTimeAgo(new Date(activity.timestamp));
        return `
            <div class="activity-item">
                <div class="activity-icon">${activity.emoji}</div>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                </div>
                <div class="activity-time">${timeAgo}</div>
            </div>
        `;
    }).join('');
    
    activityFeedElement.innerHTML = activityHTML;
}

function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
    }
}

// Function to show notifications
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, var(--accent-cyan), var(--accent-purple));
        color: var(--bg-primary);
        padding: 15px 25px;
        border-radius: 15px;
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
        z-index: 1001;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add notification animations to CSS
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Function to track completed exercises
function completeExercise(exerciseName) {
    const completedExercises = JSON.parse(localStorage.getItem('completedExercises') || '[]');
    
    completedExercises.push({
        name: exerciseName,
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('completedExercises', JSON.stringify(completedExercises));
    
    // Update dashboard if on home screen
    if (currentScreen === 'home-screen') {
        updateDashboard();
    }
}

// Function to track chat messages
function trackChatMessage(content) {
    const chatMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    
    chatMessages.push({
        content: content,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 messages
    if (chatMessages.length > 50) {
        chatMessages.splice(0, chatMessages.length - 50);
    }
    
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
}

// Chat functionality
function focusChatInput() {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        setTimeout(() => chatInput.focus(), 300);
    }
}

function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    if (message === '') return;
    
    // Track the user's message
    trackChatMessage(message);
    
    // Add user message
    addMessage(message, 'user');
    chatInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate AI response
    setTimeout(() => {
        hideTypingIndicator();
        const aiResponse = generateAIResponse(message);
        addMessage(aiResponse, 'ai');
    }, 1500);
}

function addMessage(text, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.textContent = text;
    
    messageDiv.appendChild(bubbleDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.style.display = 'flex';
    }
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

function generateAIResponse(userMessage) {
    const responses = [
        "I understand how you're feeling. It's completely normal to have these emotions.",
        "Thank you for sharing that with me. Would you like to talk more about what's been on your mind?",
        "That sounds really challenging. Have you tried any relaxation techniques when you feel this way?",
        "I'm here to listen. Sometimes just talking about our feelings can help us process them better.",
        "It's brave of you to reach out. Remember, it's okay to not be okay sometimes.",
        "Have you considered talking to a trusted friend or family member about this?",
        "Let's focus on some positive things. What's something that made you smile recently?",
        "I appreciate you opening up. Would you like to try a quick breathing exercise together?",
        "Your feelings are valid. What do you think might help you feel better right now?",
        "It's great that you're taking steps to care for your mental health. That's really important."
    ];
    
    // Simple keyword-based responses
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('sad') || lowerMessage.includes('depressed')) {
        return "I'm sorry to hear you're feeling this way. Remember that these feelings are temporary, and you're not alone. Would you like to try a mood-boosting activity?";
    } else if (lowerMessage.includes('anxious') || lowerMessage.includes('worry')) {
        return "Anxiety can be really overwhelming. Let's try a simple breathing technique: breathe in for 4 counts, hold for 4, and exhale for 6. Would you like to try that with me?";
    } else if (lowerMessage.includes('angry')) {
        return "It's okay to feel angry. Those emotions are valid. Sometimes physical activity or creative expression can help channel that energy. What usually helps you when you feel this way?";
    } else if (lowerMessage.includes('happy') || lowerMessage.includes('good')) {
        return "That's wonderful to hear! It's great to focus on these positive moments. What's contributing to these good feelings?";
    } else if (lowerMessage.includes('help')) {
        return "I'm here to help you. Whether you need someone to talk to, resources, or just a listening ear, I'm here for you. What kind of support would be most helpful right now?";
    }
    
    // Return a random response if no keywords match
    return responses[Math.floor(Math.random() * responses.length)];
}

// Mood Tracker functionality
function initializeMoodTracker() {
    loadMoodData();
    updateMoodChart();
    displayMoodLogs();
}

function logMood(moodType, emoji) {
    const timestamp = new Date();
    const moodEntry = {
        type: moodType,
        emoji: emoji,
        timestamp: timestamp,
        date: timestamp.toLocaleDateString(),
        time: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    // Add to mood data
    moodData.push(moodEntry);
    
    // Save to localStorage
    localStorage.setItem('moodData', JSON.stringify(moodData));
    
    // Update UI
    updateMoodChart();
    displayMoodLogs();
    
    // Visual feedback
    const selectedEmoji = document.querySelector(`[data-mood="${moodType}"]`);
    if (selectedEmoji) {
        selectedEmoji.classList.add('selected');
        setTimeout(() => selectedEmoji.classList.remove('selected'), 1000);
    }
    
    // Show AI popup based on mood
    showAIMoodResponse(moodType);
}

function loadMoodData() {
    const saved = localStorage.getItem('moodData');
    if (saved) {
        moodData = JSON.parse(saved);
    }
}

function updateMoodChart() {
    const ctx = document.getElementById('moodChart');
    if (!ctx) return;
    
    // Get last 7 days of data
    const last7Days = moodData.slice(-7);
    
    const labels = last7Days.map(entry => entry.date);
    const data = last7Days.map(entry => {
        // Convert mood types to numerical values
        const moodValues = {
            'happy': 5,
            'neutral': 4,
            'sad': 3,
            'very-sad': 2,
            'angry': 1
        };
        return moodValues[entry.type] || 3;
    });
    
    if (moodChart) {
        moodChart.destroy();
    }
    
    moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Mood Trend',
                data: data,
                borderColor: '#00ffff',
                backgroundColor: 'rgba(0, 255, 255, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#00ffff',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 6,
                    ticks: {
                        color: '#ffffff',
                        stepSize: 1,
                        callback: function(value) {
                            const labels = ['', '😡', '😢', '😔', '😐', '😃'];
                            return labels[value] || '';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

function displayMoodLogs() {
    const logsContainer = document.getElementById('mood-logs');
    if (!logsContainer) return;
    
    logsContainer.innerHTML = '';
    
    // Show last 10 mood entries
    const recentMoods = moodData.slice(-10).reverse();
    
    recentMoods.forEach(entry => {
        const logEntry = document.createElement('div');
        logEntry.className = 'mood-log-entry';
        logEntry.innerHTML = `
            <span style="font-size: 1.5rem;">${entry.emoji}</span>
            <span style="color: rgba(255, 255, 255, 0.7);">${entry.date} at ${entry.time}</span>
        `;
        logsContainer.appendChild(logEntry);
    });
    
    if (recentMoods.length === 0) {
        logsContainer.innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.5);">No mood entries yet. Start by selecting how you feel!</p>';
    }
}

// Exercises functionality
function startExercise(type) {
    const exercises = {
        breathing: {
            title: "Breathing Exercise",
            instructions: "Find a comfortable position. We'll practice deep breathing for 2 minutes. Breathe in slowly for 4 counts, hold for 4, and exhale for 6 counts.",
            duration: 120000
        },
        meditation: {
            title: "Guided Meditation",
            instructions: "Close your eyes and focus on your breath. Let thoughts come and go without judgment. Notice the sensations in your body.",
            duration: 300000
        },
        journaling: {
            title: "Journaling",
            instructions: "Write about your thoughts and feelings. What's on your mind today? What are you grateful for? What challenges are you facing?",
            duration: 0
        },
        creative: {
            title: "Creative Expression",
            instructions: "Express yourself through drawing, writing, or any creative outlet. There's no right or wrong way to create.",
            duration: 0
        }
    };
    
    const exercise = exercises[type];
    if (exercise) {
        showExerciseModal(exercise);
    }
}

function showExerciseModal(exercise) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(10px);
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 40px;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;
    
    modalContent.innerHTML = `
        <h2 style="margin-bottom: 20px; color: #00ffff;">${exercise.title}</h2>
        <p style="margin-bottom: 30px; line-height: 1.6; color: rgba(255, 255, 255, 0.9);">${exercise.instructions}</p>
        <button onclick="completeExercise('${exercise.title}'); this.parentElement.parentElement.remove(); showNotification('Exercise completed! Great job! 🎉');" style="
            background: linear-gradient(45deg, #00ffff, #8338ec);
            border: none;
            color: #0d0d0d;
            padding: 12px 30px;
            border-radius: 25px;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            cursor: pointer;
            font-size: 1rem;
            margin-right: 10px;
        ">Complete Exercise</button>
        <button onclick="this.parentElement.parentElement.remove()" style="
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #ffffff;
            padding: 12px 30px;
            border-radius: 25px;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            cursor: pointer;
            font-size: 1rem;
        ">Close</button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Emergency functionality
function callEmergency(number) {
    if (confirm(`Are you sure you want to call ${number}?`)) {
        // In a real app, this would initiate a call
        alert(`This would call ${number}. In a real application, this would connect you to emergency services.`);
    }
}

function openChat(type) {
    if (type === 'crisis') {
        alert('This would connect you to a crisis text line. In a real application, you would be connected to a trained crisis counselor.');
    }
}

function findLocalHelp() {
    alert('This would show you local mental health resources and support services in your area. In a real application, this would use your location to find nearby help.');
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Enter key in chat input
    if (e.key === 'Enter' && document.activeElement.id === 'chat-input') {
        sendMessage();
    }
    
    // Escape key to go back to home
    if (e.key === 'Escape' && currentScreen !== 'home-screen') {
        showScreen('home-screen');
    }
});

// AI Mood Modal Functions
function showAIMoodResponse(moodType) {
    const modal = document.getElementById('ai-mood-modal');
    const title = document.getElementById('ai-modal-title');
    const message = document.getElementById('ai-modal-message');
    const input = document.getElementById('ai-mood-response');
    
    // Set modal content based on mood
    if (moodType === 'very-sad' || moodType === 'sad' || moodType === 'angry') {
        title.textContent = 'I\'m here for you';
        message.textContent = 'I notice you\'re feeling down. Would you like to share what\'s been bothering you? I\'m here to listen and help.';
    } else if (moodType === 'happy') {
        title.textContent = 'That\'s wonderful!';
        message.textContent = 'I\'m glad you\'re feeling good today! What made your day so great? I\'d love to hear about it.';
    } else if (moodType === 'neutral') {
        title.textContent = 'Checking in';
        message.textContent = 'How has your day been going so far? Anything interesting or challenging happen?';
    }
    
    // Clear previous input
    input.value = '';
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('active');
        input.focus();
    }, 500);
}

function closeAIModal() {
    const modal = document.getElementById('ai-mood-modal');
    modal.classList.remove('active');
}

function sendAIMoodResponse() {
    const input = document.getElementById('ai-mood-response');
    const userResponse = input.value.trim();
    
    if (userResponse === '') {
        input.focus();
        return;
    }
    
    // Show typing indicator
    const message = document.getElementById('ai-modal-message');
    const originalMessage = message.textContent;
    message.textContent = 'Thinking...';
    
    // Generate AI response
    setTimeout(() => {
        const aiResponse = generateMoodAIResponse(userResponse);
        message.textContent = aiResponse;
        
        // Change send button to close button
        const sendButton = document.querySelector('.ai-send-button');
        sendButton.innerHTML = '<span>Close</span>';
        sendButton.onclick = closeAIModal;
        
        // Hide input container
        const inputContainer = document.querySelector('.ai-modal-input-container');
        inputContainer.style.display = 'none';
    }, 1500);
}

function generateMoodAIResponse(userResponse) {
    const responses = {
        positive: [
            "That sounds amazing! I'm so happy for you. These positive moments are worth celebrating and remembering.",
            "Wonderful! It's great to hear about things that bring you joy. Would you like to save this as a positive memory?",
            "That's fantastic! Positive experiences like this can really boost our mood. Thanks for sharing this with me!",
            "I love hearing about your good experiences! These are the moments that make life special."
        ],
        negative: [
            "Thank you for sharing that with me. It sounds like you're going through a tough time. Remember, it's okay to feel this way, and you're not alone.",
            "I understand that must be difficult. Have you considered talking to someone you trust about this? I'm always here to listen.",
            "That sounds really challenging. Would you like to try a quick breathing exercise or meditation to help you feel more centered?",
            "I appreciate you opening up about this. Your feelings are completely valid. Would you like me to suggest some activities that might help?"
        ],
        neutral: [
            "Thanks for sharing that with me. Every day has its ups and downs, and it's good to acknowledge both.",
            "I understand. Some days are just like that. Is there anything specific you'd like to focus on or work through?",
            "Thank you for being honest about how you're feeling. Would you like to explore ways to make today even better?",
            "I appreciate you taking the time to check in with yourself. How can I best support you right now?"
        ]
    };
    
    const lowerResponse = userResponse.toLowerCase();
    
    // Detect sentiment based on keywords
    const positiveWords = ['good', 'great', 'happy', 'awesome', 'amazing', 'wonderful', 'fantastic', 'love', 'excited', 'fun', 'enjoyed', 'beautiful', 'perfect'];
    const negativeWords = ['bad', 'sad', 'angry', 'upset', 'frustrated', 'disappointed', 'stressed', 'anxious', 'worried', 'tired', 'exhausted', 'overwhelmed', 'difficult', 'hard'];
    
    const hasPositiveWords = positiveWords.some(word => lowerResponse.includes(word));
    const hasNegativeWords = negativeWords.some(word => lowerResponse.includes(word));
    
    let responseArray;
    if (hasPositiveWords && !hasNegativeWords) {
        responseArray = responses.positive;
    } else if (hasNegativeWords && !hasPositiveWords) {
        responseArray = responses.negative;
    } else {
        responseArray = responses.neutral;
    }
    
    return responseArray[Math.floor(Math.random() * responseArray.length)];
}

// Handle Enter key in AI mood input
document.addEventListener('DOMContentLoaded', () => {
    const aiMoodInput = document.getElementById('ai-mood-response');
    if (aiMoodInput) {
        aiMoodInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendAIMoodResponse();
            }
        });
    }
});

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load saved mood data
    loadMoodData();
    
    // Add some interactive particles
    createInteractiveParticles();
    
    // Initialize any screen-specific functionality
    if (currentScreen === 'mood-screen') {
        initializeMoodTracker();
    }
});

// Create interactive background particles
function createInteractiveParticles() {
    const particlesContainer = document.querySelector('.floating-particles');
    if (!particlesContainer) return;
    
    // Create additional particles
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            background: ${Math.random() > 0.5 ? '#00ffff' : '#ff006e'};
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.5 + 0.2};
            animation: float-particle ${Math.random() * 10 + 5}s infinite linear;
        `;
        particlesContainer.appendChild(particle);
    }
}

// Add floating particle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes float-particle {
        0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
