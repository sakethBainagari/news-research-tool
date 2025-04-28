// DOM Elements
// Card elements
const urlCard = document.getElementById('url-card');
const fileCard = document.getElementById('file-card');
const textCard = document.getElementById('text-card');

// Page elements
const mainPage = document.getElementById('main-page');
const urlPage = document.getElementById('url-page');
const filePage = document.getElementById('file-page');
const textPage = document.getElementById('text-page');
const questionPage = document.getElementById('question-page');

// Header elements
const header = document.querySelector('header');
const animationContainer = document.querySelector('.animation-container');
const titleAnimation = document.querySelector('.title-animation');

// Input elements
const fileInput = document.getElementById('file-input');
const fileName = document.getElementById('file-name');
const textInput = document.getElementById('text-input');
const urlQuery = document.getElementById('url-query');
const textQuery = document.getElementById('text-query');
const fileQuery = document.getElementById('file-query');

// Button elements
const processUrlBtn = document.getElementById('process-url-btn');
const processFileBtn = document.getElementById('process-file-btn');
const processTextBtn = document.getElementById('process-text-btn');
const backButtons = document.querySelectorAll('.back-btn');
const askBtn = document.getElementById('ask-btn');
const urlAskBtn = document.getElementById('url-ask-btn');
const textAskBtn = document.getElementById('text-ask-btn');
const fileAskBtn = document.getElementById('file-ask-btn');

// Model selects
const urlModelSelect = document.getElementById('url-model-select');
const fileModelSelect = document.getElementById('file-model-select');
const textModelSelect = document.getElementById('text-model-select');

// Other elements
const queryInput = document.getElementById('query');
const loader = document.getElementById('loader');
const result = document.getElementById('result');
const answerText = document.getElementById('answer-text');
const sourcesContainer = document.getElementById('sources-container');
const errorMessage = document.getElementById('error-message');

// Result elements
const urlLoader = document.getElementById('url-loader');
const urlResult = document.getElementById('url-result');
const urlAnswerText = document.getElementById('url-answer-text');
const urlSourcesContainer = document.getElementById('url-sources-container');

const textLoader = document.getElementById('text-loader');
const textResult = document.getElementById('text-result');
const textAnswerText = document.getElementById('text-answer-text');
const textSourcesContainer = document.getElementById('text-sources-container');

const fileLoader = document.getElementById('file-loader');
const fileResult = document.getElementById('file-result');
const fileAnswerText = document.getElementById('file-answer-text');
const fileSourcesContainer = document.getElementById('file-sources-container');

// Base API URL - change this to your Python backend server URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://127.0.0.1:5000/api'
    : '/api';  // In production, the API is at the same origin or use full URL if needed

// Add debug logging to help track API calls
function logApiCall(endpoint, method, data) {
    console.log(`API Call: ${method} ${API_BASE_URL}/${endpoint}`);
    console.log('Data:', data);
}

// State
let processedData = false;
let uploadedFile = null;
let isProcessing = false;
let currentDataType = null; // 'url', 'file', or 'text'

// Event Listeners for Cards - FIXED VERSION
urlCard.addEventListener('click', function(event) {
    // Prevent default behavior
    event.preventDefault();
    // Show URL page
    showPage(urlPage, event);
});

fileCard.addEventListener('click', function(event) {
    // Prevent default behavior
    event.preventDefault();
    // Show file page
    showPage(filePage, event);
});

textCard.addEventListener('click', function(event) {
    // Prevent default behavior
    event.preventDefault();
    // Show text page
    showPage(textPage, event);
});

// Event Listeners for Back buttons
backButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const parentPage = button.closest('.input-page');
        
        // If we're on the question page, we need special handling
        if (parentPage === questionPage) {
            showPage(mainPage, event);
            hideResult();
            hideError();
            processedData = false;
        } else {
            showPage(mainPage, event);
        }
    });
});

// Event Listeners for file input
fileInput.addEventListener('change', handleFileSelection);

