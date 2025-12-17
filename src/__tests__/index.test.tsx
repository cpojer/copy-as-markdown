/**
 * @vitest-environment happy-dom
 */

import { act, fireEvent, renderHook } from '@testing-library/react';
import { beforeEach, expect, Mock, test, vi } from 'vitest';
import useCopyAsMarkdown from '../index.tsx';

// @ts-expect-error
global.IS_REACT_ACT_ENVIRONMENT = true;

type SetDataType = (type: string, data: string) => void;

let element: HTMLDivElement;
let clipboardEvent: ClipboardEvent;
let setData: Mock<SetDataType>;

const mockSelection = (ancestor?: Element, selectedElement?: Element) =>
  (window.getSelection = vi.fn(
    () =>
      ({
        getRangeAt: () => ({
          cloneContents: () => selectedElement || element.children[0],
          commonAncestorContainer: ancestor || element,
        }),
        rangeCount: 1,
      }) as unknown as Selection,
  ));

beforeEach(() => {
  element = document.createElement('div');
  element.innerHTML =
    "<h1>Banana Banana Banana?</h1><b>apple</b><code>Don't escape.</code>";

  mockSelection();

  clipboardEvent = new Event('copy', {
    bubbles: true,
    cancelable: true,
  }) as ClipboardEvent;
  clipboardEvent.preventDefault = vi.fn();
  setData = vi.fn();

  type FakeClipboardData = {
    clipboardData: { setData: SetDataType };
  };

  (clipboardEvent as unknown as FakeClipboardData).clipboardData = {
    setData,
  };
});

test('copies the header', async () => {
  const { result } = renderHook(() => useCopyAsMarkdown());

  act(() => result.current(element));

  fireEvent(element, clipboardEvent);

  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(setData.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "text/plain",
        "# Banana Banana Banana?",
      ],
    ]
  `);
});

test('copies everything', async () => {
  mockSelection(element, element);

  const { result } = renderHook(() => useCopyAsMarkdown());

  act(() => result.current(element));

  fireEvent(element, clipboardEvent);

  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(setData.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "text/plain",
        "# Banana Banana Banana?

    **apple**\`Don't escape.\`",
      ],
    ]
  `);
});

test('copies the code without escaping characters', async () => {
  mockSelection(element.children[2], element.children[2]);

  const { result } = renderHook(() => useCopyAsMarkdown());

  act(() => result.current(element));

  fireEvent(element, clipboardEvent);

  await new Promise((resolve) => setTimeout(resolve, 0));

  // Expect no clipboard interception to have happened. This means
  // we let the browser handle the copy event.
  expect(setData).not.toHaveBeenCalled();
});

test('uses backticks for multiline code examples', async () => {
  element.innerHTML =
    '<h1>Banana Banana Banana?</h1><pre><code class="language-javascript">' +
    'const variable = `this is a multiline code example`;\n' +
    'console.log(`banana banana banana`);</code></pre>';

  mockSelection(element, element.children[1]);

  const { result } = renderHook(() => useCopyAsMarkdown());

  act(() => result.current(element));

  fireEvent(element, clipboardEvent);

  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(setData.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "text/plain",
        "\`\`\`javascript
    const variable = \`this is a multiline code example\`;
    console.log(\`banana banana banana\`);
    \`\`\`",
      ],
    ]
  `);
});

test('processes the HTML node before copying', async () => {
  const { result } = renderHook(() =>
    useCopyAsMarkdown(null, {
      processNode: (element) => {
        const a = document.createElement('a');
        a.href = 'https://cpojer.net';
        a.innerHTML = 'cpojer.net';
        element.append(a);
        return element;
      },
    }),
  );

  act(() => result.current(element));

  fireEvent(element, clipboardEvent);

  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(setData.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "text/plain",
        "# Banana Banana Banana?

    [cpojer.net](https://cpojer.net)",
      ],
    ]
  `);
});

test('types work correctly', () => {
  const Component = () => {
    const setRef = useCopyAsMarkdown();

    return <div ref={setRef}>Hello World</div>;
  };

  expect(() => renderHook(() => <Component />)).not.toThrow();
});
