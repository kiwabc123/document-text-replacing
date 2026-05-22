# Invoice Automation - Next.js Application

A modern web application for automating invoice generation from templates. Upload `.docx` templates, fill in variables, add dynamic tables, and generate PDFs—all in one streamlined workflow.

## Features

✅ **Template Management** - Upload and parse .docx templates to extract variables
✅ **Dynamic Variables** - Automatic variable detection with type inference (text, number, currency, email, date, phone)
✅ **CSV Import** - Bulk import invoice data from CSV files with intelligent column mapping
✅ **Dynamic Tables** - Add, edit, and delete table rows with validation
✅ **PDF Generation** - Generate professional PDFs using Puppeteer (serverless-compatible)
✅ **PDF Preview** - View and download PDFs in-browser
✅ **Draft Management** - Save and restore invoice drafts using localStorage

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

- **Framework**: Next.js 16 + TypeScript
- **Styling**: Tailwind CSS
- **PDF**: Puppeteer (HTML→PDF, serverless-compatible)
- **Templates**: Mammoth (.docx parsing)
- **CSV**: Papaparse
- **Storage**: Vercel Blob (ready to configure)

## Project Structure

```
app/api/              - API routes (templates, CSV, PDF generation)
components/           - React components (wizard, forms, tables, preview)
lib/                  - Utilities (parsing, PDF generation, storage)
types/                - TypeScript type definitions
```

## Usage

1. **Upload** a .docx template
2. **Fill** variables manually or via CSV import
3. **Add** table rows as needed
4. **Generate** and preview PDF
5. **Download** or create another

## API Endpoints

- `POST /api/templates/upload` - Upload and parse .docx
- `GET /api/templates` - List templates
- `POST /api/data/parse-csv` - Parse CSV files
- `POST /api/pdf/generate` - Generate PDF

## Development

```bash
npm run dev           # Start dev server
npm run build         # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## Deployment

Deploy to Vercel (recommended for Next.js):

```bash
git push              # Push to GitHub
# Connect repo in Vercel Dashboard
# Add environment variables (BLOB_READ_WRITE_TOKEN)
```

## Known Limitations

- Vercel Blob integration requires environment setup
- Puppeteer may have memory constraints on serverless
- Template extraction supports basic variable patterns only

## Next Steps

- [ ] Implement Vercel Blob storage
- [ ] Add database for template persistence
- [ ] Enable email sending
- [ ] Add user authentication
- [ ] Create batch PDF generation
- [ ] Build invoice history/search

## Documentation

See [full README](./README-FULL.md) for detailed documentation, API reference, and troubleshooting guide.

---

**Build Status**: ✅ Complete
**Phase 1**: Template Infrastructure & PDF Generation - DONE
**Phase 2**: Advanced Features - IN PROGRESS
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