// Event Listeners for process buttons
processUrlBtn.addEventListener('click', () => processData('url'));
processFileBtn.addEventListener('click', () => processData('file'));
processTextBtn.addEventListener('click', () => processData('text'));

// Event Listeners for ask question
askBtn.addEventListener('click', askQuestion);
queryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') askQuestion();
});

// URL specific question asking
urlAskBtn.addEventListener('click', askUrlQuestion);
urlQuery.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') askUrlQuestion();
});

// Text specific question asking
textAskBtn.addEventListener('click', askTextQuestion);
textQuery.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') askTextQuestion();
});

// File specific question asking
fileAskBtn.addEventListener('click', askFileQuestion);
fileQuery.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') askFileQuestion();
});

// Listen for scroll events to animate content
window.addEventListener('scroll', handleScroll);

// Enhanced function to add 3D hover effect to cards
function addCardHoverEffect() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', handleCardHover);
        card.addEventListener('mouseleave', handleCardReset);
        
        // Make sure the card is visible immediately for stability
        card.classList.add('visible');
    });
}

// Card hover handler for 3D effect
function handleCardHover(e) {
    const card = this;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation values based on mouse position
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20; // Reduced intensity
    const rotateY = (centerX - x) / 20; // Reduced intensity
    
    // Apply MILD 3D transform that won't cause layout issues
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    
    // Add shine effect based on mouse position
    const shine = card.querySelector('.card-shine') || createShineElement(card);
    shine.style.opacity = '0.15';
    shine.style.backgroundImage = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 80%)`;
}

// Reset card to original state
function handleCardReset() {
    this.style.transform = '';
    const shine = this.querySelector('.card-shine');
    if (shine) {
        shine.style.opacity = '0';
    }
}

// Create shine element for cards
function createShineElement(card) {
    const shine = document.createElement('div');
    shine.className = 'card-shine';
    card.appendChild(shine);
    return shine;
}

// Add page transition effect
function addPageTransition() {
    const allPages = [mainPage, urlPage, filePage, textPage, questionPage];
    
    allPages.forEach(page => {
        if (page) {
            page.classList.add('page-transition');
        }
    });
}

// Enhanced scroll animation
function handleScroll() {
    // Only run on main page
    if (mainPage.style.display !== 'none') {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const cards = document.querySelectorAll('.card');
        
        // Add visible class to cards when they're in view
        // But keep opacity at 1 to prevent disappearing
        cards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;
            
            if (cardTop < windowHeight * 0.8) {
                card.classList.add('visible');
            }
        });
        
        // Parallax effect on title animation with limits to prevent content from disappearing
        if (titleAnimation) {
            // Limit the parallax to ensure content stays visible
            const titleOffset = Math.min(scrollPosition * 0.2, 100);
            titleAnimation.style.transform = `translateY(${titleOffset}px)`;
            
            // Ensure minimum opacity is high enough to remain visible
            titleAnimation.style.opacity = Math.max(1 - scrollPosition / 800, 0.5);
        }
    }
}

// Create ripple effect on buttons
function addButtonRippleEffect() {
    const buttons = document.querySelectorAll('.primary-btn, .back-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Enhanced showPage function with animations that won't cause content to disappear
function showPage(page, event) {
    // Hide all pages
    mainPage.style.display = 'none';
    urlPage.style.display = 'none';
    filePage.style.display = 'none';
    textPage.style.display = 'none';
    questionPage.style.display = 'none';
    
    // Add animation class to the page being shown but ensure content stays visible
    page.classList.add('animate-in');
    page.style.opacity = '1'; // Ensure pages are always visible
    
    // Show the requested page with correct display type
    if (page === mainPage) {
        page.style.display = 'block';
        document.querySelector('.card-container').style.display = 'flex';
        
        // If returning to main page, show title animation
        titleAnimation.style.display = 'flex';
        titleAnimation.style.opacity = '1'; // Ensure title is always visible
        
        // ONLY auto-scroll when explicitly clicking the back button
        const isBackButtonClick = event && event.target && event.target.classList.contains('back-btn');
        if (isBackButtonClick) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    } else {
        // We're displaying a specific feature page (not the main page)
        page.style.display = 'block';
        
        // Hide title animation when not on main page
        titleAnimation.style.display = 'none';
        
        // Don't do any auto-scrolling when showing a specific page
    }
    
    // No need to hide animation container separately since it's now inside title-animation
    if (page !== mainPage) {
        header.style.marginBottom = '10px';
    } else {
        header.style.marginBottom = '30px';
    }
    
    // Reset form fields when showing pages
    if (page === urlPage) {
        hideUrlResult();
        hideUrlError();
        urlQuery.value = '';
    } else if (page === filePage) {
        hideFileResult();
        hideFileError();
        fileQuery.value = '';
    } else if (page === textPage) {
        hideTextResult();
        hideTextError();
        textQuery.value = '';
    }
    
    // Apply entrance animation but ensure content doesn't disappear
    setTimeout(() => {
        page.classList.remove('animate-in');
    }, 500);
}

function handleFileSelection(e) {
    uploadedFile = e.target.files[0];
    if (uploadedFile) {
        fileName.textContent = uploadedFile.name;
    }
}

async function processData(type) {
    if (isProcessing) return;
    
    isProcessing = true;
    hideError();
    currentDataType = type;
    
    let processingBtn;
    let modelValue;
    
    switch(type) {
        case 'url':
            processingBtn = processUrlBtn;
            modelValue = urlModelSelect.value;
            showUrlLoader();
            hideUrlResult();
            break;
        case 'file':
            processingBtn = processFileBtn;
            modelValue = fileModelSelect.value;
            showFileLoader();
            hideFileResult();
            break;
        case 'text':
            processingBtn = processTextBtn;
            modelValue = textModelSelect.value;
            showTextLoader();
            hideTextResult();
            break;
    }
    
    updateButton(processingBtn, true);
    
    try {
        if (type === 'url') {
            // Process URLs
            const urls = [
                document.getElementById('url1').value,
                document.getElementById('url2').value,
                document.getElementById('url3').value
            ].filter(url => url.trim() !== '');
            
            if (urls.length === 0) {
                throw new Error('Please enter at least one URL.');
            }
            
            logApiCall('process-urls', 'POST', { urls, model: modelValue });
            
            const response = await fetch(`${API_BASE_URL}/process-urls`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    urls: urls,
                    model: modelValue
                })
            });
            
            const responseData = await response.json();
            
            if (!response.ok) {
                if (responseData.details && Array.isArray(responseData.details)) {
                    throw new Error(`${responseData.error}\n\n${responseData.details.join('\n')}`);
                } else {
                    throw new Error(responseData.error || `Server error: ${response.status}`);
                }
            }
            
            // Check for warnings
            if (responseData.warnings && responseData.warnings.length > 0) {
                const warningMessage = responseData.warnings.join('\n\n');
                showUrlWarning(warningMessage);
            }
            
            processedData = true;
            showSuccess('URLs processed successfully!');
            hideUrlLoader();
            // Now ready to answer questions directly in the URL page
            
        } else if (type === 'file') {
            // Process file
            if (!uploadedFile) {
                throw new Error('Please select a file to upload.');
            }
            
            const formData = new FormData();
            formData.append('file', uploadedFile);
            formData.append('model', modelValue);
            
            console.log('Uploading file:', uploadedFile.name);
            logApiCall('process-file', 'POST', { fileName: uploadedFile.name, model: modelValue });
            
            const response = await fetch(`${API_BASE_URL}/process-file`, {
                method: 'POST',
                body: formData
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error details:', errorData);
                throw new Error(`Server error: ${response.status}${errorData.error ? ' - ' + errorData.error : ''}`);
            }
            
            const data = await response.json();
            console.log('Processing response:', data);
            
            processedData = true;
            showSuccess('File processed successfully!');
            hideFileLoader();
            // Now ready to answer questions directly in the file page
            
        } else if (type === 'text') {
            // Process text input
            const text = textInput.value.trim();
            
            if (!text) {
                throw new Error('Please enter some text.');
            }
            
            logApiCall('process-text', 'POST', { textLength: text.length, model: modelValue });
            
            const response = await fetch(`${API_BASE_URL}/process-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    model: modelValue
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            await response.json();
            processedData = true;
            showSuccess('Text processed successfully!');
            hideTextLoader();
            // Now ready to answer questions directly in the text page
        }
    } catch (error) {
        console.error('Processing error:', error);
        if (type === 'url') {
            hideUrlLoader();
            showUrlError(error.message || 'An error occurred while processing your URLs.');
        } else if (type === 'file') {
            hideFileLoader();
            showFileError(error.message || 'An error occurred while processing your file.');
        } else if (type === 'text') {
            hideTextLoader();
            showTextError(error.message || 'An error occurred while processing your text.');
        }
    } finally {
        isProcessing = false;
        updateButton(processingBtn, false);
    }
}

