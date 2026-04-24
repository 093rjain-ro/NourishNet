# NourishNet

NourishNet is a mobile-first, offline-capable PWA built for ASHA workers in rural India to assess child nutrition in the field. The app features a child-specific scan flow, Telugu language support, and a colour-coded risk history. 

NourishNet lets ASHA health workers photograph a child's meal and instantly get an AI-powered malnutrition risk score — offline, in Telugu and English. The FastAPI backend uses Gemma 4 vision with age-adaptive nutrition scoring and an expanded Indian food database. Our goal is to address child malnutrition in rural India dynamically through accessible, intelligent tools.

**SDG 3 Connection**: NourishNet contributes to UN SDG 3 (Good Health & Well-being) by putting clinical nutrition intelligence in the hands of every ASHA worker.

## Setup

1. Copy env map: `cp .env.example .env`
2. Run exactly: `docker-compose up --build -d`
3. Wait for the containers to mount.
4. Open [http://localhost:3000](http://localhost:3000)

## Demo Mode

For the video submission, a one-click "Demo Mode" is available at the bottom corner of the home screen.
Clicking it will auto-run a demonstration of the application pipeline using a preloaded image to show functionality 100% reliably.
