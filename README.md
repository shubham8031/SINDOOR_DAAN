# Sindoor Daan V2

## Setup Instructions

### Step 1: Backend
```
cd backend
npm install
npm run dev
```

### Step 2: Frontend
```
cd frontend
npm install
npm start
```

### Step 3: Face API Models
Download from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
Place in: frontend/public/models/

Files needed:
- ssd_mobilenetv1_model-weights_manifest.json
- ssd_mobilenetv1_model-shard1
- ssd_mobilenetv1_model-shard2
- face_landmark_68_model-weights_manifest.json
- face_landmark_68_model-shard1
- face_recognition_model-weights_manifest.json
- face_recognition_model-shard1
- face_recognition_model-shard2

### Deploy
- Frontend: Vercel (Root Directory: frontend)
- Backend: Render (Start Command: node server.js)
- Database: MongoDB Atlas (already configured)