// Functions for handling sources display
function displaySingleSource(container, sources) {
    container.innerHTML = '';
    
    if (sources && sources.length > 0) {
        // Create a single source element
        const sourceItem = document.createElement('div');
        sourceItem.className = 'single-source';
        
        // Use the first source in the array
        const source = sources[0];
        
        const sourceTitle = document.createElement('h4');
        sourceTitle.className = 'source-title';
        sourceTitle.textContent = 'Source';
        
        const sourceContent = document.createElement('div');
        sourceContent.className = 'source-content';
        sourceContent.textContent = source.content || '';
        
        const sourceUrl = document.createElement('div');
        sourceUrl.className = 'source-url';
        if (source.source || source.url) {
            sourceUrl.textContent = source.source || source.url;
        }
        
        sourceItem.appendChild(sourceTitle);
        sourceItem.appendChild(sourceContent);
        if (source.source || source.url) {
            sourceItem.appendChild(sourceUrl);
        }
        
        container.appendChild(sourceItem);
    } else {
        container.innerHTML = '<p class="no-source">No sources available.</p>';
    }
}

// Update askQuestion function
async function askQuestion() {
    const query = queryInput.value.trim();
    
    if (!query) {
        showError('Please enter a question.');
        return;
    }
    
    if (!processedData) {
        showError('Please process your data first before asking questions.');
        return;
    }
    
    showLoader();
    hideError();
    hideResult();
    
    try {
        const response = await fetch(`${API_BASE_URL}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                model: getSelectedModel(),
                type: currentDataType
            })
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Display answer
        answerText.textContent = data.answer;
        
        // Display a single source
        displaySingleSource(sourcesContainer, data.sources);
        
        showResult();
        hideLoader();
        
    } catch (error) {
        hideLoader();
        showError(error.message || 'An error occurred while processing your question.');
    }
}

// Helper function to get the current model selection
function getSelectedModel() {
    switch(currentDataType) {
        case 'url':
            return urlModelSelect.value;
        case 'file':
            return fileModelSelect.value;
        case 'text':
            return textModelSelect.value;
        default:
            return 'phi3:mini'; // default model
    }
}

// UI Helpers
function updateButton(button, isLoading) {
    if (isLoading) {
        button.textContent = "Processing...";
        button.disabled = true;
        button.style.opacity = "0.7";
    } else {
        button.textContent = "Process";
        button.disabled = false;
        button.style.opacity = "1";
    }
}

function showLoader() {
    loader.style.display = 'flex';
}

function hideLoader() {
    loader.style.display = 'none';
}

function showResult() {
    result.style.display = 'block';
}

function hideResult() {
    result.style.display = 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showSuccess(message) {
    // This can be enhanced to show a success message
    console.log(message);
}

// Check Ollama server status on page load
async function checkOllamaStatus() {
    try {
        let retries = 0;
        const maxRetries = 2;
        
        while (retries < maxRetries) {
            try {
                console.log(`Checking API status (attempt ${retries + 1})...`);
                const response = await fetch(`${API_BASE_URL}/status`, { 
                    method: 'GET',
                    timeout: 10000
                });
                
                if (response.ok) {
                    console.log('API connected successfully');
                    return true;
                } else {
                    console.warn(`API returned status ${response.status}`);
                    // If first attempt fails, might be waking up from sleep
                    if (retries === 0 && !window.location.hostname.includes('localhost')) {
                        showNotification('Waking up API service...', 'info');
                    }
                }
            } catch (err) {
                console.warn(`API connection attempt ${retries + 1} failed:`, err);
            }
            
            retries++;
            if (retries < maxRetries) {
                // Wait 3 seconds before retry to allow service to wake up
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
        
        if (!window.location.hostname.includes('localhost')) {
            showNotification('API service is starting up. This may take up to 30 seconds on first request.', 'warning');
        } else {
            showError("⚠️ Ollama server is not running. Please start the Ollama service and refresh the page.");
        }
        return false;
    } catch (error) {
        console.error('API connection error:', error);
        showError("⚠️ Cannot connect to the API. Please check your connection and try again.");
        return false;
    }
}

// Show notification message
function showNotification(message, type = 'info') {
    // Create notification if it doesn't exist
    let notification = document.getElementById('api-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'api-notification';
        notification.style.position = 'fixed';
        notification.style.top = '10px';
        notification.style.right = '10px';
        notification.style.padding = '10px 15px';
        notification.style.borderRadius = '4px';
        notification.style.zIndex = '9999';
        notification.style.maxWidth = '300px';
        notification.style.boxShadow = '0 3px 6px rgba(0,0,0,0.16)';
        document.body.appendChild(notification);
    }
    
    // Set style based on type
    if (type === 'info') {
        notification.style.backgroundColor = '#e3f2fd';
        notification.style.color = '#0d47a1';
        notification.style.border = '1px solid #bbdefb';
    } else if (type === 'warning') {
        notification.style.backgroundColor = '#fff3e0';
        notification.style.color = '#e65100';
        notification.style.border = '1px solid #ffe0b2';
    } else if (type === 'success') {
        notification.style.backgroundColor = '#e8f5e9';
        notification.style.color = '#1b5e20';
        notification.style.border = '1px solid #c8e6c9';
    }
    
    notification.textContent = message;
    notification.style.display = 'block';
    
    // Hide after 7 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 7000);
}

// Functions for URL page results
function showUrlLoader() {
    urlLoader.style.display = 'flex';
}

function hideUrlLoader() {
    urlLoader.style.display = 'none';
}

function showUrlResult() {
    urlResult.style.display = 'block';
}

function hideUrlResult() {
    urlResult.style.display = 'none';
}

function showUrlError(message) {
    const urlErrorEl = document.getElementById('url-error-message') || createErrorElement('url-error-message', urlPage);
    urlErrorEl.textContent = message;
    urlErrorEl.style.display = 'block';
}

function hideUrlError() {
    const urlErrorEl = document.getElementById('url-error-message');
    if (urlErrorEl) urlErrorEl.style.display = 'none';
}

// Update askUrlQuestion function
async function askUrlQuestion() {
    const query = urlQuery.value.trim();
    
    if (!query) {
        alert('Please enter a question');
        return;
    }
    
    hideUrlResult();
    showUrlLoader();
    
    try {
        const urls = [
            document.getElementById('url1').value,
            document.getElementById('url2').value,
            document.getElementById('url3').value
        ].filter(url => url.trim() !== '');
        
        if (urls.length === 0) {
            throw new Error('Please enter at least one URL.');
        }
        
        const modelValue = urlModelSelect.value;
        
        const response = await fetch(`${API_BASE_URL}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                urls: urls,
                model: modelValue
            })
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        urlAnswerText.textContent = data.answer;
        
        // Display a single source
        displaySingleSource(urlSourcesContainer, data.sources);
        
        showUrlResult();
    } catch (error) {
        alert(error.message || 'An error occurred while processing your query.');
    } finally {
        hideUrlLoader();
    }
}

