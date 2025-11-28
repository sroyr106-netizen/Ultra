// =====================================================
// AI CHATBOT - JAVASCRIPT
// Ultra-Futuristic Interactive Assistant
// =====================================================

// ===== CHATBOT STATE =====
let chatbotState = {
    isOpen: false,
    isTyping: false,
    conversationHistory: [],
    currentUser: null
};

// ===== PREDEFINED RESPONSES =====
const botResponses = {
    greetings: [
        "Hello! 👋 I'm your AI Attendance Assistant. How can I help you today?",
        "Hi there! 🤖 Welcome to the AI Attendance System. What can I do for you?",
        "Greetings! ✨ I'm here to assist you with attendance queries."
    ],

    attendance: [
        "To check your attendance, please visit the Student Dashboard. You can see your complete attendance history with subject-wise breakdown.",
        "Your attendance records are available in the Student Portal. Would you like me to explain how to access them?",
        "I can help you understand your attendance status. What specific information do you need?"
    ],

    faceScan: [
        "The AI Face Scan feature uses advanced facial recognition to mark attendance automatically. Simply position your face in front of the camera!",
        "Face scanning is quick and secure! Just select your subject and click 'Initiate Scan' on the homepage.",
        "Our AI-powered face recognition ensures accurate attendance marking in seconds. Would you like a demo?"
    ],

    reports: [
        "You can export your attendance reports in PDF or Excel format from the View Records section.",
        "Reports are available with various filters - by date, subject, or status. Check the Admin Dashboard!",
        "Need a report? Navigate to View Records and click the Export button. Easy!"
    ],

    help: [
        "I can assist you with:\n• Attendance queries\n• Face scan information\n• Report generation\n• Navigation help\n• Technical support",
        "Here's what I can help with:\n✅ Check attendance\n✅ Understand face scanning\n✅ Export reports\n✅ System navigation",
        "Let me guide you! Ask me about attendance, face scanning, reports, or any system features."
    ],

    thanks: [
        "You're welcome! 😊 Feel free to ask if you need anything else!",
        "Happy to help! ✨ Have a great day!",
        "Anytime! 🎓 Don't hesitate to reach out if you have more questions."
    ],

    unknown: [
        "I'm not sure I understand. Could you rephrase that?",
        "Hmm, I didn't quite get that. Can you ask in a different way?",
        "I'm still learning! Try asking about attendance, face scan, or reports."
    ]
};

// ===== QUICK REPLY OPTIONS =====
const quickReplies = {
    initial: [
        "Check Attendance",
        "Face Scan Info",
        "Export Reports",
        "Help & Support"
    ],

    attendance: [
        "View My Records",
        "Attendance Percentage",
        "Subject-wise Status"
    ],

    faceScan: [
        "How it Works",
        "Start Scanning",
        "Security Features"
    ],

    reports: [
        "Download PDF",
        "Export Excel",
        "Filter Records"
    ]
};

