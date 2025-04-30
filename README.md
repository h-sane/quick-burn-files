
# VanishVault - Self-Destructing Secure Messages and Files

VanishVault is a secure platform for sharing sensitive information that automatically self-destructs after viewing. It's designed with privacy and security in mind, ensuring your confidential messages and files are only seen by intended recipients and then permanently deleted.

## 🔐 Live Demo

[View the live application](https://vanish-vault-git-main-hussains-projects-738396e4.vercel.app)

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn-ui components
- **State Management**: React Query
- **Backend**: Supabase (PostgreSQL database)
- **Deployment**: Vercel
- **Routing**: React Router DOM
- **Notifications**: Sonner toast notifications

## 🔒 Security Implementation

### Encryption

- **Client-side encryption**: All content is encrypted before being sent to the server
- **Transport layer security**: HTTPS/TLS for all communications
- **Database encryption**: Content stored in encrypted format in Supabase

### Self-Destruction Mechanism

VanishVault implements a multi-layered self-destruction approach:

1. **View-based destruction**: Content is automatically deleted after reaching the configured maximum number of views
2. **Time-based expiration**: All content has an expiration date after which it is automatically purged
3. **Browser security**: Content is not cacheable and special handlers prevent recovery after viewing

### Database Security

- **Row-Level Security (RLS)**: Implemented in Supabase to ensure data can only be accessed by the system with proper credentials
- **Transaction-based access**: Content is locked during retrieval to prevent race conditions
- **Automated cleanup**: Scheduled tasks remove expired content even if not accessed

### URL Security

- **URL masking**: Secret IDs are masked in the UI to prevent exposing sensitive information
- **Secure ID generation**: Cryptographically secure random IDs are used for content identification

## 🧩 Core Features

- **Secure Text Sharing**: Share sensitive messages with configurable expiration
- **Secure File Sharing**: Share files that self-destruct after download
- **Configurable Expiration**: Set content to expire after a specific number of views or time period
- **One-Time Viewing**: Option for content to self-destruct immediately after first view
- **Link Generation**: Secure, shareable links for recipients
- **Mobile Responsive**: Fully functional on all device sizes

## 🔍 Technical Architecture

### Content Flow

1. User creates a secret (text message or file upload)
2. Content is encrypted client-side
3. Encrypted content is stored in the Supabase database with metadata
4. A secure link is generated containing the secret ID
5. When the recipient accesses the link, the content is retrieved, decrypted, and displayed
6. View count is incremented and content is deleted if maximum views reached
7. If expiration date is reached, content is automatically purged

### Destruction Algorithm

The self-destruction process follows these steps:

1. **Access Check**: When content is requested, system checks if it's expired or already destroyed
2. **Transaction Locking**: Content is locked during access to prevent race conditions
3. **View Counting**: Each view is counted with atomic operations
4. **Destruction Trigger**: When view count reaches maximum or expiration date is reached:
   - Content is marked as destroyed
   - Record is deleted from database
   - Clients are notified of destruction

## 💻 Development

To run this project locally:

```bash
# Clone the repository
git clone [repository URL]

# Navigate to the project directory
cd vanish-vault

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🚀 Deployment

This project is configured for deployment on Vercel. The repository includes a `vercel.json` configuration file that handles all routing and caching requirements.

## 🔄 Future Enhancements

- End-to-end encryption with recipient-specific keys
- Password protection for secrets
- Notification when content is viewed
- Blockchain verification of destruction
- Self-destructing image viewer with screenshot protection

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
