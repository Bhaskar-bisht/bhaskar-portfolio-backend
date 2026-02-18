<!-- @format -->

# Portfolio Backend - Node.js + Express + MongoDB

Complete backend API for portfolio website with admin panel support.

## 📋 Features

- ✅ Complete REST API for portfolio management
- ✅ Admin panel CRUD operations for all models
- ✅ Cloudinary integration for image/file uploads
- ✅ JWT authentication & authorization
- ✅ MongoDB with Mongoose ODM
- ✅ Input validation & error handling
- ✅ Rate limiting & security headers
- ✅ Soft delete support
- ✅ File upload with multiple images
- ✅ Search & filtering
- ✅ Analytics tracking
- ✅ SEO metadata management

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account

### Installation

1. **Clone and install dependencies:**

```bash
cd portfolio-backend
npm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env
```

Edit `.env` file with your actual values:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/portfolio_db
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio_db

JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

ADMIN_EMAIL=bhaskar.s.bist@gmail.com
FRONTEND_URL=http://localhost:3000
ADMIN_PANEL_URL=http://localhost:3001
```

3. **Run the server:**

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

## 📁 Project Structure

```
portfolio-backend/
├── src/
│   ├── config/              # Database & Cloudinary config
│   ├── models/              # Mongoose schemas (17 models)
│   ├── controllers/
│   │   ├── admin/          # Admin CRUD controllers
│   │   └── portfolio/      # Public portfolio controllers
│   ├── routes/
│   │   ├── admin/          # Admin routes with auth
│   │   └── portfolio/      # Public portfolio routes
│   ├── middleware/         # Auth, upload, error handling
│   ├── utils/              # Helper functions
│   └── server.js           # Main entry point
├── .env                    # Environment variables
├── package.json
└── README.md
```

## 🔑 API Endpoints

### Public Portfolio API (`/api/portfolio`)

#### Profile

- `GET /profile` - Complete profile with all details
- `GET /profile/skills` - All skills with proficiency
- `GET /profile/education` - Education history
- `GET /profile/experience` - Work experience
- `GET /profile/certifications` - Certifications
- `GET /profile/achievements` - Awards & achievements
- `GET /profile/social-links` - Social media links
- `GET /profile/stats` - Portfolio statistics

#### Projects

- `GET /projects` - All projects (with filters)
- `GET /projects/featured` - Featured projects
- `GET /projects/:slug` - Single project
- `GET /projects/:slug/related` - Related projects

#### Blogs

- `GET /blogs` - All published blogs
- `GET /blogs/featured` - Featured blogs
- `GET /blogs/latest` - Latest 5 blogs
- `GET /blogs/:slug` - Single blog
- `GET /blogs/:slug/related` - Related blogs
- `POST /blogs/:slug/like` - Like a blog

#### Categories

- `GET /categories` - All categories
- `GET /categories/:slug` - Projects by category

#### Technologies

- `GET /technologies` - All technologies
- `GET /technologies/featured` - Featured tech stack

#### Services

- `GET /services` - All active services
- `GET /services/featured` - Featured services
- `GET /services/:slug` - Single service

#### Testimonials

- `GET /testimonials` - All approved testimonials
- `GET /testimonials/featured` - Featured testimonials

#### Contact

- `POST /contact` - Submit contact form

#### Tags

- `GET /tags` - All tags
- `GET /tags/:slug/blogs` - Blogs by tag

#### Other

- `GET /search?q=query` - Global search
- `GET /stats/overview` - Overview statistics
- `GET /social-links` - Social links

### Admin API (`/api/admin`) - 🔒 Requires Authentication

All admin routes require JWT token in header:

```
Authorization: Bearer <your_jwt_token>
```

#### Authentication

- `POST /auth/register` - Register new admin (first time only)
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user

#### CRUD Routes (All Models)

Each model has standard CRUD operations:

- `GET /{model}` - Get all (with pagination, filters)
- `GET /{model}/:id` - Get single by ID
- `POST /{model}` - Create new
- `PUT /{model}/:id` - Update by ID
- `DELETE /{model}/:id` - Delete by ID

Available models:

- `/users`
- `/projects`
- `/blogs`
- `/categories`
- `/technologies`
- `/skills`
- `/experiences`
- `/educations`
- `/certifications`
- `/achievements`
- `/services`
- `/testimonials`
- `/social-links`
- `/tags`
- `/contacts`
- `/analytics`
- `/seo-metadata`
- `/settings`

## 🖼️ Image Upload

### Single Image Upload

```bash
POST /api/admin/projects
Content-Type: multipart/form-data

