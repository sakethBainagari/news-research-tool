# News Research Tool 📈

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Python 3.8+](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-2.3.3-green.svg)
![HTML/CSS/JS](https://img.shields.io/badge/Frontend-HTML%2FCSS%2FJS-orange)

A powerful tool for analyzing news content and extracting insights using Ollama LLMs. Ideal for researchers, journalists, and anyone who needs to process and analyze news content quickly and effectively.

## ✨ Features

- 🌐 URL content processing
- 📄 PDF and text file analysis
- ✍️ Direct text input processing
- 🔍 Question answering on processed content
- 🤖 Powered by local Ollama models
- 🌙 Dark/light mode toggling

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

