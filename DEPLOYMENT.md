# Deployment Guide

## Local Development

### Prerequisites
- Node.js 18+ installed
- npm installed

### Running Locally

1. **Install dependencies** (if not already done):
```bash
npm install
```

2. **Start the backend server** (runs on port 3001):
```bash
cd backend
npm run dev
```

3. **Start the frontend** (runs on port 5173):
```bash
cd frontend
npm run dev
```

4. **Access the application**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Testing with a GitHub Repository

1. Go to http://localhost:5173
2. Enter a GitHub repository URL (e.g., `https://github.com/facebook/react`)
3. Select a date range
4. (Optional) Add a GitHub Personal Access Token for private repos or higher rate limits
5. Click "Generate" to see release notes and changelog

---

## AWS Deployment Options

### Option 1: AWS EC2 (Traditional VM Approach)

#### Step 1: Launch EC2 Instance

1. **Go to AWS Console** → EC2 → Launch Instance
2. **Choose AMI**: Ubuntu Server 22.04 LTS
3. **Instance Type**: t2.small or t2.medium (minimum)
4. **Configure Security Group**:
   - SSH (22) - Your IP only
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0
   - Custom TCP (3001) - 0.0.0.0/0 (backend API)
5. **Create/Select Key Pair** for SSH access
6. **Launch Instance**

#### Step 2: Connect and Setup Server

```bash
# Connect to your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx
```

#### Step 3: Deploy Application

```bash
# Clone or upload your code
git clone your-repo-url
cd release-notes-generator

# Install dependencies
npm install

# Build backend
cd backend
npm run build
cd ..

# Build frontend
cd frontend
npm run build
cd ..
```

#### Step 4: Configure PM2

Create `ecosystem.config.js` in the root:

```javascript
module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: './backend',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
```

Start the backend:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Step 5: Configure Nginx

Create `/etc/nginx/sites-available/release-notes-generator`:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or EC2 public IP

    # Frontend
    location / {
        root /home/ubuntu/release-notes-generator/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/release-notes-generator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 6: Update Frontend API URL

Before building frontend, update `frontend/src/App.tsx`:
```typescript
// Change from:
const response = await fetch('http://localhost:3001/api/generate', {

// To:
const response = await fetch('/api/generate', {
```

Then rebuild:
```bash
cd frontend
npm run build
```

---

### Option 2: AWS Elastic Beanstalk (Easier, Managed)

#### Step 1: Prepare Application

1. **Install EB CLI**:
```bash
pip install awsebcli
```

2. **Create a combined package** - Create `package.json` in root:
```json
{
  "name": "release-notes-generator",
  "scripts": {
    "start": "cd backend && npm start",
    "build": "cd backend && npm install && npm run build && cd ../frontend && npm install && npm run build"
  }
}
```

3. **Create `.ebextensions/nginx.config`**:
```yaml
files:
  "/etc/nginx/conf.d/proxy.conf":
    mode: "000644"
    owner: root
    group: root
    content: |
      client_max_body_size 20M;
```

#### Step 2: Initialize and Deploy

```bash
# Initialize EB
eb init -p node.js-18 release-notes-generator --region us-east-1

# Create environment
eb create production-env

# Deploy
eb deploy
```

---

### Option 3: AWS Amplify + Lambda (Serverless)

#### Frontend on Amplify

1. **Go to AWS Amplify Console**
2. **Connect your Git repository**
3. **Build settings** (amplify.yml):
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/dist
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

#### Backend on Lambda + API Gateway

1. **Create Lambda function** with Node.js 18 runtime
2. **Package backend code**:
```bash
cd backend
npm install --production
zip -r function.zip .
```
3. **Upload to Lambda**
4. **Create API Gateway** REST API
5. **Connect routes** to Lambda function

---

### Option 4: Docker + ECS (Container-based)

#### Step 1: Create Dockerfiles

**Backend Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

**Frontend Dockerfile** (`frontend/Dockerfile`):
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Frontend nginx.conf**:
```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    location /api {
        proxy_pass http://backend:3001;
    }
}
```

#### Step 2: Docker Compose (for testing)

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

#### Step 3: Deploy to ECS

1. **Push images to ECR**:
```bash
aws ecr create-repository --repository-name release-notes-backend
aws ecr create-repository --repository-name release-notes-frontend

# Build and push
docker build -t release-notes-backend ./backend
docker tag release-notes-backend:latest [ECR-URI]/release-notes-backend:latest
docker push [ECR-URI]/release-notes-backend:latest

docker build -t release-notes-frontend ./frontend
docker tag release-notes-frontend:latest [ECR-URI]/release-notes-frontend:latest
docker push [ECR-URI]/release-notes-frontend:latest
```

2. **Create ECS Cluster**
3. **Create Task Definitions** for both services
4. **Create Services** and deploy

---

## Recommended Approach

For a simple deployment: **Option 1 (EC2)** - Most straightforward, full control

For managed infrastructure: **Option 2 (Elastic Beanstalk)** - AWS handles scaling and updates

For serverless: **Option 3 (Amplify + Lambda)** - Pay per use, auto-scaling

For containerized: **Option 4 (Docker + ECS)** - Best for microservices architecture

---

## Environment Variables

Make sure to set these on your deployment:

**Backend**:
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (production)
- `CORS_ORIGIN` - Frontend URL for CORS

**Frontend** (build-time):
- `VITE_API_URL` - Backend API URL

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Using AWS Certificate Manager

1. Request certificate in ACM
2. Add to Load Balancer or CloudFront distribution

---

## Monitoring and Logs

### EC2
```bash
# View backend logs
pm2 logs backend

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### CloudWatch
- Enable CloudWatch logs for Lambda/ECS
- Set up alarms for errors and performance metrics

---

## Cost Estimates (Monthly)

- **EC2 t2.small**: ~$17/month
- **Elastic Beanstalk**: ~$25/month (includes EC2 + management)
- **Amplify + Lambda**: ~$5-15/month (pay per use)
- **ECS Fargate**: ~$30-50/month (depends on usage)

---

## Security Checklist

- [ ] Use HTTPS/SSL certificates
- [ ] Restrict SSH access to your IP only
- [ ] Use environment variables for sensitive data
- [ ] Enable AWS WAF for DDoS protection
- [ ] Regular security updates
- [ ] Use IAM roles instead of access keys where possible
- [ ] Enable CloudWatch monitoring and alerts
