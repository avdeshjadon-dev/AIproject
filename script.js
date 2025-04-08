const API_KEY = "AIzaSyCTmztnC6JovghK8_ysQfkQaLYC3BDcQFI"; // 🔐 Replace with your actual key
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Store chat sessions
let chatSessions = [];
let currentSessionId = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadChatSessions();
    createNewSession();
    
    document.getElementById('userInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

function loadChatSessions() {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
        chatSessions = JSON.parse(savedSessions);
    }
}

function saveChatSessions() {
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
}

function createNewSession() {
    const sessionId = Date.now().toString();
    const newSession = {
        id: sessionId,
        title: 'New Consultation',
        messages: [
            {
                role: 'assistant',
                content: "Hello! I'm your Legal Consultation Assistant. I can provide basic legal information and guidance. Please note that I'm not a substitute for professional legal advice. How can I help you today?"
            }
        ],
        createdAt: new Date().toISOString()
    };
    
    chatSessions.unshift(newSession);
    currentSessionId = sessionId;
    saveChatSessions();
    renderCurrentChat();
    
    // Focus the input field
    document.getElementById('userInput').focus();
}

function clearCurrentSession() {
    if (!currentSessionId) return;
    
    // Confirm before clearing
    if (!confirm('Are you sure you want to clear this consultation?')) {
        return;
    }
    
    const sessionIndex = chatSessions.findIndex(s => s.id === currentSessionId);
    if (sessionIndex !== -1) {
        // Keep the session but clear messages (except the initial greeting)
        chatSessions[sessionIndex].messages = [
            {
                role: 'assistant',
                content: "Hello! I'm your Legal Consultation Assistant. I can provide basic legal information and guidance. Please note that I'm not a substitute for professional legal advice. How can I help you today?"
            }
        ];
        chatSessions[sessionIndex].title = 'New Consultation';
        
        saveChatSessions();
        renderCurrentChat();
    }
}

function renderCurrentChat() {
    const session = chatSessions.find(s => s.id === currentSessionId);
    if (!session) return;
    
    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML = '';
    
    session.messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${message.role}`;
        messageDiv.textContent = message.content;
        chatBox.appendChild(messageDiv);
    });
    
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    if (!message || !currentSessionId) return;
    
    const session = chatSessions.find(s => s.id === currentSessionId);
    if (!session) return;
    
    // Add user message to session
    session.messages.push({
        role: 'user',
        content: message
    });
    
    // Update the session title if it's the first user message
    if (session.messages.length === 2) { // 1 assistant message + 1 user message
        session.title = message.length > 30 ? message.substring(0, 30) + '...' : message;
    }
    
    saveChatSessions();
    renderCurrentChat();
    userInput.value = '';
    
    try {
        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        document.getElementById('chatBox').appendChild(typingIndicator);
        document.getElementById('chatBox').scrollTop = document.getElementById('chatBox').scrollHeight;
        
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    { parts: [{ text: message }] }
                ]
            })
        });

        // Remove typing indicator
        document.getElementById('chatBox').removeChild(typingIndicator);
        
        const data = await response.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";
        
        // Add assistant message to session
        session.messages.push({
            role: 'assistant',
            content: reply
        });
        
        saveChatSessions();
        renderCurrentChat();
    } catch (error) {
        // Remove typing indicator
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            document.getElementById('chatBox').removeChild(typingIndicator);
        }
        
        // Add error message to session
        session.messages.push({
            role: 'assistant',
            content: "Error: " + error.message
        });
        
        saveChatSessions();
        renderCurrentChat();
        //avdesh
    }
}