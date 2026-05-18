Do this in your own account nalang Please

5 More Steps to Deploy 
1. Get a free Neon database → neon.tech → create project → copy the connection string
2. Get a free Cloudinary account → cloudinary.com → copy your Cloud Name, API Key, and API Secret
3. Push the unzipped folder to GitHub
4. Import to Vercel → vercel.com → "Import Git Repository" → add these environment variables:
DATABASE_URL                        ← from Neon
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME  ← from Cloudinary
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
SESSION_SECRET                      ← any random 32+ char string
5. Run migrations once (locally or via Vercel's terminal):
bashnpm install
node lib/migrate.js
Then visit /admin/register to create your admin account. The full step-by-step is also inside DEPLOYMENT.md in the zip.