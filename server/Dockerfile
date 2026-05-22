FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive

# Update pip and install build dependencies
RUN pip install --upgrade pip setuptools wheel

# Install LibreOffice and dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    -o Dpkg::Pre-Install-Pkgs::="/bin/true" \
    -o Dpkg::Configure::PreInstall::Off=1 \
    build-essential \
    libreoffice \
    libreoffice-writer \
    libreoffice-calc \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5000/health')" || exit 1

# Run application
CMD ["python", "app.py"]
