# Stage

A modern web-based canvas editor for creating stunning visual designs. Upload images, add text overlays, customize backgrounds, and export high-quality graphics—all in your browser.

## What is Stage?

Stage is a powerful yet simple canvas editor that runs entirely in your web browser. Create professional-looking designs for social media, presentations, or personal projects without any design software.

### Key Features

- **Image Upload & Customization** - Upload images and adjust size, opacity, borders, shadows, and border radius
- **Text Overlays** - Add multiple text overlays with custom fonts, colors, sizes, positions, and text shadows
- **Backgrounds** - Choose from gradients, solid colors, or upload your own background images
- **Presets** - Apply 5 ready-made presets (Social Ready, Story Style, Minimal Clean, Bold Gradient, Dark Elegant) for instant professional styling
- **Aspect Ratios** - Support for Instagram, social media, and standard photo formats
- **Export** - Export as PNG (with transparency) or JPG with adjustable quality and scale (up to 5x)

## Quick Start

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Setup

1. Create `.env.local` with (optional):
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name (optional, for image optimization)
   - `CLOUDINARY_API_KEY` - Cloudinary API key (optional)
   - `CLOUDINARY_API_SECRET` - Cloudinary API secret (optional)

## Usage

### Creating a Design

1. **Upload an Image** - Click the upload area or drag & drop an image
2. **Choose Aspect Ratio** - Select from Instagram, social media, or standard formats
3. **Customize Background** - Choose gradients, solid colors, or upload your own
4. **Add Text** - Add text overlays with full customization options
5. **Apply Presets** - Use presets for instant professional styling
6. **Export** - Export as PNG or JPG with your preferred quality and scale settings

### Features Overview

- **Presets** - One-click styling with 5 professional presets
- **Aspect Ratios** - Optimized formats for Instagram, Stories, Reels, and more
- **Text Overlays** - Multiple text layers with custom fonts, colors, shadows, and positioning
- **Backgrounds** - Gradients, solid colors, or custom images
- **Image Controls** - Adjust size, opacity, borders, shadows, and border radius
- **Export Options** - PNG or JPG with quality and scale controls

## Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Konva/React-Konva** - Canvas rendering
- **Cloudinary** - Image optimization and CDN (optional)
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **html2canvas** - Export functionality

## Project Structure

```text
stage/
├── app/                    # Next.js pages and API routes
│   └── home/              # Editor page
├── components/            # React components
│   ├── canvas/            # Canvas editor components
│   ├── editor/            # Editor UI components
│   ├── landing/           # Landing page sections
│   ├── presets/           # Preset selector component
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and constants
│   ├── constants/         # Aspect ratios, colors, presets, etc.
│   ├── export/            # Export functionality
│   └── store/             # Zustand store
└── types/                 # TypeScript type definitions
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run upload-backgrounds` - Upload backgrounds to Cloudinary
- `npm run upload-demo-images` - Upload demo images to Cloudinary

## Default Settings

- Max image size: 10MB
- Supported formats: PNG, JPG, JPEG, WEBP
- Export scale: Up to 5x
- Export formats: PNG (with transparency) or JPG

## License

See [LICENSE](LICENSE) file for details.