{
  "title": "My Project",
  "thumbnail": <file>,
  ...other fields
}
```

### Multiple Images Upload

```bash
POST /api/admin/projects
Content-Type: multipart/form-data

{
  "title": "My Project",
  "gallery": [<file1>, <file2>, <file3>],
  ...other fields
}
```

Images are automatically uploaded to Cloudinary and URLs are stored in MongoDB.

## 🔐 Authentication Flow

1. **Register (First Time Only):**

```bash
POST /api/admin/auth/register
{
  "name": "Bhaskar Bisht",
  "email": "admin@example.com",
  "password": "password123"
}
```

2. **Login:**

```bash
POST /api/admin/auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

3. **Use Token in Requests:**

```bash
GET /api/admin/projects
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Models & Relationships

### Core Models

1. **User** - Portfolio owner profile
2. **Project** - Portfolio projects
3. **Blog** - Blog posts/articles
4. **Technology** - Tech stack
5. **Category** - Project categories
6. **Skill** - User skills with proficiency
7. **Experience** - Work history
8. **Education** - Educational background
9. **Certification** - Professional certifications
10. **Achievement** - Awards & recognitions
11. **Service** - Services offered
12. **Testimonial** - Client reviews
13. **SocialLink** - Social media profiles
14. **Tag** - Blog tags
15. **ProjectFeature** - Project features
16. **ContactMessage** - Contact form submissions
17. **Analytic** - Analytics tracking
18. **SeoMetadata** - SEO data
19. **Setting** - App settings

### Key Relationships

- User → has many → Projects, Blogs, Skills, Experiences, etc.
- Project → belongs to many → Categories, Technologies
- Blog → belongs to many → Tags
- Testimonial → polymorphic → Project, Service, User
- Analytics → polymorphic → Project, Blog, User

## 🔍 Querying Examples

### Get Projects with Filters

```bash
GET /api/portfolio/projects?category=web&status=completed&per_page=12
```

### Search

```bash
GET /api/portfolio/search?q=react
```

### Get Blog with Related Posts

```bash
GET /api/portfolio/blogs/my-blog-post
GET /api/portfolio/blogs/my-blog-post/related
```

## 🛡️ Security Features

- ✅ Helmet.js for security headers
- ✅ CORS configured for specific origins
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation & sanitization
- ✅ MongoDB injection protection
- ✅ File upload validation

## 📝 Environment Variables

| Variable              | Description                   | Default               |
| --------------------- | ----------------------------- | --------------------- |
| PORT                  | Server port                   | 5000                  |
| NODE_ENV              | Environment                   | development           |
| MONGODB_URI           | MongoDB connection string     | -                     |
| JWT_SECRET            | JWT secret key                | -                     |
| JWT_EXPIRE            | JWT expiration time           | 30d                   |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name         | -                     |
| CLOUDINARY_API_KEY    | Cloudinary API key            | -                     |
| CLOUDINARY_API_SECRET | Cloudinary API secret         | -                     |
| ADMIN_EMAIL           | Admin email for notifications | -                     |
| FRONTEND_URL          | Frontend app URL              | http://localhost:3000 |
| ADMIN_PANEL_URL       | Admin panel URL               | http://localhost:3001 |

## 🔧 Development Tips

### Run with Nodemon

```bash
npm run dev
```

### MongoDB Connection

- **Local:** `mongodb://localhost:27017/portfolio_db`
- **Atlas:** Get connection string from MongoDB Atlas dashboard

### Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get credentials from Dashboard → Settings → Access Keys
3. Add to `.env` file

### Testing API

Use Postman, Insomnia, or Thunder Client to test endpoints.

## 📦 Deployment

### Deploy to Heroku

```bash
heroku create portfolio-backend
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
# ... set other env vars
git push heroku main
```

### Deploy to Vercel/Railway/Render

1. Connect your repository
2. Set environment variables in dashboard
3. Deploy

## 🐛 Common Issues & Solutions

### MongoDB Connection Error

- Check if MongoDB is running: `mongod`
- Verify connection string in `.env`
- For Atlas, whitelist your IP address

### Cloudinary Upload Fails

- Verify credentials in `.env`
- Check file size (max 10MB)
- Ensure file type is supported

### CORS Errors

- Add your frontend URL to `FRONTEND_URL` in `.env`
- Check CORS configuration in `server.js`

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [JWT Documentation](https://jwt.io/)

## 👨‍💻 Author

**Bhaskar Bisht**

- Email: bhaskar.s.bist@gmail.com
- GitHub: [@bhaskarbisht](https://github.com/bhaskarbisht)

## 📄 License

MIT License - feel free to use this for your own portfolio!

---

**Happy Coding! 🚀**
