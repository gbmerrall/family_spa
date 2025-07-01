# Family Tree Tracker SPA

A simple Single Page Application for tracking family tree members with their relationships.

## Features

- **Add new family members** with surname, first names, date of birth, date of death, marriage date, and gender
- **Manage relationships** including father, mother, siblings, partner, and children
- **Local storage** - All data is saved locally in your browser
- **Export/Import JSON** - Backup and restore your family tree data
- **Modern responsive design** - Works on desktop and mobile devices

## How to Use

### Getting Started
1. Open `index.html` in your web browser
2. Click "Add New Person" to start building your family tree

### Adding Family Members
1. Click the "Add New Person" button
2. Fill in the person's details:
   - **Surname** (required)
   - **First Names** (required)
   - **Date of Birth** (optional - supports flexible formats):
     - Year only: `1950`
     - Year and month: `1950-05`  
     - Full date: `1950-05-15`
   - **Date of Death** (optional, same flexible formats as birth)
   - **Marriage Date** (optional, same flexible formats as birth/death)
   - **Gender** (required - Male/Female/Other)
3. Click "Save Person"

### Managing Relationships
1. Click the "Relationships" button on any person's card
2. Set relationships using the dropdown menus:
   - **Father/Mother**: Select from available males/females
   - **Partner**: Select any other person
   - **Siblings**: Add multiple siblings
   - **Children**: Add multiple children
3. Relationships are automatically bidirectional (e.g., if you set someone as a father, they automatically get that person as a child)

### Data Management
- **Export**: Click "Export JSON" to download your family tree data
- **Import**: Click "Import JSON" to restore from a previously exported file
- **Auto-save**: All changes are automatically saved to your browser's local storage

### Editing and Deleting
- Use the "Edit" button to modify a person's details
- Use the "Delete" button to remove a person (this also removes all their relationships)

## Technical Details

- **Pure HTML/CSS/JavaScript** - No external dependencies
- **Responsive design** - Works on all screen sizes
- **Local storage** - Data persists between browser sessions
- **Modern UI** - Clean, intuitive interface with smooth animations

## Browser Compatibility

Works in all modern browsers that support:
- ES6 Classes
- Local Storage
- CSS Grid
- Flexbox

## File Structure

- `index.html` - Main HTML file
- `styles.css` - All styling and responsive design
- `script.js` - Complete JavaScript functionality
- `README.md` - This documentation

## Data Format

The exported JSON contains:
```json
{
  "persons": [["id", { person_object }], ...],
  "exportDate": "2024-01-01T00:00:00.000Z",
  "version": "1.0"
}
```

Each person object includes:
- Basic info: id, surname, firstNames, dateOfBirth, dateOfDeath, marriageDate, gender
- Relationships: father, mother, siblings[], partner, children[]
- Metadata: createdAt, updatedAt 