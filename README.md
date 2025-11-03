# Stage

A modern web-based canvas editor for creating visual designs. Add images, text, and backgrounds to create stunning graphics that you can export in high quality.

## What is Stage?

Stage is a canvas editor that runs in your web browser. Think of it like a simple version of Photoshop or Canva - you can:

- Upload images and add them to your canvas
- Add text overlays with custom fonts and colors
- Change backgrounds (solid colors, gradients, or images)
- Resize, move, and rotate everything
- Export your designs as PNG or JPG files

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

4. **Set up environment variables:**
   Create a `.env.local` file with required variables (see Environment Variables section below).

5. **Set up database:**
   ```bash
   npx prisma migrate dev
   ```

6. **Optional - Set up Cloudinary for image optimization:**
   See [CLOUDINARY_SETUP.md](CLOUDINARY_SETUP.md) for instructions on configuring Cloudinary to optimize all images automatically.

## How to Use

### Main Pages
- **Landing Page** (`/`) - Marketing page with features, pricing, and FAQ
- **Editor** (`/home`) - The main canvas editor where you create designs

### In the Editor
1. **Add Images**: Click "Upload" to add images from your computer
2. **Add Text**: Click "Text" to add text overlays to your canvas
3. **Change Background**: Click "Background" to set solid colors, gradients, or background images
4. **Transform Objects**: Click and drag to move, use corner handles to resize/rotate
5. **Export**: Click "Export" to download your design as PNG or JPG

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required
- `DATABASE_URL` - PostgreSQL connection string

### Required for Cloudinary (Optional but Recommended)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- Get these from your [Cloudinary Dashboard](https://cloudinary.com/console)

### Required for Authentication (Better Auth)
- `BETTER_AUTH_SECRET` - Secret key for encryption (generate with: `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (optional, for Google sign-in)
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret (optional)

## Tech Stack

- **Next.js 16** - React framework
- **React 19** - UI library
- **Konva** - Canvas rendering engine
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **Cloudinary** - Image optimization and CDN

## Project Structure

```
stage/
├── app/              # Next.js pages and routes
├── components/       # React components
│   ├── canvas/      # Canvas editor components
│   ├── landing/     # Landing page sections
│   └── ui/          # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and constants
└── types/           # TypeScript type definitions
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## Default Settings

- Canvas size: 1920 × 1080 pixels
- Max image size: 10MB
- Supported formats: JPEG, PNG, WebP

## License

See [LICENSE](LICENSE) file for details.
