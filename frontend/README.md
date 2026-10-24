# TechRescue Frontend — Production Deployment & Manual VM Setup Guide

This guide provides step-by-step manual deployment instructions for running the **TechRescue Frontend** on a dedicated **Azure Linux Virtual Machine (Ubuntu 22.04 LTS)** behind an **Nginx Web Server** and integrated with **Azure Application Gateway**.

---

## 📋 1. Prerequisites

### Azure Virtual Machine Sizing
- **VM Name**: `techrescue-vm-frontend`
- **Recommended SKU**: `Standard_B2s` (2 vCPUs, 4 GiB RAM) or `Standard_B2ms`
- **Operating System**: Ubuntu 22.04 LTS (x64)
- **Disk Size**: 30 GiB Standard SSD (OS Disk)

### Network Security Group (NSG) Inbound Rules
Configure the following inbound port rules in your Azure NSG (`techrescue-frontend-nsg`):
| Priority | Name | Port | Protocol | Source | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **100** | `Allow-SSH` | `22` | TCP | Your Admin IP / Bastion | Secure SSH Administration |
| **110** | `Allow-HTTP-AppGateway` | `80` | TCP | `AppGatewaySubnet` (`10.0.0.0/24`) | Web Traffic from Application Gateway |
| **120** | `Allow-HTTPS-Direct` | `443` | TCP | Internet / Any (Optional) | Direct SSL Access (if bypassing Gateway) |

---

## 🌐 2. How Frontend Connects to Backend API

TechRescue frontend connects to the backend API via either of the following two production patterns:

### Pattern A: Azure Application Gateway (Path-Based Routing — Recommended)
1. **Application Gateway** receives all traffic on Public IP Port 80/443.
2. In the Gateway Routing Rule:
   - `/*` $\rightarrow$ Routes to Frontend VM (`10.0.1.4:80`)
   - `/api/*` $\rightarrow$ Routes to Backend VM (`10.0.2.4:5000`)
3. In Frontend `.env`, set:
   ```env
   VITE_API_URL=/api/v1
   ```
4. The browser automatically sends API calls to `/api/v1/...`, and the Application Gateway transparently forwards them to the Backend VM without CORS issues.

### Pattern B: Nginx Reverse Proxy on Frontend VM
If you want the Frontend VM to proxy API requests directly to the Backend VM:
1. In `/etc/nginx/sites-available/techrescue-frontend`:
   ```nginx
   location /api/ {
       proxy_pass http://10.0.2.4:5000;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   }
   ```
2. In Frontend `.env`, set:
   ```env
   VITE_API_URL=/api/v1
   ```
3. Nginx intercepts `/api/` requests and forwards them to the Backend VM over the private Azure virtual network.

---

## 🛠 3. Step-by-Step Manual Deployment on Frontend VM

### Step 1: Connect to the Frontend VM
```bash
ssh azureuser@<FRONTEND_VM_PUBLIC_IP_OR_BASTION>
```

### Step 2: Update System & Install Core Utilities
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential ufw nginx
```

### Step 3: Install Node.js 20.x LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

node -v   # Should output v20.x.x
npm -v    # Should output 10.x.x
```

### Step 4: Clone Repository & Setup Permissions
```bash
sudo mkdir -p /var/www/techrescue-frontend
sudo chown -R $USER:$USER /var/www/techrescue-frontend

git clone https://github.com/lakshyaright/techrescue_frontend.git /var/www/techrescue-frontend
cd /var/www/techrescue-frontend
```

### Step 5: Configure Environment Variables
```bash
cp .env.example .env
nano .env
```
Inside `.env`, configure:
```env
VITE_API_URL=/api/v1
```

### Step 6: Install Dependencies & Build Production Bundle
```bash
npm install
npm run build

# Verify build output exists in dist/
ls -la dist/
```

### Step 7: Configure Nginx Web Server
```bash
sudo nano /etc/nginx/sites-available/techrescue-frontend
```

Paste the following production Nginx configuration:
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    root /var/www/techrescue-frontend/dist;
    index index.html index.htm;

    # Gzip Compression for fast delivery
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json image/svg+xml;
    gzip_disable "MSIE [1-6]\.";

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Static Assets Caching
    location ~* \.(?:css|js|woff2?|svg|gif|png|jpg|jpeg|ico|webp)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    # Dedicated Health Probe for Azure Application Gateway
    location = /health {
        access_log off;
        default_type text/plain;
        return 200 "OK\n";
    }

    # Reverse Proxy to Backend VM Private IP (Update 10.0.2.4 with Backend VM IP)
    location /api/ {
        proxy_pass http://10.0.2.4:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 10s;
        proxy_read_timeout 60s;
    }

    # Single Page Application (SPA) HTML5 History Mode routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable configuration and restart Nginx:
```bash
sudo ln -sf /etc/nginx/sites-available/techrescue-frontend /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Step 8: Configure Local Linux Firewall (UFW)
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status
```

---

## 🔍 4. Verification & Health Checks

Run these commands directly on the Frontend VM:
```bash
# 1. Verify Nginx status
sudo systemctl status nginx

# 2. Check Frontend Home Page
curl -I http://localhost/
# Expected: HTTP/1.1 200 OK

# 3. Check Health Probe for Application Gateway
curl -i http://localhost/health
# Expected: HTTP/1.1 200 OK, Content: OK

# 4. Check Backend API connectivity through Nginx proxy
curl -i http://localhost/api/health
# Expected: HTTP/1.1 200 OK, {"status":"OK","database":"connected"}
```

---

## 🔄 5. How to Update Frontend Code

```bash
cd /var/www/techrescue-frontend
git pull origin main
npm install
npm run build
sudo systemctl reload nginx
```
