# MyNotesv1

> A smart, AI-integrated note-taking application featuring a built-in AI assistant powered by Google's Gemini.

---

## 🎬 Demo

**Login Page UI & Animations:**

![Login Page UI Animations](assets/login%20page.gif)

**Watch the Full Video Walkthrough:**

[![Project Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID_HERE/maxresdefault.jpg)](https://youtu.be/YOUR_VIDEO_ID_HERE)
*(Note: Replace `YOUR_VIDEO_ID_HERE` with your actual YouTube video ID, or link directly to a hosted `.mp4` file.)*

## 📸 Screenshots

| Dashboard | AI Chat Assistant |
| :---: | :---: |
| <img src="assets/dashboard-screen.png" alt="Dashboard View" width="500"/> | <img src="assets/ai-chat-screen.png" alt="AI Chat View" width="500"/> |
| *Managing and organizing notes.* | *Interacting with the Gemini-powered AI.* |

*(Note: Create an `assets` folder in your project, drop your screenshots in there, and update the filenames above if needed.)*

---

## ✨ Key Features

* **AI Chat Integration:** Ask questions and get assistance directly within your notes using Google's Gemini AI.
* **Resilient API Handling:** Implemented exponential backoff and retry logic to ensure stable AI responses even during high server demand.
* **Note Management:** Create, view, and manage your personal notes efficiently.

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js
* **AI Integration:** Google Generative AI SDK (`gemini-2.5-flash`)
* **Frontend:** *(Add your frontend tech here, e.g., React, HTML/CSS)*
* **Database:** *(Add your database here, e.g., MongoDB, PostgreSQL)*

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v16 or higher recommended)
* A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/sam-cant-code/MyNotesv1.git](https://github.com/sam-cant-code/MyNotesv1.git)
    cd MyNotesv1
    ```

2.  **Install backend dependencies:**
    ```bash
    cd backend
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in your `backend` directory and add your Gemini API key:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```

4.  **Run the application:**
    ```bash
    # Start the backend server
    node index.js # or npm start / npm run dev depending on your package.json
    ```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).