// ===== INITIALIZE CHATBOT =====
function initChatbot() {
    // Create chatbot HTML if it doesn't exist
    if (!document.querySelector('.chatbot-window')) {
        const chatbotHTML = `
            <div class="chatbot-window" id="chatbotWindow">
                <div class="chatbot-header">
                    <div class="chatbot-header-info">
                        <div class="chatbot-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="chatbot-info">
                            <div class="chatbot-name">AI Assistant</div>
                            <div class="chatbot-status">
                                <span class="status-dot"></span>
                                <span>Online</span>
                            </div>
                        </div>
                    </div>
                    <button class="chatbot-close" onclick="toggleChatbot()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="chatbot-messages" id="chatbotMessages">
                    <div class="welcome-message">
                        <i class="fas fa-robot"></i>
                        <h3>Welcome!</h3>
                        <p>I'm your AI Attendance Assistant. Ask me anything!</p>
                    </div>
                </div>
                
                <div class="typing-indicator" id="typingIndicator">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="typing-dots">
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                    </div>
                </div>
                
                <div class="chatbot-input-area">
                    <button class="voice-input-btn" onclick="toggleVoiceInput()" title="Voice Input">
                        <i class="fas fa-microphone"></i>
                    </button>
                    <input 
                        type="text" 
                        class="chatbot-input" 
                        id="chatbotInput"
                        placeholder="Type your message..."
                        onkeypress="handleChatEnter(event)"
                    >
                    <button class="chatbot-send-btn" onclick="sendMessage()">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    // Send initial greeting
    setTimeout(() => {
        addBotMessage(getRandomResponse('greetings'));
        showQuickReplies('initial');
    }, 500);
}

// ===== TOGGLE CHATBOT =====
function toggleChatbot() {
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotButton = document.querySelector('.ai-chatbot');

    if (!chatbotWindow) {
        initChatbot();
        return;
    }

    chatbotState.isOpen = !chatbotState.isOpen;

    if (chatbotState.isOpen) {
        chatbotWindow.classList.add('active');
        chatbotButton.style.transform = 'scale(0.9)';

        // Focus input
        setTimeout(() => {
            document.getElementById('chatbotInput')?.focus();
        }, 400);
    } else {
        chatbotWindow.classList.remove('active');
        chatbotButton.style.transform = 'scale(1)';
    }
}

// ===== SEND MESSAGE =====
function sendMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input?.value.trim();

    if (!message) return;

    // Add user message
    addUserMessage(message);

    // Clear input
    input.value = '';

    // Show typing indicator
    showTypingIndicator();

    // Process and respond
    setTimeout(() => {
        processMessage(message);
    }, 1000 + Math.random() * 1000);
}

// ===== ADD USER MESSAGE =====
function addUserMessage(text) {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) return;

    const time = getCurrentTime();

    const messageHTML = `
        <div class="message user">
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">${escapeHtml(text)}</div>
                <div class="message-time">${time}</div>
            </div>
        </div>
    `;

    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    scrollToBottom();

    // Save to history
    chatbotState.conversationHistory.push({
        type: 'user',
        text: text,
        time: time
    });
}

// ===== ADD BOT MESSAGE =====
function addBotMessage(text, showQuickRepliesType = null) {
    hideTypingIndicator();

    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) return;

    const time = getCurrentTime();

    const messageHTML = `
        <div class="message bot">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">${text}</div>
                <div class="message-time">${time}</div>
                ${showQuickRepliesType ? '<div class="quick-replies" id="quickReplies"></div>' : ''}
            </div>
        </div>
    `;

    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    scrollToBottom();

    // Save to history
    chatbotState.conversationHistory.push({
        type: 'bot',
        text: text,
        time: time
    });

    // Show quick replies if specified
    if (showQuickRepliesType) {
        setTimeout(() => showQuickReplies(showQuickRepliesType), 300);
    }
}

// ===== PROCESS MESSAGE =====
function processMessage(text) {
    const lowerText = text.toLowerCase();
    let response;
    let quickReplyType = null;

    // Detect intent
    if (lowerText.match(/hello|hi|hey|greetings/)) {
        response = getRandomResponse('greetings');
        quickReplyType = 'initial';
    }
    else if (lowerText.match(/attendance|record|present|absent/)) {
        response = getRandomResponse('attendance');
        quickReplyType = 'attendance';
    }
    else if (lowerText.match(/face|scan|camera|recognition/)) {
        response = getRandomResponse('faceScan');
        quickReplyType = 'faceScan';
    }
    else if (lowerText.match(/report|export|download|pdf|excel/)) {
        response = getRandomResponse('reports');
        quickReplyType = 'reports';
    }
    else if (lowerText.match(/help|support|guide|how/)) {
        response = getRandomResponse('help');
        quickReplyType = 'initial';
    }
    else if (lowerText.match(/thank|thanks|appreciate/)) {
        response = getRandomResponse('thanks');
    }
    else if (lowerText.match(/bye|goodbye|see you/)) {
        response = "Goodbye! 👋 Feel free to chat anytime you need help!";
    }
    else {
        response = getRandomResponse('unknown');
        quickReplyType = 'initial';
    }

    addBotMessage(response, quickReplyType);
}

// ===== SHOW QUICK REPLIES =====
function showQuickReplies(type) {
    const container = document.getElementById('quickReplies') ||
        document.querySelector('.quick-replies:last-child');

    if (!container || !quickReplies[type]) return;

    container.innerHTML = '';

    quickReplies[type].forEach(reply => {
        const button = document.createElement('button');
        button.className = 'quick-reply-btn';
        button.textContent = reply;
        button.onclick = () => handleQuickReply(reply);
        container.appendChild(button);
    });
}

// ===== HANDLE QUICK REPLY =====
function handleQuickReply(text) {
    const input = document.getElementById('chatbotInput');
    if (input) {
        input.value = text;
        sendMessage();
    }

    // Remove quick reply buttons
    document.querySelectorAll('.quick-replies').forEach(el => {
        el.style.opacity = '0.5';
        el.style.pointerEvents = 'none';
    });
}

// ===== TYPING INDICATOR =====
function showTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.classList.add('active');
        scrollToBottom();
    }
    chatbotState.isTyping = true;
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.classList.remove('active');
    }
    chatbotState.isTyping = false;
}

// ===== VOICE INPUT =====
let recognition = null;
let isRecording = false;

function toggleVoiceInput() {
    const button = document.querySelector('.voice-input-btn');

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('🎤 Voice input is not supported in this browser. Please try Chrome.');
        return;
    }

    if (!recognition) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const input = document.getElementById('chatbotInput');
            if (input) {
                input.value = transcript;
                sendMessage();
            }
        };

        recognition.onend = () => {
            isRecording = false;
            button.classList.remove('recording');
            button.innerHTML = '<i class="fas fa-microphone"></i>';
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            isRecording = false;
            button.classList.remove('recording');
            button.innerHTML = '<i class="fas fa-microphone"></i>';
        };
    }

    if (isRecording) {
        recognition.stop();
        isRecording = false;
        button.classList.remove('recording');
        button.innerHTML = '<i class="fas fa-microphone"></i>';
    } else {
        recognition.start();
        isRecording = true;
        button.classList.add('recording');
        button.innerHTML = '<i class="fas fa-microphone-slash"></i>';
    }
}

// ===== HANDLE ENTER KEY =====
function handleChatEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
}

// ===== UTILITY FUNCTIONS =====
function getRandomResponse(category) {
    const responses = botResponses[category];
    return responses[Math.floor(Math.random() * responses.length)];
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function scrollToBottom() {
    const container = document.getElementById('chatbotMessages');
    if (container) {
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== CLEAR CHAT =====
function clearChat() {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (messagesContainer) {
        messagesContainer.innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-robot"></i>
                <h3>Chat Cleared!</h3>
                <p>Start a new conversation below.</p>
            </div>
        `;
    }

    chatbotState.conversationHistory = [];

    setTimeout(() => {
        addBotMessage(getRandomResponse('greetings'));
        showQuickReplies('initial');
    }, 500);
}

