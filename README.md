# Medilink - Smart Medical AI Assistance Portal

Medilink is a comprehensive telehealth platform that connects doctors and patients through a modern web interface. The application provides essential medical services including doctor finding, symptom checking, emergency services, appointment booking, and medical record management.

## Features

### Patient Features
- **Doctor Finder**: Search and find doctors based on specialization, location, and availability
- **Symptom Checker**: AI-powered symptom analysis to help patients understand potential conditions
- **Emergency Services**: Quick access to emergency helplines and ambulance services
- **Appointment Booking**: Schedule appointments with doctors through an intuitive interface
- **Medical Records**: Store and manage personal medical history and records
- **Video Consultations**: Connect with doctors through secure video calls
- **Chat Interface**: Communicate with doctors through instant messaging
- **Multi-language Support**: Available in English, Hindi, and Kannada

### Doctor Features
- **Dashboard**: Overview of appointments, patients, and schedule
- **Video Consultations**: Conduct virtual appointments with patients
- **Appointment Management**: View and manage upcoming appointments
- **Chat Interface**: Communicate with patients through instant messaging
- **Patient Records**: Access and update patient medical records

### Shared Features
- **Authentication**: Secure login and registration for both patients and doctors
- **Real-time Communication**: Instant messaging and video calling capabilities
- **Location Services**: Map-based doctor finding and location sharing
- **Multi-language Support**: Interface available in multiple languages

## Technology Stack

### Frontend
- **React** with **TypeScript**
- **Vite** as the build tool
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Supabase JavaScript Client** for backend integration

### Backend
- **Supabase** for authentication and database
- **Python Flask** for additional backend services (webinar forms)

### AI Services
- Integrated AI services for symptom checking and analysis

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager
- **Python** (version 3.7 or higher) for backend services

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd medilink
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the root directory with the following variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Running the Application

### Development Mode

1. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   or
   ```bash
   yarn dev
   ```

2. **Start the backend server (if needed):**
   ```bash
   python src/app.py
   ```

The application will be available at `http://localhost:5173` (or the next available port).

### Production Build

1. **Build the application:**
   ```bash
   npm run build
   ```
   or
   ```bash
   yarn build
   ```

2. **Preview the production build:**
   ```bash
   npm run preview
   ```
   or
   ```bash
   yarn preview
   ```

## Usage

### Patient Registration
1. Navigate to the registration page
2. Fill in your details (name, email, password)
3. Select "Patient" as user type
4. Complete the registration process

### Doctor Registration
1. Navigate to the registration page
2. Fill in your details (name, email, password)
3. Select "Doctor" as user type
4. Complete the registration process

### Key Functionalities

#### Emergency Services
- Access the Emergency Services section from the patient dashboard
- Call emergency services (108) or ambulance services (102) directly
- Use voice commands by saying "help" or "emergency" for immediate assistance

#### Doctor Finder
- Search for doctors by specialization, location, or name
- View doctor profiles, availability, and ratings
- Book appointments directly from the doctor's profile

#### Symptom Checker
- Describe your symptoms to the AI-powered checker
- Receive potential diagnoses and recommendations
- Get guidance on whether you need immediate medical attention

#### Appointment Booking
- Browse available time slots for doctors
- Book appointments for in-person or video consultations
- Manage upcoming and past appointments

## Project Structure

```
medilink/
├── src/
│   ├── components/
│   │   ├── Auth/           # Authentication components
│   │   ├── Chat/           # Chat interface components
│   │   ├── Common/         # Shared components
│   │   ├── Doctor/         # Doctor-specific components
│   │   └── Patient/        # Patient-specific components
│   ├── contexts/           # React context providers
│   ├── lib/                # External library integrations
│   ├── utils/              # Utility functions and services
│   ├── types/              # TypeScript type definitions
│   └── ...
├── public/                 # Static assets
├── .env                    # Environment variables
├── package.json            # Project dependencies and scripts
└── ...
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint for code quality checks
- `npm run typecheck` - Run TypeScript type checking

## Authentication

The application uses Supabase for authentication. If Supabase credentials are not configured properly, it will fall back to mock authentication for development purposes.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on the GitHub repository or contact the development team.