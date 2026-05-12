# SmartShop

A modern single-page e-commerce storefront focused on clarity, speed, and smooth user interactions.

## Live Demo

Visit the live project: **[smart-shop-rust.vercel.app](https://smart-shop-rust.vercel.app/)**  
Hosted on Vercel with static deployment.

## Why SmartShop

SmartShop is designed to keep online shopping simple and trustworthy:
- Clean, responsive UI
- Fast product discovery
- Lightweight cart and wishlist flow
- Review-driven shopping confidence

## Features

- Product catalog with live search and filtering
- Slide-out cart drawer for quick checkout flow
- Customer reviews carousel powered by local JSON data
- FAQ and contact sections for user support
- Mobile-friendly layout with dark mode support

## Tech Stack

- HTML5
- Tailwind CSS (CDN)
- Vanilla JavaScript
- Static JSON data source (`reviews.json`)

## Project Structure

- `index.html` - Main application UI and client logic
- `reviews.json` - Review content displayed in the reviews section
- `vercel.json` - Static deployment configuration for Vercel

## Run Locally

This project is static and requires no build step.

1. Clone or download the project.
2. Open `index.html` directly in your browser.
3. For best local behavior, serve with a lightweight local server:

```bash
# Python 3
python -m http.server 5500
```

Then open `http://localhost:5500`.

## Deployment

This project is already deployed on Vercel.  
Production URL: [https://smart-shop-rust.vercel.app/](https://smart-shop-rust.vercel.app/)

## License

Use freely for learning, prototyping, and personal projects.