// ===== EXPORT CHAT =====
function exportChat() {
    let chatText = 'AI Attendance System - Chat History\n';
    chatText += '='.repeat(50) + '\n\n';

    chatbotState.conversationHistory.forEach(msg => {
        const sender = msg.type === 'user' ? 'You' : 'AI Assistant';
        chatText += `[${msg.time}] ${sender}:\n${msg.text}\n\n`;
    });

    // Download as text file
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_history_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();

    addBotMessage('✅ Chat history exported successfully!');
}

// ===== SMART SUGGESTIONS =====
function getSuggestions(input) {
    const suggestions = [
        "How do I check my attendance?",
        "What is face scanning?",
        "How to export reports?",
        "Show my attendance percentage",
        "Help with navigation"
    ];

    return suggestions.filter(s =>
        s.toLowerCase().includes(input.toLowerCase())
    );
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🤖 Chatbot Module Loaded');

    // Initialize chatbot on first toggle
    const chatbotBtn = document.querySelector('.ai-chatbot');
    if (chatbotBtn && !chatbotBtn.onclick) {
        chatbotBtn.onclick = toggleChatbot;
    }
});

// ===== EXPORT FUNCTIONS =====
window.chatbot = {
    toggle: toggleChatbot,
    send: sendMessage,
    clear: clearChat,
    export: exportChat
};

console.log('%c🤖 Chatbot.js Loaded', 'color: #00d4ff; font-size: 16px; font-weight: bold;');
