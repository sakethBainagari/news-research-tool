# News Research Tool

A tool for analyzing news content and extracting insights using Ollama LLMs.

## Features

- URL content processing
- PDF and text file analysis
- Direct text input processing
- Question answering on processed content

## Requirements

- Python 3.8+
- Ollama running locally or on a server

## Local Setup

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

## Deployment with Local Ollama

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

## Deployment Options

### Render.com (Free Tier)

1. Create a new Web Service pointing to your GitHub repo
2. Use the following settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python api.py`
   - Environment Variables: Add any necessary env vars

3. For the static site (frontend):
   - Create a new Static Site service
   - Set the build directory to the root (where index.html is)
   - Set the publish directory to the root

### Fly.io (Free Tier)

1. Install the Fly CLI
2. Create a `fly.toml` file:
   ```
   flyctl launch
   ```
3. Deploy:
   ```
   flyctl deploy
   ```

### Important Notes

- The Ollama service needs to be running and accessible for the application to function
- In a production environment, you may need to adjust the API_BASE_URL in app.js

## License

MIT

