# MyNotes AI

> A smart, agentic note-taking application featuring **Note Buddy**—a built-in AI assistant powered by Google's Gemini.

---

## 🎬 Application Demo

Note Buddy isn't just a chatbot; it's an action-oriented agent that manages your database, structures entries, and extracts insights through natural language. 

Watch the full demonstration below:

<video src="assets/MyNotes%20demo.mp4" controls="controls" width="100%" alt="MyNotes AI Demo Video">
  Your browser does not support the video tag. <a href="assets/MyNotes%20demo.mp4">Click here to watch the demo video.</a>
</video>

*(If the video doesn't play inline, click [here](assets/MyNotes%20demo.mp4) to download/watch it.)*

---

## 🔐 Secure Access

Seamless and secure Google OAuth 2.0 integration ensures your personal data and notes stay private.

![Login Page Authentication Flow](assets/login%20page.gif)

---

## ✨ Key Features

* **Neural Assistant (Note Buddy):** An agentic AI that maps natural language directly to SQL database operations.
* **Intelligent UI Filtering:** Dynamically filters the dashboard view based on AI search intent.
* **Resilient API Handling:** Implemented exponential backoff and retry logic for stable Gemini AI responses.
* **Secure Authentication:** Easy Google login for secure, session-based access.
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
    Run the provided SQL scripts or use the seeder to populate the database:
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