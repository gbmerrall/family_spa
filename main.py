import os
import http.server
import socketserver
from pathlib import Path

def main():
    """
    Simple HTTP server to serve static files for the Family Tree Tracker SPA
    """
    # Get port from environment variable (Cloud Run requirement)
    port = int(os.environ.get('PORT', 8080))
    
    # Change to the directory containing your static files
    os.chdir(Path(__file__).parent)
    
    # Create HTTP server
    handler = http.server.SimpleHTTPRequestHandler
    
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"Server running on port {port}")
        httpd.serve_forever()

if __name__ == "__main__":
    main()
