import {useCallback, useRef} from 'react';
import type TurndownService from 'turndown';

type RefType = {
  element: HTMLElement;
  listener: (event: ClipboardEvent) => void;
};

type CallbackFn = (element: HTMLElement) => void;

export function getSelectedInnerHTML(containerNode: HTMLElement) {
  const selection = window.getSelection();
  if (selection && selection.rangeCount) {
    const container = document.createElement('div');
    for (let i = 0; i < selection.rangeCount; i++) {
      let parent: Node | null = selection.getRangeAt(i).commonAncestorContainer;
      // Let the regular copy-paste behavior take place if the user only selects
      // content within a `code` tag to avoid escape characters from being added.
      while (parent && parent !== containerNode) {
        if (
          parent &&
          parent.nodeType === 1 &&
          (parent as HTMLElement).tagName.toLowerCase() === 'code'
        ) {
          return null;
        }
        parent = parent.parentElement;
      }
      container.appendChild(selection.getRangeAt(i).cloneContents());
    }
    return container.innerHTML;
  }

  return null;
};

export default function useCopyAsMarkdown(
  markdownOptions?: TurndownService.Options,
): CallbackFn {
  const ref = useRef<RefType | null>(null);
  return useCallback((element: HTMLElement) => {
    if (ref.current) {
      ref.current.element.removeEventListener('copy', ref.current.listener);
      ref.current = null;
    }
    if (element) {
      const listener = (event: ClipboardEvent) => {
        // Lazy-require `turndown` only when needed.
        const TurndownService =
          require('turndown').default || require('turndown');
        const html = getSelectedInnerHTML(element);
        const markdown =
          html &&
          new TurndownService({
            codeBlockStyle: 'fenced',
            headingStyle: 'atx',
            hr: '---',
            ...markdownOptions,
          }).turndown(html);
        if (markdown) {
          event.preventDefault();
          event.clipboardData?.setData('text/plain', markdown);
        }
      };
      element.addEventListener('copy', listener);
      ref.current = {
        element,
        listener,
      };
    }
  }, []);
}
