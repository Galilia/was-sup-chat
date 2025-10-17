# was-sup-chat

**Full-stack chat app:**  
Client: Vite + React  
Server: Node/Express + Socket.io  
Database: MongoDB, Cloudinary  
Deployment: Vercel  
Architecture: Feature-Sliced Design (FSD)

---

## 🗂 Project Structure (FSD)

```text
repo/
├─ client/
│  ├─ public/
│  └─ src/
│     ├─ app/
│     ├─ entities/
│     ├─ features/
│     ├─ pages/
│     └─ shared/
└─ server/
   ├─ routes/
   └─ server.ts

```

---

## ⚙️ Environment Variables

### Server (`server/.env`) — private

```js
PORT = 5000
MONGODB_URI = mongodb + srv
JWT_SECRET = replace_me_with_strong_secret
CLOUDINARY_CLOUD_NAME = your_cloud_name
CLOUDINARY_API_KEY = 111111111111111
CLOUDINARY_API_SECRET = replace_me_with_cloudinary_secret
```

Server reads variables via `process.env.*`.  
Add at the top of `server.ts` (or your bootstrap file):

