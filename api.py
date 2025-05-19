from flask import Blueprint, request, jsonify
from flask_cors import CORS
import os
import pickle
import requests
from bs4 import BeautifulSoup
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import tempfile
from PyPDF2 import PdfReader
import logging
import traceback
import sys

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
OLLAMA_BASE_URL = os.environ.get('OLLAMA_URL', 'http://localhost:11434')
logger.info(f"Using Ollama at: {OLLAMA_BASE_URL}")

# Change app to Blueprint
app = Blueprint('api', __name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Enable CORS for all routes and origins

# Vector store file path - use temp directory for Render
temp_dir = tempfile.gettempdir()
file_path = os.path.join(temp_dir, "vector_index.pkl")
logger.info(f"Vector store path: {file_path}")

# Add alternative PDF processing methods
def extract_text_from_pdf(pdf_path):
    """Try multiple methods to extract text from a PDF"""
    text = ""
    error_messages = []
    
    # Method 1: PyPDF2
    try:
        logger.info("Trying PDF extraction with PyPDF2")
        reader = PdfReader(pdf_path)
        pdf_text = ""
        for i, page in enumerate(reader.pages):
            try:
                page_text = page.extract_text()
                if page_text:
                    pdf_text += page_text + "\n\n"
            except Exception as page_error:
                error_messages.append(f"PyPDF2 page {i} error: {str(page_error)}")
        
        if pdf_text.strip():
            logger.info("Successfully extracted text with PyPDF2")
            text = pdf_text
            return text, None
        else:
            error_messages.append("PyPDF2 couldn't extract any text")
    except Exception as e:
        error_messages.append(f"PyPDF2 failed: {str(e)}")
    
    # Method 2: Try pdfplumber if available
    try:
        import pdfplumber
        logger.info("Trying PDF extraction with pdfplumber")
        with pdfplumber.open(pdf_path) as pdf:
            pdf_text = ""
            for i, page in enumerate(pdf.pages):
                try:
                    page_text = page.extract_text()
                    if page_text:
                        pdf_text += page_text + "\n\n"
                except Exception as page_error:
                    error_messages.append(f"pdfplumber page {i} error: {str(page_error)}")
            
            if pdf_text.strip():
                logger.info("Successfully extracted text with pdfplumber")
                text = pdf_text
                return text, None
            else:
                error_messages.append("pdfplumber couldn't extract any text")
    except ImportError:
        error_messages.append("pdfplumber not installed")
    except Exception as e:
        error_messages.append(f"pdfplumber failed: {str(e)}")
    
    # Method 3: Try pymupdf (fitz) if available
    try:
        import fitz
        logger.info("Trying PDF extraction with pymupdf")
        doc = fitz.open(pdf_path)
        pdf_text = ""
        for i, page in enumerate(doc):
            try:
                page_text = page.get_text()
                if page_text:
                    pdf_text += page_text + "\n\n"
            except Exception as page_error:
                error_messages.append(f"pymupdf page {i} error: {str(page_error)}")
        
        if pdf_text.strip():
            logger.info("Successfully extracted text with pymupdf")
            text = pdf_text
            return text, None
        else:
            error_messages.append("pymupdf couldn't extract any text")
    except ImportError:
        error_messages.append("pymupdf not installed")
    except Exception as e:
        error_messages.append(f"pymupdf failed: {str(e)}")
    
    if not text:
        logger.error("All PDF extraction methods failed")
        return "", error_messages
    
    return text, None

# Check if Ollama is running
def check_ollama_running():
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags")
        return response.status_code == 200
    except:
        return False

# Run Ollama query
def run_ollama_query(prompt, model):
    try:
        data = {
            "model": model,
            "prompt": prompt,
            "stream": False
        }
        response = requests.post(f"{OLLAMA_BASE_URL}/api/generate", json=data)
        if response.status_code == 200:
            return response.json().get("response", "No response from Ollama")
        else:
            return f"Error: {response.status_code}"
    except Exception as e:
        logger.error(f"Error with Ollama query: {str(e)}")
        return f"Error: {str(e)}"

# Fetch article text from URL
def fetch_article(url):
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.google.com/",
            "Connection": "keep-alive"
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # Raise exception for 4XX/5XX status codes
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Check for access denied messages
        if "Access Denied" in soup.get_text() or "403 Forbidden" in soup.get_text():
            return Document(
                page_content=f"Access Denied: Unable to retrieve content from {url}. The website is blocking automated access.",
                metadata={"source": url, "error": "access_denied"}
            )
            
        # Try different content sections - common in news sites
        for selector in [
            "div.content_wrapper", "div.article_wrapper", "article", "main", 
            "div.article-content", "div.story-content", ".story-body", "#content"
        ]:
            content = soup.select_one(selector)
            if content:
                text = content.get_text(separator="\n", strip=True)
                if len(text) > 200:  # Only accept if reasonable length found
                    return Document(page_content=text, metadata={"source": url})
        
        # Fallback to main text if no specific content container found
        paragraphs = soup.find_all("p")
        if paragraphs:
            text = "\n".join([p.get_text(strip=True) for p in paragraphs])
            return Document(page_content=text, metadata={"source": url})
            
        # Last resort: Get whole body text
        text = soup.get_text(separator="\n", strip=True)[:5000]  # Limit to first 5000 chars
        return Document(page_content=text, metadata={"source": url})
            
    except Exception as e:
        error_msg = f"Error fetching {url}: {str(e)}"
        return Document(page_content=error_msg, metadata={"source": url, "error": "fetch_error"})

# Routes
@app.route('/api/check-ollama', methods=['GET'])
def check_ollama():
    if check_ollama_running():
        return jsonify({"status": "running"}), 200
    else:
        return jsonify({"status": "not_running"}), 503

@app.route('/api/process-urls', methods=['POST'])
def process_urls():
    data = request.json
    urls = data.get('urls', [])
    model = data.get('model', 'phi3:mini')
    
    if not urls:
        return jsonify({"error": "No URLs provided"}), 400
    
    try:
        # Check if Ollama is running
        if not check_ollama_running():
            return jsonify({"error": "Ollama is not running"}), 503
        
        # Fetch articles
        raw_docs = [fetch_article(url) for url in urls]
        
        # Check if all documents have errors
        all_errors = True
        for doc in raw_docs:
            if not doc.metadata.get('error'):
                all_errors = False
                break
                
        if all_errors:
            error_messages = []
            for doc in raw_docs:
                error_messages.append(doc.page_content)
            return jsonify({"error": "Could not access any of the provided URLs", "details": error_messages}), 400
        
        # Split into chunks
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        docs = splitter.split_documents(raw_docs)
        
        # Extract text from documents
        texts = [doc.page_content for doc in docs]
        metadata = [doc.metadata for doc in docs]
        
        # Create TF-IDF model
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(texts)
        
        # Save the necessary data to disk
        with open(file_path, "wb") as f:
            pickle.dump({
                "vectorizer": vectorizer,
                "tfidf_matrix": tfidf_matrix,
                "texts": texts,
                "metadata": metadata,
                "docs": docs,
                "processed_urls": urls,  # Store processed URLs
                "has_errors": any(doc.metadata.get('error') for doc in raw_docs)  # Flag if some URLs had errors
            }, f)
        
        return jsonify({
            "success": True, 
            "message": "URLs processed successfully",
            "processed_urls": urls,  # Return processed URLs in the response
            "warnings": [doc.page_content for doc in raw_docs if doc.metadata.get('error')]  # Return any warning messages
        }), 200
    
    except Exception as e:
        logger.error(f"Error processing URLs: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/process-file', methods=['POST'])
def process_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    model = request.form.get('model', 'phi3:mini')
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    # Create temp directory
    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, file.filename)
    
    try:
        # Check if Ollama is running
        if not check_ollama_running():
            return jsonify({"error": "Ollama is not running"}), 503
        
        # Save file to temp location
        file.save(temp_path)
        logger.info(f"Saved file to {temp_path}")
        
        # Ultra simple approach for any file type
        try:
            # For PDF files, try to extract some text but don't require it
            if file.filename.lower().endswith('.pdf'):
                logger.info(f"Processing PDF file: {file.filename}")
                try:
                    text, errors = extract_text_from_pdf(temp_path)
                    if not text or len(text.strip()) < 50:
                        text = f"[Non-text PDF document: {file.filename}]"
                except Exception as pdf_err:
                    logger.warning(f"PDF extraction failed: {str(pdf_err)}")
                    text = f"[PDF document that could not be processed: {file.filename}]"
            
            # For text files, try different encodings
            elif file.filename.lower().endswith('.txt'):
                logger.info(f"Processing TXT file: {file.filename}")
                text = None
                
                # Try different encodings
                for encoding in ['utf-8', 'latin-1', 'windows-1252']:
                    try:
                        with open(temp_path, 'r', encoding=encoding) as f:
                            text = f.read()
                            break
                    except:
                        continue
                
                if text is None:
                    text = f"[Text file that could not be decoded: {file.filename}]"
            
            # For other file types, just use the filename
            else:
                text = f"[Unsupported file type: {file.filename}]"
                
            # Create at least one chunk, even for empty content
            chunks = []
            
            # If we have real content, try to split it
            if text and len(text.strip()) > 100:
                try:
                    # Create chunks using simple splitting
                    words = text.split()
                    chunk_size = 300  # words per chunk
                    
                    for i in range(0, len(words), chunk_size):
                        chunk = " ".join(words[i:i+chunk_size])
                        chunks.append({
                            "text": chunk,
                            "metadata": {"source": file.filename}
                        })
                except Exception as chunk_err:
                    logger.warning(f"Chunking error: {str(chunk_err)}")
            
            # If chunking failed or text was minimal, create a single chunk
            if not chunks:
                chunks.append({
                    "text": text or f"[Empty file: {file.filename}]",
                    "metadata": {"source": file.filename}
                })
            
            # Add dummy content to ensure vector operations work
            texts = [chunk["text"] + " dummy text for processing" for chunk in chunks]
            metadata = [chunk["metadata"] for chunk in chunks]
            
            # Create a basic TF-IDF model
            try:
                vectorizer = TfidfVectorizer(min_df=1, stop_words=None)
                tfidf_matrix = vectorizer.fit_transform(texts)
            except Exception as vec_err:
                logger.warning(f"TF-IDF error: {str(vec_err)}")
                # Emergency fallback with completely artificial content
                texts = [f"Document {i+1} from {file.filename}" for i in range(3)]
                vectorizer = TfidfVectorizer(min_df=1, stop_words=None)
                tfidf_matrix = vectorizer.fit_transform(texts)
            
            # Save to disk
            with open(file_path, "wb") as f:
                pickle.dump({
                    "vectorizer": vectorizer,
                    "tfidf_matrix": tfidf_matrix,
                    "texts": texts,
                    "metadata": metadata,
                    "is_non_text": len(text.strip()) < 100 if text else True,
                    "filename": file.filename
                }, f)
            
            return jsonify({
                "success": True, 
                "message": f"File processed successfully with {len(texts)} chunks"
            }), 200
            
        except Exception as inner_error:
            logger.error(f"Processing error: {str(inner_error)}")
            logger.error(traceback.format_exc())
            
            # Last resort emergency processing - never fail
            emergency_texts = [f"File: {file.filename}", "Content could not be processed", "Please ask simple questions about the file"]
            
            # Create an emergency vectorizer and matrix
            emergency_vectorizer = TfidfVectorizer(min_df=1, stop_words=None)
            emergency_matrix = emergency_vectorizer.fit_transform(emergency_texts)
            
            # Save emergency data
            with open(file_path, "wb") as f:
                pickle.dump({
                    "vectorizer": emergency_vectorizer,
                    "tfidf_matrix": emergency_matrix,
                    "texts": emergency_texts,
                    "metadata": [{"source": file.filename}] * 3,
                    "is_emergency": True,
                    "filename": file.filename
                }, f)
            
            return jsonify({
                "success": True, 
                "message": "File processed with limited capabilities",
                "warning": "File content could not be fully processed"
            }), 200
    
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        logger.error(traceback.format_exc())
        
        try:
            # One final attempt - create dummy data that will never fail
            with open(file_path, "wb") as f:
                dummy_texts = ["Document placeholder", f"Filename: {file.filename}", "Content unavailable"]
                dummy_vectorizer = TfidfVectorizer()
                dummy_matrix = dummy_vectorizer.fit_transform(dummy_texts)
                
                pickle.dump({
                    "vectorizer": dummy_vectorizer,
                    "tfidf_matrix": dummy_matrix,
                    "texts": dummy_texts,
                    "metadata": [{"source": file.filename}] * 3,
                    "is_fallback": True
                }, f)
            
            return jsonify({
                "success": True,
                "message": "Created placeholder for file",
                "warning": "File could not be processed, using minimal placeholder"
            }), 200
        except:
            return jsonify({
                "error": "Critical error processing file",
                "message": str(e)
            }), 500
    
    finally:
        # Clean up temp files
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            if os.path.exists(temp_dir):
                os.rmdir(temp_dir)
        except:
            pass

@app.route('/api/process-text', methods=['POST'])
def process_text():
    data = request.json
    text = data.get('text', '')
    model = data.get('model', 'phi3:mini')
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    try:
        # Check if Ollama is running
        if not check_ollama_running():
            return jsonify({"error": "Ollama is not running"}), 503
        
        # Create document from text
        raw_docs = [Document(page_content=text, metadata={"source": "User input text"})]
        
        # Split into chunks
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        docs = splitter.split_documents(raw_docs)
        
        # Extract text from documents
        texts = [doc.page_content for doc in docs]
        metadata = [doc.metadata for doc in docs]
        
        # Create TF-IDF model
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(texts)
        
        # Save the necessary data to disk
        with open(file_path, "wb") as f:
            pickle.dump({
                "vectorizer": vectorizer,
                "tfidf_matrix": tfidf_matrix,
                "texts": texts,
                "metadata": metadata,
                "docs": docs
            }, f)
        
        return jsonify({"success": True, "message": "Text processed successfully"}), 200
    
    except Exception as e:
        logger.error(f"Error processing text: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/query', methods=['POST'])
def query():
    data = request.json
    query_text = data.get('query', '')
    model = data.get('model', 'phi3:mini')
    
    if not query_text:
        return jsonify({"error": "No query provided"}), 400
    
    try:
        # Check if index exists
        if not os.path.exists(file_path):
            return jsonify({"error": "Please process data first"}), 400
        
        # Check if Ollama is running
        if not check_ollama_running():
            return jsonify({"error": "Ollama is not running"}), 503
        
        # Load the vector store
        with open(file_path, "rb") as f:
            data = pickle.load(f)
        
        # Check if this is emergency/fallback data
        is_emergency = data.get("is_emergency", False)
        is_fallback = data.get("is_fallback", False)
        is_non_text = data.get("is_non_text", False)
        filename = data.get("filename", "unknown file")
        
        # Get the texts
        texts = data["texts"]
        metadata = data["metadata"]
        
        # Detect if this is likely Telugu content
        is_telugu = False
        for text in texts:
            # Check for Telugu Unicode range characters (0C00-0C7F)
            if any(ord(c) >= 0x0C00 and ord(c) <= 0x0C7F for c in text):
                is_telugu = True
                break
        
        # Find relevant content
        try:
            vectorizer = data["vectorizer"]
            tfidf_matrix = data["tfidf_matrix"]
            
            # Get vector for query
            query_vector = vectorizer.transform([query_text])
            
            # Get similarity
            similarity_scores = cosine_similarity(query_vector, tfidf_matrix)[0]
            
            # Get top indices
            top_indices = similarity_scores.argsort()[-3:][::-1]
        except:
            # If vector search fails, just use first few elements
            top_indices = list(range(min(3, len(texts))))
        
        # Build prompt with context
        context = "\n\n".join([texts[i] for i in top_indices])
        
        # Create appropriate prompt based on file status and language
        if is_emergency or is_fallback:
            prompt = f"""This query is about a file that could not be properly processed.
            Filename: {filename}
            Question: {query_text}
            
            Please explain that this appears to be a file that couldn't be properly analyzed, 
            possibly because it's in a format that doesn't contain machine-readable text
            (like a scanned document or image-based PDF). Suggest to the user that they
            might want to try using a different file format or extracting the text manually."""
        elif is_non_text:
            if is_telugu:
                prompt = f"""This query is about a Telugu newspaper.
                
                Filename: {filename}
                
                Limited information available:
                {context}
                
                Question: {query_text}
                
                Please answer in Telugu if possible, based on the limited information available.
                Mention that this is a Telugu newspaper with limited machine-readable text."""
            else:
                prompt = f"""This query is about a document that appears to have minimal
                extractable text (like a scanned document or image-based PDF).
                
                Filename: {filename}
                
                Limited information available:
                {context}
                
                Question: {query_text}
                
                Please do your best to answer based on the limited information available, 
                but mention that the document appears to be primarily non-text content."""
        else:
            prompt = f"""Based on the following context, please answer the question.
            
            Context:
            {context}
            
            Question: {query_text}
            
            Answer:"""
        
        # Get answer from Ollama
        answer = run_ollama_query(prompt, model)
        
        # If fallback/emergency and Ollama also fails, provide a default answer
        if (is_emergency or is_fallback) and "error" in answer.lower():
            answer = f"""I'm unable to answer questions about this file ({filename}). 
            It appears to be in a format that couldn't be properly processed, possibly 
            because it contains scanned text or images rather than machine-readable text. 
            
            You might want to try using OCR software to extract the text first, or 
            upload the content in a different format."""
        
        # Prepare sources - with special handling for Telugu text
        sources = []
        for i, idx in enumerate(top_indices):
            # Clean source content and handle encoding issues
            source_content = texts[idx].replace("dummy text for processing", "").strip()
            
            # For Telugu text that might display as question marks (), provide a better message
            if "" in source_content and is_telugu:
                source_content = "This section contains Telugu text that couldn't be fully extracted. The PDF contains Telugu script which was detected."
            
            if source_content:
                sources.append({
                    "source": metadata[idx].get('source', filename),
                    "content": source_content[:300] + ("..." if len(source_content) > 300 else "")
                })
        
        # If no proper sources, add a note about Telugu content
        if is_telugu and not sources:
            sources.append({
                "source": filename,
                "content": "This newspaper contains Telugu text. The system has detected Telugu script but cannot extract the full text properly from the PDF format."
            })
        
        return jsonify({
            "answer": answer,
            "sources": sources,
            "file_status": "telugu_newspaper" if is_telugu else "emergency" if is_emergency else "fallback" if is_fallback else "non_text" if is_non_text else "normal"
        }), 200
    
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/status', methods=['GET'])
def status():
    try:
        # Check if we can create a temporary file
        with tempfile.NamedTemporaryFile(mode='w+') as temp_file:
            temp_file.write('test')
        
        # Check if Ollama is accessible
        ollama_status = "running" if check_ollama_running() else "not running"
        
        return jsonify({
            "status": "ok",
            "ollama_status": ollama_status,
            "temp_dir_writable": True,
            "api_version": "1.0"
        }), 200
    except Exception as e:
        logger.error(f"Status check failed: {str(e)}")
        return jsonify({
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False) 