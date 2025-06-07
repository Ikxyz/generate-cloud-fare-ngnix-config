const fs = require('fs');
const path = require('path');

// Get subdomain and port from CLI args
const [,, subdomain, port] = process.argv;

if (!subdomain || !port) {
  console.error("Usage: node generateConfig.js <subdomain> <port>");
  process.exit(1);
}

// NGINX config template
const config = `
server {
    server_name ${subdomain}.server88.xyz;

    listen 443 ssl;

    ssl_certificate /etc/ssl/cloudflare/origin-cert.pem;
    ssl_certificate_key /etc/ssl/cloudflare/origin-private-key.pem;
    ssl_client_certificate /etc/ssl/cloudflare/cloudflare-origin-ca.pem;
    ssl_verify_client off;

    location / {
        proxy_pass http://127.0.0.1:${port};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        client_max_body_size 1000M;
    }
}

server {
    if ($host = ${subdomain}.server88.xyz) {
        return 301 https://$host$request_uri;
    }

    server_name ${subdomain}.server88.xyz;
    listen 80;
    return 404;
}
`;

// Output filename
const fileName = `${subdomain}.config`;
const outputPath = path.join(__dirname, fileName);

// Write the file
fs.writeFileSync(outputPath, config);
console.log(`NGINX config file generated: ${outputPath}`);