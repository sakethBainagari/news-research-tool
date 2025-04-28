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

This setup allows you to deploy the frontend and backend to Render.com while keeping Ollama running on your local machine.

### Step 1: Make Your Ollama Accessible

1. Keep Ollama running on your local machine:
   ```
   ollama serve
   ```

2. Set up port forwarding to make your local Ollama accessible from the internet:
   - Option 1: Use a service like [ngrok](https://ngrok.com/) (free tier available):
     ```
     ngrok http 11434
     ```
     This will give you a temporary URL like `https://abc123.ngrok.io`

   - Option 2: Configure your router for port forwarding (more advanced)

### Step 2: Deploy to Render.com

1. Create a GitHub repository and push your code:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. Sign up for a free [Render.com](https://render.com/) account

3. Use the Render Dashboard's "Blueprint" feature to deploy from your GitHub repo:
   - Click "New" > "Blueprint"
   - Select your GitHub repository
   - Render will detect the `render.yaml` file and set up both services

4. When prompted for the `OLLAMA_URL` environment variable, enter your ngrok URL or public IP with port: 
   ```
   https://your-ngrok-url.ngrok.io
   ```
   or
   ```
   http://your-public-ip:11434
   ```

### Important Notes

- Your local computer must remain on with Ollama running for the application to work
- Free Render services will "sleep" after 15 minutes of inactivity and take a few seconds to wake up
- If your ngrok URL changes (free tier), you'll need to update the `OLLAMA_URL` in Render

### Cost Breakdown

- Render.com static site: FREE
- Render.com web service (backend): FREE (with limitations)
- ngrok free tier: FREE (with limitations)
- Your local computer running Ollama: Power/electricity costs only

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/sakethBainagari/news-research-tool)
- [Developer Profile](https://github.com/sakethBainagari)

## 👨‍💻 Author

Developed by [Saketh Bainagari](https://github.com/sakethBainagari)

