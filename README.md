# News Research Tool 📈

A web application that helps analyze news articles, documents, and text using AI. Built with Flask and Ollama.

## Features
- Process multiple URLs for research
- Upload and analyze PDF/TXT files
- Process text input
- AI-powered question answering
- Beautiful and responsive UI

## Setup Instructions

### Local Ollama Setup
1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Run Ollama locally:
```bash
ollama serve
```

### Ngrok Setup (for connecting deployed backend to local Ollama)
1. Download ngrok from [ngrok.com](https://ngrok.com/download)
2. Sign up for a free account at [ngrok.com](https://ngrok.com/signup)
3. Configure ngrok with your authtoken:
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```
4. Start ngrok tunnel to Ollama:
```bash
ngrok http 11434
```
5. Copy the forwarding URL (e.g., https://something.ngrok-free.app)
6. Add this URL as `OLLAMA_URL` environment variable in Render dashboard

### Important Notes
- Keep both Ollama and ngrok running while using the application
- The ngrok URL changes each time you restart ngrok
- Update the `OLLAMA_URL` in Render whenever the ngrok URL changes

## Available Models
- phi3:mini
- gemma:2b
- tinyllama:1.1b
- llama3.2:1b
- phi4-mini:latest
- mistral:latest
- llama2:latest

## Usage
1. Choose input type (URLs, File, or Text)
2. Process your input
3. Ask questions about the processed content
4. Get AI-powered answers with source references

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Flask (Python)
- AI: Ollama
- Deployment: Render
- Tunneling: ngrok

## 🛠️ Requirements

- Python 3.8+
- Ollama running locally or on a server

## 🚀 Local Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Start Ollama server:
   ```
   ollama serve
   ```

3. Run the Flask backend:
   ```
   python api.py
   ```

4. Open `index.html` in a browser or serve with a static file server.

## 🌍 Deployment with Local Ollama

This setup allows you to deploy the frontend to GitHub Pages and the backend to PythonAnywhere while keeping Ollama running on your local machine.

### Step 1: Make Your Ollama Accessible

1. Keep Ollama running on your local machine:
   ```
   ollama serve
   ```

2. Set up port forwarding to make your local Ollama accessible from the internet:
   - Use a service like [ngrok](https://ngrok.com/) (free tier available):
     ```
     ngrok http 11434
     ```
     This will give you a temporary URL like `https://abc123.ngrok.io`

### Step 2: Deploy Frontend to GitHub Pages

1. Push your code to GitHub if you haven't already:
   ```
   git add .
   git commit -m "Prepare for GitHub Pages deployment"
   git push origin main
   ```

2. Create and push a gh-pages branch:
   ```
   git checkout -b gh-pages
   git push origin gh-pages
   ```

3. Enable GitHub Pages in your repository settings:
   - Go to your GitHub repository
   - Click "Settings" > "Pages"
   - Under "Source", select the "gh-pages" branch
   - Click "Save"
   - Your site will be available at `https://yourusername.github.io/news-research-tool/`

### Step 3: Deploy Backend to PythonAnywhere

1. Sign up for a free account at [PythonAnywhere](https://www.pythonanywhere.com/)

2. Create a new web app:
   - Click "Web" > "Add a new web app"
   - Choose "Flask" > "Python 3.8"
   - Set your working directory to `/home/yourusername/news-research-tool`

3. Upload your files:
   - Go to "Files" and create a new directory for your project
   - Upload your API files (api.py, requirements.txt)

4. Set up your virtual environment:
   - Open a Bash console in PythonAnywhere
   - Create and activate a virtual environment:
     ```
     mkvirtualenv --python=/usr/bin/python3.8 myenv
     pip install -r requirements.txt
     ```

5. Configure your web app:
   - Go to the "Web" tab
   - Under "Code" section, set:
     - Working directory: `/home/yourusername/news-research-tool`
     - WSGI configuration file: Click and edit to point to your Flask app
   - Under "Environment variables", add:
     ```
     OLLAMA_URL=https://your-ngrok-url.ngrok.io
     ```

6. Update the frontend API URL:
   - Edit app.js to point to your PythonAnywhere API:
     ```js
     const API_BASE_URL = window.location.hostname.includes('github.io')
         ? 'https://yourusername.pythonanywhere.com/api'
         : 'http://127.0.0.1:5000/api';
     ```

### Important Notes

- Your local computer must remain on with Ollama running for the application to work
- The free tier of PythonAnywhere has some limitations but doesn't require a credit card
- If your ngrok URL changes (free tier), you'll need to update the `OLLAMA_URL` in PythonAnywhere
- GitHub Pages is completely free and doesn't require a credit card

### Cost Breakdown

- GitHub Pages: FREE
- PythonAnywhere: FREE (basic tier)
- ngrok free tier: FREE (with limitations)
- Your local computer running Ollama: Power/electricity costs only

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/sakethBainagari/news-research-tool)
- [Developer Profile](https://github.com/sakethBainagari)

## 👨‍💻 Author

Developed by [Saketh Bainagari](https://github.com/sakethBainagari)