// Functions for Text page results
function showTextLoader() {
    textLoader.style.display = 'flex';
}

function hideTextLoader() {
    textLoader.style.display = 'none';
}

function showTextResult() {
    textResult.style.display = 'block';
}

function hideTextResult() {
    textResult.style.display = 'none';
}

function showTextError(message) {
    hideTextLoader();
    
    textAnswerText.textContent = 'Error: ' + message;
    textAnswerText.style.color = 'red';
    
    // Clear sources
    textSourcesContainer.innerHTML = '';
    
    showTextResult();
    
    // Reset color after 5 seconds
    setTimeout(() => {
        textAnswerText.style.color = '';
    }, 5000);
}

function hideTextError() {
    const textErrorEl = document.getElementById('text-error-message');
    if (textErrorEl) textErrorEl.style.display = 'none';
}

// Update askTextQuestion function
async function askTextQuestion() {
    const query = textQuery.value.trim();
    const text = textInput.value.trim();
    const model = textModelSelect.value;
    
    if (!text) {
        showTextError('Please enter some text first.');
        return;
    }
    
    if (!query) {
        showTextError('Please enter a question.');
        return;
    }
    
    // Clear previous results
    textAnswerText.textContent = '';
    textSourcesContainer.innerHTML = '';
    
    // Show loader
    showTextLoader();
    
    try {
        console.log('Sending text query:', query);
        
        // Use a standard query endpoint with type='text' instead of a special text endpoint
        const response = await Promise.race([
            fetch(`${API_BASE_URL}/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    text,
                    model,
                    type: 'text'
                }),
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 30000)
            )
        ]);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.answer) {
            throw new Error('Invalid response from server');
        }
        
        // Display the answer
        textAnswerText.textContent = data.answer;
        
        // Display a single source
        displaySingleSource(textSourcesContainer, data.sources);
        
    } catch (error) {
        console.error('Error asking question for text:', error);
        
        let errorMessage = 'Failed to process your question.';
        
        if (error.message === 'Request timeout') {
            errorMessage = 'Request timed out. Please try again later.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.startsWith('Server returned')) {
            errorMessage = error.message;
        }
        
        showTextError(errorMessage);
        return;
    }
    
    // Hide loader and show result
    hideTextLoader();
    showTextResult();
}

// Functions for File page results
function showFileLoader() {
    fileLoader.style.display = 'flex';
}

function hideFileLoader() {
    fileLoader.style.display = 'none';
}

function showFileResult() {
    fileResult.style.display = 'block';
}

function hideFileResult() {
    fileResult.style.display = 'none';
}

function showFileError(message) {
    const fileErrorEl = document.getElementById('file-error-message') || createErrorElement('file-error-message', filePage);
    fileErrorEl.textContent = message;
    fileErrorEl.style.display = 'block';
}

function hideFileError() {
    const fileErrorEl = document.getElementById('file-error-message');
    if (fileErrorEl) fileErrorEl.style.display = 'none';
}

// Update askFileQuestion function
async function askFileQuestion() {
    const query = fileQuery.value.trim();
    
    if (!query) {
        alert('Please enter a question');
        return;
    }
    
    if (!uploadedFile) {
        alert('Please upload a file before asking a question');
        return;
    }
    
    hideFileResult();
    showFileLoader();
    
    try {
        const modelValue = fileModelSelect.value;
        
        logApiCall('query', 'POST', { query, model: modelValue });
        
        const response = await fetch(`${API_BASE_URL}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                model: modelValue,
                type: 'file'
            })
        });
        
        console.log('Query response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Query error details:', errorData);
            throw new Error(`Server error: ${response.status}${errorData.error ? ' - ' + errorData.error : ''}`);
        }
        
        const data = await response.json();
        console.log('Query response data:', data);
        
        fileAnswerText.textContent = data.answer;
        
        // Display a single source
        displaySingleSource(fileSourcesContainer, data.sources);
        
        showFileResult();
    } catch (error) {
        console.error('Question error:', error);
        showFileError(error.message || 'An error occurred while processing your query.');
    } finally {
        hideFileLoader();
    }
}

