# MyNotes AI

> A smart, agentic note-taking application featuring **Note Buddy**—a built-in AI assistant powered by Google's Gemini.

---

## 🎬 Demo Scenarios

Note Buddy isn't just a chatbot; it is an action-oriented agent that manages your database through natural language.

### 1. Smart Lifestyle Management
Turn messy thoughts into structured, tagged entries instantly.
**Prompt:** *"Note Buddy, I'm planning a new project called 'Stealth Mode'. Add: design a logo, find a co-founder, and register the domain. Tag it as work and high priority."*
![Smart Creation](assets/ai-create.gif)

### 2. Contextual Retrieval & Executive Summary
Filter your dashboard and extract key insights without opening a single file.
**Prompt:** *"Show me my high-priority work tasks and summarize the key phases in my 'Vision 2026' note."*
![Smart Filter and Summary](assets/ai-filter-summary.gif)

### 3. Agentic Updates & Safety Guardrails
Modify notes on the fly and perform bulk operations with built-in safety confirmations.
**Prompt:** *"Add 'Launch Beta' to my Stealth Mode milestones and delete all old archive notes."*
![Safety and Updates](assets/ai-safety-update.gif)

---

## 📸 Screenshots

| Dashboard | Note Buddy Assistant |
| :---: | :---: |
| <img src="assets/dashboard-screen.png" alt="Dashboard View" width="500"/> | <img src="assets/ai-chat-screen.png" alt="AI Chat View" width="500"/> |
| *Managing and organizing lifestyle notes.* | *Interacting with the Neural Assistant.* |

---

## ✨ Key Features

* **Neural Assistant (Note Buddy):** An agentic AI that maps natural language directly to SQL database operations.
* **Intelligent UI Filtering:** Dynamically filters the dashboard view based on AI search intent.
* **Resilient API Handling:** Implemented exponential backoff and retry logic for stable Gemini AI responses.
* **Secure Authentication:** Seamless Google OAuth 2.0 integration for personal data security.
* **Rich Text Editing:** Full-featured note management using the TipTap editor.

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js
* **Frontend:** React, Tailwind CSS, Zustand
* **AI Integration:** Google Generative AI SDK (`gemini-2.0-flash`)
* **Database:** PostgreSQL

---

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or higher)
* PostgreSQL running locally
* A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository:**
    ```bash
    git clone [https://github.com/sam-cant-code/MyNotesv1.git](https://github.com/sam-cant-code/MyNotesv1.git)
    cd MyNotesv1
    ```

2. **Install dependencies:**
    ```bash
    cd backend && npm install
    cd ../frontend && npm install
    ```

3. **Database Setup:**
    Run the provided SQL scripts or use the seeder for a professional-casual demo:
    ```bash
    cd backend
    node seed.js
    ```

4. **Environment Variables:**
    Create a `.env` file in the `backend` directory:
    ```env
    PORT=4000
    PG_USER=your_user
    PG_PASSWORD=your_password
    PG_DATABASE=your_db
    GEMINI_API_KEY=your_key
    GOOGLE_CLIENT_ID=your_id
    GOOGLE_CLIENT_SECRET=your_secret
    ```

5. **Run the application:**
    ```bash
    # Terminal 1: Backend
    cd backend && npm start
    
    # Terminal 2: Frontend
    cd frontend && npm run dev
    ```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).