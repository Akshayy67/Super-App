# AI Resume Builder Module

## Quick Start

The AI Resume Builder is fully integrated and ready to use!

### Access the Resume Builder

1. Navigate to `/resume-builder` in your app
2. Or click "Resume Builder" in the sidebar menu

### Basic Workflow

1. **Create Resume**: Start with a template or blank resume
2. **Add Sections**: Click the "+" button to add sections (Experience, Education, Skills, etc.)
3. **Edit Content**: Click the edit icon on any section to add your information
4. **AI Enhancement**: 
   - Paste a job description
   - Click "Analyze & Enhance"
   - Review feedback and apply suggestions
5. **Export**: Click "Export" → "Export as PDF"

### Key Features

- ✅ Drag-and-drop section reordering
- ✅ 6 professional templates
- ✅ Real-time preview
- ✅ AI-powered enhancement
- ✅ Match score calculation
- ✅ Auto-save (local + cloud)
- ✅ PDF & JSON export

### Components

- `AIResumeBuilder.tsx` - Main component
- `ResumeSectionItem.tsx` - Draggable section
- `SectionEditor.tsx` - Section editor modal
- `ResumePreview.tsx` - Live preview
- `AIFeedbackPanel.tsx` - AI feedback display

### Services

- `resumeAIService.ts` - AI enhancement logic
- `resumeStorage.ts` - Storage utilities
- `resumeExport.ts` - Export functionality

### Environment Setup

Make sure you have:

```env
VITE_GEMINI_API_KEY=your_api_key
VITE_GEMINI_MODEL=gemini-2.0-flash
```

### Documentation

See `docs/RESUME_BUILDER_GUIDE.md` for complete documentation.

