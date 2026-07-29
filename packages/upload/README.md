# @input-kit/upload

React file upload primitives with drag-and-drop, preview support, validation, queues, and render-prop customization.

## Installation

```bash
npm install @input-kit/upload
```

## Features

- Drag-and-drop upload zone with active drag styling
- Queue management with concurrency limits
- File validation for count, size, and MIME types
- Image preview URLs out of the box
- Abort, retry, remove, and clear queue controls
- Render-prop API for custom upload surfaces

## Usage

```tsx
import { FileUpload } from '@input-kit/upload';

export function Example() {
	return (
		<FileUpload
			url="/api/upload"
			accept="image/*,.pdf"
			maxFiles={5}
			maxFileSize={5 * 1024 * 1024}
		/>
	);
}
```

## Custom Surface

```tsx
import { FileUpload, UploadList } from '@input-kit/upload';

<FileUpload url="/api/upload" autoUpload={false}>
	{({ files, removeFile, openFileDialog, isDragActive }) => (
		<div>
			<button onClick={openFileDialog} type="button">
				{isDragActive ? 'Release to add files' : 'Browse files'}
			</button>
			<UploadList files={files} onRemove={removeFile} />
		</div>
	)}
</FileUpload>
```

## Notes

- Use `autoUpload={false}` when you want a review step before uploading.
- `UploadList` and `UploadProgress` can be composed outside `FileUpload` for custom workflows.
- The render prop now receives both `isDragActive` and `openFileDialog` for richer custom UI.

## License

MIT © Input Kit
