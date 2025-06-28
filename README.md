# Caption It Create

A modern web app to generate AI-powered captions for your photos, edit them with a beautiful UI, and download high-quality captioned images.

## Features

- Upload multiple photos and switch between them
- Generate captions using AI (Hugging Face Transformers)
- Edit captions, font, color, and position directly on the image
- Download high-resolution captioned images
- Clean, responsive, and user-friendly interface

## Technologies Used

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui (Radix UI components)
- Fabric.js (canvas editing)
- Hugging Face Transformers (browser-based AI)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm (v9+ recommended)

### Setup

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd caption-it-create

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Build for Production

```sh
npm run build
```

### Deploy to GitHub Pages

1. Set the `homepage` field in `package.json` to your GitHub Pages URL (e.g., `https://yourusername.github.io/caption-it-create`).
2. Use a tool like [gh-pages](https://www.npmjs.com/package/gh-pages) or your preferred static hosting method.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

- The included AI model ([nlpconnect/vit-gpt2-image-captioning](https://huggingface.co/nlpconnect/vit-gpt2-image-captioning)) and [Transformers.js](https://github.com/xenova/transformers.js) are licensed under the Apache 2.0 License.

## Attribution

- [Hugging Face Transformers.js](https://github.com/xenova/transformers.js) and [nlpconnect/vit-gpt2-image-captioning](https://huggingface.co/nlpconnect/vit-gpt2-image-captioning) (Apache 2.0)
- [shadcn/ui](https://ui.shadcn.com/) and [Radix UI](https://www.radix-ui.com/)
- [Fabric.js](http://fabricjs.com/)

---

_This project is open source and not affiliated with any of the above organizations._
