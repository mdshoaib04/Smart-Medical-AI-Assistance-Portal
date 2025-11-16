🌐 Medilink – Smart Medical AI Assistance Portal

Your intelligent telehealth companion for seamless doctor-patient connection. 🏥🤖

Medilink is a modern telehealth platform designed to provide online medical support, AI-powered assistance, and secure interactions between patients and doctors.

✨ Features
👨‍⚕️ Patient Features

🔍 Doctor Finder – Search doctors by specialization, location & availability

🤖 AI Symptom Checker – Get quick symptom analysis

🚨 Emergency Services – Instant helpline & ambulance access

📅 Appointment Booking – Easy scheduling with doctors

📁 Medical Records – Manage your digital health history

🎥 Video Consultations – Secure online doctor meetings

💬 Chat Interface – Instant messaging with doctors

🌐 Multi-language Support – English, Hindi & Kannada

🩺 Doctor Features

📊 Dashboard – View appointments & schedule

🎥 Video Consultations – Conduct online sessions

📅 Appointment Management – Manage patient bookings

💬 Chat with Patients – Instant communication

📁 Patient Records Access – Update and review medical records

🔄 Shared Features

🔐 Secure Authentication

⚡ Real-time Messaging & Calls

📍 Map-based Doctor Finder

🌐 Multi-language UI

🛠️ Technology Stack
🎨 Frontend

React + TypeScript

Vite

Tailwind CSS

Lucide React Icons

Supabase JS Client

🗄️ Backend

Supabase (Auth + Database)

Python Flask (Extra backend services)

🤖 AI Services

Integrated AI for symptom checking

📦 Prerequisites

Make sure you have:

🖥️ Node.js (v16+)

📦 npm or yarn

🐍 Python 3.7+ (for backend services)

🚀 Installation

Clone the repo

git clone <repository-url>
cd medilink


Install frontend dependencies

npm install


or

yarn install


Add environment variables
Create .env file:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

▶️ Running the Application
🧪 Development Mode

Start frontend:

npm run dev


Start backend:

python src/app.py


App opens at http://localhost:5173

🏗️ Production Build
npm run build
npm run preview

🧑‍⚕️ Usage Guide
📝 Patient Registration

Open registration → enter details → choose Patient

🩺 Doctor Registration

Open registration → enter details → choose Doctor

🚨 Emergency Services

Quick call 108/102

Voice commands: “help”, “emergency”

🔍 Doctor Finder

Search by location, name, specialization

View profiles → book appointment

🤖 Symptom Checker

Enter symptoms → get AI-powered predictions

📅 Appointment System

Choose time slots

Video or in-person

Manage upcoming visits

📂 Project Structure
medilink/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   ├── Chat/
│   │   ├── Common/
│   │   ├── Doctor/
│   │   └── Patient/
│   ├── contexts/
│   ├── lib/
│   ├── utils/
│   ├── types/
├── public/
├── .env
├── package.json
└── ...

🧰 Available Scripts

npm run dev – Start dev server

npm run build – Build for production

npm run preview – Preview production build

npm run lint – Code linting

npm run typecheck – TypeScript checks

🔐 Authentication

Supabase handles user auth. If credentials missing → mock auth is used during development.

🤝 Contributing

Fork repo

Create branch

Commit changes

Push

Open pull request

📜 License

MIT License

💬 Support

For help, open a GitHub issue or contact the dev team.

✨ Developed by: Mohd Shoaib Soudagar ❤️🚀

If you want, I can turn this into a beautiful README.md file, PDF, or GitHub-optimized layout.