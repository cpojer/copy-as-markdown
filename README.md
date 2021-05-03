# copy-as-markdown

A React hook to copy text as Markdown.

## Why?

Copying text as Markdown is helpful for blog posts or documentation pages that were authored in Markdown and may be copied into other documents or code comments. Instead of copying plain text or rich text, this utility will copy the selected content as Markdown.

![Example](https://raw.githubusercontent.com/cpojer/copy-as-markdown/main/example.gif)

## See it in action

Check out blog posts on cpojer.net, for example [Principles of Developer Experience](https://cpojer.net/posts/principles-of-devx), and copy text within the article. The text will be copied as markdown.

## Usage

Install:

```
yarn add @cnakazawa/copy-as-markdown
```

Use:

```jsx
import useCopyAsMarkdown from '@cnakazawa/copy-as-markdown';

export default function MyComponent() {
  const setRef = useCopyAsMarkdown();

  return (
    <div ref={setRef}>
      <h1>When copied, this will turn into Markdown</h1>
      Any <em>rich content</em> inside of this container will be copied as <strong>
        Markdown
      </strong>.
    </div>
  );
}
```

This library uses [`turndown`](https://github.com/domchristie/turndown) to convert HTML to Markdown. You can pass any [`turndown` Options](https://github.com/domchristie/turndown#options) to the `useCopyAsMarkdown` hook:

```jsx
const setRef = useCopyAsMarkdown({
  bulletListMarker: '-',
  strongDelimiter: '__',
});
```
