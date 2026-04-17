# TwinMind Pro - Deployment Guide

## Quick Deployment to Vercel

### Prerequisites
- GitHub account (optional but easier)
- Vercel account (free, sign up at vercel.com)
- Groq API key

### Option 1: Recommended - Deploy via GitHub

#### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: TwinMind Pro"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/twinmind-pro.git
git push -u origin main
```

#### 2. Deploy Frontend to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Select your GitHub repo
3. Framework: **Vite**
4. Root Directory: **frontend**
5. Environment Variables: None needed (users set in-app)
6. Deploy!

**Frontend URL**: Your Vercel domain → Save this

#### 3. Deploy Backend to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Select your GitHub repo again
3. Framework: **Node.js**
4. Root Directory: **backend**
5. Environment Variables:
   - `GROQ_API_KEY` = your key
   - `NODE_ENV` = production
6. Deploy!

**Backend URL**: Your Vercel domain → Save this

#### 4. Update Frontend API URL
In `frontend/vite.config.js`, update proxy:
```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'https://YOUR_BACKEND_VERCEL_URL',
      changeOrigin: true
    }
  }
}
```

Then redeploy frontend.

### Option 2: Manual Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy backend
cd backend
vercel --env GROQ_API_KEY=gsk_...

# Deploy frontend
cd ../frontend
vercel --build-script 'npm run build'
```

## Environment Setup for Production

### Backend Secrets (Vercel Dashboard)
1. Go to your backend project
2. Settings → Environment Variables
3. Add:
   - `GROQ_API_KEY` = gsk_your_real_key
   - `NODE_ENV` = production

### Frontend Configuration
No secrets needed! Users paste API key in the app.

## Testing Deployment

1. Open your frontend URL in browser
2. Go to Settings
3. Paste Groq API key
4. Click "Start Recording"
5. Verify suggestions appear
6. Export to test export feature

## Troubleshooting

### API calls fail with 502/503
- Check backend deployment is successful
- Verify GROQ_API_KEY is set in backend env vars
- Check backend is returning JSON responses

### Frontend won't load
- Check build completed successfully
- Clear browser cache (Ctrl+Shift+Delete)
- Check for CORS errors in browser console

### Microphone not working
- Browser must have permission
- Production needs HTTPS (Vercel provides this)
- Check browser console for permissions errors

## Production Checklist

- [ ] Backend deployed with GROQ_API_KEY set
- [ ] Frontend deployed with correct API proxy
- [ ] Tested with real microphone
- [ ] Export feature works
- [ ] Settings panel accepts API key
- [ ] Suggestions appear within 30 seconds
- [ ] Chat responses work
- [ ] Session exports valid JSON

## Cost Estimation

- **Vercel Free Tier**: Enough for demos/assignment
- **Groq Free Tier**: Unlimited calls (rate limited, but generous)
- **Monthly Cost**: $0 for this demo

## Scaling Notes

For production at scale:
- Add database (PostgreSQL on Railway/Supabase)
- Implement user auth (Auth0/Firebase)
- Add rate limiting (Redis)
- Use job queue for async processing (Bull/RabbitMQ)
- Add monitoring (Sentry/LogRocket)

## Support

For Groq API issues: https://console.groq.com/docs
For Vercel issues: https://vercel.com/docs

---

**You're live! 🚀**
