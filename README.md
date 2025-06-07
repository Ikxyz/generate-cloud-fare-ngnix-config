# NGINX Configuration Generator Documentation

## Overview

This Node.js script generates NGINX server configuration files for subdomains with SSL termination using Cloudflare Origin Certificates. It creates a reverse proxy setup that forwards requests to local applications running on specified ports.

## Features

- **SSL/TLS Termination**: Uses Cloudflare Origin Certificates for secure connections
- **Reverse Proxy**: Forwards requests to local applications
- **HTTP to HTTPS Redirect**: Automatically redirects insecure HTTP traffic
- **WebSocket Support**: Includes headers for WebSocket connections
- **Large File Upload**: Supports file uploads up to 1GB

## Prerequisites

- Node.js installed on your server
- NGINX installed and configured
- Cloudflare account with domain management
- Server with domain `server88.xyz` (or modify the script for your domain)

## Script Usage

### Basic Usage

```bash
node generateConfig.js <subdomain> <port>
```

### Parameters

- `<subdomain>`: The subdomain name (e.g., `api`, `app`, `blog`)
- `<port>`: The local port where your application is running (e.g., `3000`, `8080`)

### Examples

```bash
# Generate config for api.server88.xyz pointing to localhost:3000
node generateConfig.js api 3000

# Generate config for blog.server88.xyz pointing to localhost:8080
node generateConfig.js blog 8080

# Generate config for dashboard.server88.xyz pointing to localhost:4000
node generateConfig.js dashboard 4000
```

## Generated Configuration

The script creates an NGINX configuration file with the following structure:

### HTTPS Server Block
- Listens on port 443 with SSL enabled
- Uses Cloudflare Origin Certificates for SSL
- Proxies requests to the specified local port
- Includes proper headers for reverse proxy functionality
- Supports WebSocket connections
- Allows large file uploads (up to 1GB)

### HTTP Server Block
- Listens on port 80
- Redirects all HTTP traffic to HTTPS
- Returns 404 for non-matching hosts

## File Structure

```
your-project/
├── generateConfig.js       # The main script
└── generated-configs/
    ├── api.config         # Generated NGINX config for api subdomain
    ├── blog.config        # Generated NGINX config for blog subdomain
    └── dashboard.config   # Generated NGINX config for dashboard subdomain
```

## Installation and Setup

### 1. Save the Script

Save the code as `generateConfig.js` in your desired directory.

### 2. Make it Executable

```bash
chmod +x generateConfig.js
```

### 3. Generate Configuration

```bash
node generateConfig.js myapp 3000
```

### 4. Deploy to NGINX

```bash
# Copy the generated config to NGINX sites-available
sudo cp myapp.config /etc/nginx/sites-available/

# Create symbolic link to sites-enabled
sudo ln -s /etc/nginx/sites-available/myapp.config /etc/nginx/sites-enabled/

# Test NGINX configuration
sudo nginx -t

# Reload NGINX
sudo systemctl reload nginx
```

## SSL Certificate Requirements

The configuration expects the following SSL certificate files:

- `/etc/ssl/cloudflare/origin-cert.pem` - Cloudflare Origin Certificate
- `/etc/ssl/cloudflare/origin-private-key.pem` - Private key for the certificate
- `/etc/ssl/cloudflare/cloudflare-origin-ca.pem` - Cloudflare Origin CA certificate

---

# How to Get Cloudflare Origin Certificates

## Step 1: Access Cloudflare Dashboard

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain (`server88.xyz`)

## Step 2: Navigate to SSL/TLS Settings

1. Click on **SSL/TLS** in the left sidebar
2. Click on **Origin Server** tab

## Step 3: Create Origin Certificate

1. Click **Create Certificate** button
2. Choose certificate options:
   - **Let Cloudflare generate a private key and a CSR** (recommended)
   - **Use my CSR** (if you have your own)

## Step 4: Configure Hostnames

Add the hostnames you want to cover:
```
*.server88.xyz
server88.xyz
```

This wildcard certificate will cover all subdomains.

## Step 5: Choose Key Format

- Select **PEM** format (recommended for NGINX)
- Choose key length: **2048-bit** or **4096-bit**

## Step 6: Set Certificate Validity

- Choose validity period (up to 15 years)
- Longer periods are more convenient but shorter periods are more secure

## Step 7: Download Certificates

After clicking **Create**, you'll see two text boxes:

### Origin Certificate
```pem
-----BEGIN CERTIFICATE-----
[Certificate content]
-----END CERTIFICATE-----
```

### Private Key
```pem
-----BEGIN PRIVATE KEY-----
[Private key content]
-----END PRIVATE KEY-----
```

## Step 8: Install Certificates on Server

### Create SSL Directory
```bash
sudo mkdir -p /etc/ssl/cloudflare
```

### Save Origin Certificate
```bash
sudo nano /etc/ssl/cloudflare/origin-cert.pem
```
Paste the Origin Certificate content and save.

### Save Private Key
```bash
sudo nano /etc/ssl/cloudflare/origin-private-key.pem
```
Paste the Private Key content and save.

### Download Cloudflare Origin CA
```bash
sudo wget -O /etc/ssl/cloudflare/cloudflare-origin-ca.pem https://developers.cloudflare.com/ssl/static/authenticated_origin_pull_ca.pem
```

### Set Proper Permissions
```bash
sudo chmod 600 /etc/ssl/cloudflare/origin-private-key.pem
sudo chmod 644 /etc/ssl/cloudflare/origin-cert.pem
sudo chmod 644 /etc/ssl/cloudflare/cloudflare-origin-ca.pem
sudo chown root:root /etc/ssl/cloudflare/*
```

## Step 9: Configure Cloudflare SSL/TLS Mode

1. In Cloudflare Dashboard, go to **SSL/TLS** → **Overview**
2. Set SSL/TLS encryption mode to **Full (strict)**

## Step 10: Add DNS Records

For each subdomain you want to use:

1. Go to **DNS** → **Records**
2. Add **A records** for your subdomains:
   ```
   Type: A
   Name: api
   IPv4 address: [Your server IP]
   Proxy status: Proxied (orange cloud)
   ```

## Security Best Practices

### File Permissions
- Private keys should have restrictive permissions (600)
- Certificate files should be readable by NGINX (644)
- All files should be owned by root

### Certificate Management
- Monitor certificate expiration dates
- Set up renewal reminders
- Keep backup copies of certificates
- Rotate certificates periodically

### NGINX Security Headers
Consider adding these security headers to your configuration:

```nginx
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
```

## Troubleshooting

### Common Issues

1. **Certificate not found**
   - Verify file paths in NGINX config
   - Check file permissions
   - Ensure files exist in specified locations

2. **SSL handshake failed**
   - Verify Cloudflare SSL/TLS mode is set to "Full (strict)"
   - Check certificate validity dates
   - Ensure private key matches certificate

3. **502 Bad Gateway**
   - Verify the target application is running on specified port
   - Check firewall rules
   - Verify proxy_pass URL is correct

### Testing Commands

```bash
# Test SSL certificate
openssl x509 -in /etc/ssl/cloudflare/origin-cert.pem -text -noout

# Test NGINX configuration
sudo nginx -t

# Check if port is listening
sudo netstat -tlnp | grep :443

# Test SSL connection
openssl s_client -connect yourdomain.com:443
```

## Advanced Configuration

### Custom Error Pages
```nginx
error_page 404 /404.html;
error_page 500 502 503 504 /50x.html;
```

### Rate Limiting
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;
```

### Caching
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

This documentation provides a complete guide for using the NGINX configuration generator and setting up Cloudflare Origin Certificates for secure SSL termination.
