# This file is needed for PythonAnywhere deployment
from api import app as application

# This allows running the file directly for testing
if __name__ == '__main__':
    application.run() 