# ToMoon Text Editor Module

A Notion-style floating text formatting toolbar for the ToMoon application.

## Version
1.0.0

## Features

- **Floating Toolbar**: Appears automatically when text is selected in designated areas
- **Text Formatting**:
  - Bold, Italic, Underline, Strikethrough
  - Headings (H1, H2, H3)
  - Inline Code
- **Links**: Add hyperlinks to selected text
- **Highlights**: Multiple highlight colors (Yellow, Green, Blue, Purple, Pink, Red)
- **Text Colors**: Change text color with multiple options
- **Keyboard Shortcuts**:
  - `Ctrl+B` - Bold
  - `Ctrl+I` - Italic
  - `Ctrl+U` - Underline
  - `Ctrl+K` - Add Link

## Files

- `text-editor.css` - Styles for the toolbar and formatting
- `text-editor.js` - JavaScript module with all functionality

## Usage

### 1. Include the files

```html
<link rel="stylesheet" href="../shared/text-editor/text-editor.css">
<script src="../shared/text-editor/text-editor.js"></script>
```

### 2. Initialize the module

```javascript
document.addEventListener('DOMContentLoaded', () => {
    TMTextEditor.init({
        targets: [
            '.your-editable-area',
            '[contenteditable="true"]',
            'textarea.rich-text'
        ]
    });
});
```

### 3. Make elements editable

For div/span elements, add `contenteditable="true"`:

```html
<div class="note-content" contenteditable="true">
    Your editable content here...
</div>
```

## API

### `TMTextEditor.init(options)`
Initialize the toolbar with target selectors.

```javascript
TMTextEditor.init({
    targets: ['.selector1', '.selector2']
});
```

### `TMTextEditor.addTargets(selectors)`
Add new target selectors dynamically.

```javascript
TMTextEditor.addTargets('.new-editable-area');
TMTextEditor.addTargets(['.area1', '.area2']);
```

### `TMTextEditor.removeTargets(selectors)`
Remove target selectors.

```javascript
TMTextEditor.removeTargets('.removed-area');
```

### `TMTextEditor.hideToolbar()`
Manually hide the toolbar.

### `TMTextEditor.destroy()`
Completely remove the toolbar and clean up event listeners.

## Highlight Classes

Apply these classes to styled text:

- `.tm-highlight-yellow`
- `.tm-highlight-green`
- `.tm-highlight-blue`
- `.tm-highlight-purple`
- `.tm-highlight-pink`
- `.tm-highlight-red`

## Text Color Classes

- `.tm-text-red`
- `.tm-text-orange`
- `.tm-text-yellow`
- `.tm-text-green`
- `.tm-text-blue`
- `.tm-text-purple`
- `.tm-text-pink`
- `.tm-text-gray`

## Customization

### CSS Variables

You can override these colors in your own CSS:

```css
.tm-text-toolbar {
    background: #your-color;
    border-color: #your-border;
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Changelog

### 1.0.0
- Initial release
- Basic text formatting (bold, italic, underline, strikethrough)
- Heading styles (H1, H2, H3)
- Link insertion
- Highlight colors
- Text colors
- Keyboard shortcuts
