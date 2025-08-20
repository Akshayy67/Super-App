# Copy to Short Note Feature

## Overview
The Copy to Short Note feature allows users to create short notes from any text they copy on the website. This feature works globally across all components and automatically detects the source context of the copied text.

## How It Works
1. **Global Detection**: Listens for copy events across the entire website
2. **Source Context Detection**: Identifies the source context (AI Assistant, Short Notes, Flashcards, Tasks, etc.)
3. **Automatic Modal**: Shows a modal to create a short note from the copied text
4. **Auto-population**: Pre-fills title and content based on the copied text and source
5. **Integration**: Short note is saved to the user's short notes collection and accessible in the Short Notes section
6. **Google Drive Storage**: Automatically stores short notes in a dedicated "ShortNotes" folder within the "SuperApp" folder in Google Drive

## Supported Sources
- **AI Assistant**: Detects text copied from AI chat messages
- **Short Notes**: Detects text copied from short note content
- **Flashcards**: Detects text copied from flashcard questions/answers
- **Tasks**: Detects text copied from task descriptions
- **File Content**: Detects text copied from file previews
- **Dashboard**: Detects text copied from dashboard content
- **File Manager**: Detects text copied from file listings
- **Study Tools**: Detects text copied from study tool content

## Technical Implementation

### Components
- **GlobalNoteCreator**: The modal component for creating short notes
- **useGlobalCopyListener**: Custom hook that manages global copy event listening

### Data Attributes
Components use `data-component` attributes for source detection:
```html
<div data-component="ai-chat">
<div data-component="notes">
<div data-component="flashcards">
<div data-component="tasks">
<div data-component="file-content">
<div data-component="dashboard">
<div data-component="file-manager">
<div data-component="study-tools">
```

### Google Drive Integration
- Creates a "ShortNotes" folder within the "SuperApp" folder
- Stores each short note as a Google Doc with formatted content
- Includes metadata like creation date, tags, and source context
- Falls back to localStorage if Google Drive is not available

## Usage Examples

### Creating a Short Note from AI Chat
1. Copy text from an AI assistant response
2. Modal automatically appears with pre-filled content
3. Edit title and add tags if desired
4. Click "Save Short Note"
5. Short note is saved locally and to Google Drive

### Creating a Short Note from File Content
1. Copy text from a file preview
2. Source context is automatically detected as "File Content"
3. Create short note with file reference
4. Access from Short Notes section

## Benefits
1. **Seamless Integration**: No need to manually navigate to short notes section
2. **Context Preservation**: Automatically captures source information
3. **Quick Capture**: Create short notes without interrupting workflow
4. **Cloud Storage**: Automatic backup to Google Drive
5. **Searchable**: All short notes are searchable by title, content, and tags
6. **Organized**: Structured storage in dedicated Google Drive folder

## Future Enhancements
- **Batch Processing**: Create multiple short notes from multiple copied selections
- **Export Options**: Export short notes to different formats
- **Search Integration**: Enhanced search within created short notes
- **Collaboration**: Share short notes with other users
- **Templates**: Pre-defined short note templates for different content types