// Helper function to create error elements if they don't exist
function createErrorElement(id, parentPage) {
    const errorEl = document.createElement('div');
    errorEl.id = id;
    errorEl.className = 'error';
    errorEl.style.display = 'none';
    
    // Find the content area to append the error to
    const contentArea = parentPage.querySelector('.content');
    contentArea.appendChild(errorEl);
    
    return errorEl;
}

// Add mobile adaptation functions
function adjustUIForScreenSize() {
    const sidebarElement = document.querySelector('.sidebar');
    const mainContentElement = document.querySelector('.main-content');
    
    if (window.innerWidth <= 600) {
        // Mobile adjustments
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', function() {
                if (this.classList.contains('expanded')) {
                    this.classList.remove('expanded');
                } else {
                    document.querySelectorAll('.card.expanded').forEach(c => {
                        c.classList.remove('expanded');
                    });
                    this.classList.add('expanded');
                }
            });
        });
    }
}

// Animate specific elements when they enter viewport
function animateOnScroll() {
    const elements = document.querySelectorAll('.animated-scroll');
    
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(el => {
        observer.observe(el);
    });
}

// Mark elements for scroll animation
function setupScrollAnimations() {
    const elementsToAnimate = [
        ...document.querySelectorAll('.single-source'),
        ...document.querySelectorAll('.result-text'),
        ...document.querySelectorAll('h2'),
        ...document.querySelectorAll('.query-input')
    ];
    
    elementsToAnimate.forEach(el => {
        // Add the animation class but set default opacity to 1
        el.classList.add('animated-scroll');
        el.style.opacity = '1'; // Ensure content is always visible
    });
}

