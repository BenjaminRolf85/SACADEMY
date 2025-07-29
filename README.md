# Sales Academy - Local Storage Version

## 🚀 Getting Started

This version of the Sales Academy uses **local storage** instead of Supabase for data persistence. No external database setup required!

### 1. Installation

```bash
npm install
npm run dev
```

### 2. Features That Work Out of the Box

#### ✅ Authentication
- **Demo Login Accounts:**
  - **Admin**: `admin@demo.com` / `demo123`
  - **Trainer**: `trainer@demo.com` / `demo123`
  - **User**: `user@demo.com` / `demo123`
- User registration with automatic profile creation
- Role-based access (user/trainer/admin)

#### ✅ Messaging System
- Real-time messaging simulation
- Group chats and admin support
- Message history persistence

#### ✅ Groups & Social Features
- Pre-configured training groups
- Post creation and interaction
- Like system
- Group-specific content

#### ✅ Profile Management
- User profiles with company info
- Editable personal information
- Role-based permissions

#### ✅ Local Data Persistence
- All data stored in browser's localStorage
- Automatic data initialization with sample content
- Data persists between browser sessions

### 3. Sample Data Included

- **Users**: Admin, Trainer, and regular users
- **Groups**: Professional Training, Sales Group, Sales Professional
- **Messages**: Pre-loaded conversations
- **Posts**: Sample social media posts with interactions

### 4. Available Demo Accounts

| Role | Email | Password | Features |
|------|-------|----------|----------|
| Admin | `admin@demo.com` | `demo123` | Full system access, user management |
| Trainer | `trainer@demo.com` | `demo123` | Group management, student oversight |
| User | `user@demo.com` | `demo123` | Standard user features |

### 5. Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Local Storage Structure

The app uses localStorage with the following keys:
- `sales_academy_users` - User accounts
- `sales_academy_current_user` - Currently logged in user
- `sales_academy_groups` - Training groups
- `sales_academy_messages` - Chat messages
- `sales_academy_conversations` - Chat conversations
- `sales_academy_posts` - Social media posts

## 🎯 Key Features

- **No External Dependencies** - Works completely offline
- **Instant Setup** - No database configuration required
- **Persistent Data** - Data survives browser restarts
- **Role-Based Access** - Different permissions for different user types
- **German Localization** - Full German language support
- **Mobile Responsive** - Works on all device sizes

## 🔄 Data Management

To reset all data back to defaults:
1. Open browser developer tools
2. Go to Application > Local Storage
3. Delete all `sales_academy_*` entries
4. Refresh the page

## 📱 Testing

1. **Login**: Use any of the demo accounts
2. **Messaging**: Send messages in group chats or admin support
3. **Posts**: Create new posts and interact with existing ones
4. **Groups**: Explore training groups and courses
5. **Profile**: Edit user profile information

## 🛠️ Technical Notes

- Uses React Context for state management
- TypeScript for type safety
- Tailwind CSS for styling
- Local storage for data persistence
- No external API calls required

**Perfect for development, testing, and demonstration purposes!** 🎉