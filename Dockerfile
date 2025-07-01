FROM python:3.11-slim

WORKDIR /app

# Copy your static files
COPY index.html .
COPY styles.css .
COPY script.js .

# Copy the server script
COPY main.py .

# Expose port
EXPOSE 8080

# Run the server
CMD ["python", "main.py"]