// Initialize responsive UI - NO AUTO SCROLLING
document.addEventListener('DOMContentLoaded', function() {
    // Show main page on load with title animation
    showPage(mainPage, null);
    
    // Make cards and animation immediately visible for better UX
    const cardContainer = document.querySelector('.card-container');
    cardContainer.style.opacity = '1';
    
    // Add animation to Lottie animation container
    const animContainer = document.querySelector('.animation-container');
    animContainer.style.opacity = '1';
    
    // Add responsive handling
    adjustUIForScreenSize();
    window.addEventListener('resize', adjustUIForScreenSize);
    
    // Add enhanced animations
    addPageTransition();
    addCardHoverEffect();
    addButtonRippleEffect();
    setupScrollAnimations();
    
    // Initialize animations
    animateOnScroll();
});

// Add function to show URL warnings
function showUrlWarning(message) {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'warning-message';
    warningDiv.style.backgroundColor = '#fff3cd';
    warningDiv.style.color = '#856404';
    warningDiv.style.padding = '10px';
    warningDiv.style.marginBottom = '15px';
    warningDiv.style.borderRadius = '4px';
    warningDiv.style.border = '1px solid #ffeeba';
    warningDiv.textContent = 'Warning: ' + message;
    
    // Insert after the URL inputs
    const parentDiv = document.getElementById('url-inputs');
    parentDiv.parentNode.insertBefore(warningDiv, parentDiv.nextSibling);
    
    // Remove after 10 seconds
    setTimeout(() => {
        if (warningDiv && warningDiv.parentNode) {
            warningDiv.parentNode.removeChild(warningDiv);
        }
    }, 10000);
}

// Initialize the application
(async function init() {
    const isOllamaRunning = await checkOllamaStatus();
    if (!isOllamaRunning && window.location.hostname.includes('localhost')) {
        showError("⚠️ Ollama server is not running. Please start the Ollama service and refresh the page.");
    }
})(); 