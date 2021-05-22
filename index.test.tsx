import {fireEvent} from '@testing-library/react';
import {renderHook, act} from '@testing-library/react-hooks';
import useCopyAsMarkdown from './index.js';

type SetDataType = (type: string, data: string) => void;

let element: HTMLDivElement;
let fakeClipboardEvent: ClipboardEvent;
let setData: jest.Mock<void, [string, string]>;

const mockSelection = (ancestor?: Element, selectedElement?: Element) =>
  (window.getSelection = jest.fn(
    () =>
      (({
        rangeCount: 1,
        getRangeAt: () => ({
          commonAncestorContainer: ancestor || element,
          cloneContents: () => selectedElement || element.children[0],
        }),
      } as unknown) as Selection),
  ));

beforeEach(() => {
  element = document.createElement('div');
  element.innerHTML =
    "<h1>Banana Banana Banana?</h1><b>apple</b><code>Don't escape.</code>";

  mockSelection();

  fakeClipboardEvent = new Event('copy', {
    bubbles: true,
    cancelable: true,
  }) as ClipboardEvent;
  fakeClipboardEvent.preventDefault = jest.fn();
  setData = jest.fn();

  type FakeClipboardData = {
    clipboardData: {setData: SetDataType};
  };

  ((fakeClipboardEvent as unknown) as FakeClipboardData).clipboardData = {
    setData,
  };
});

test('copies the header', () => {
  const {result} = renderHook(() => useCopyAsMarkdown());

  act(() => {
    result.current(element);
  });

  fireEvent(element, fakeClipboardEvent);

  expect(setData.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        "text/plain",
        "# Banana Banana Banana?",
      ],
    ]
  `);
});

test('copies everything', () => {
  mockSelection(element, element);

  const {result} = renderHook(() => useCopyAsMarkdown());

  act(() => {
    result.current(element);
  });

  fireEvent(element, fakeClipboardEvent);

  expect(setData.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        "text/plain",
        "# Banana Banana Banana?

    **apple**\`Don't escape.\`",
      ],
    ]
  `);
});

test('copies the code without escaping characters', () => {
  mockSelection(element.children[2], element.children[2]);

  const {result} = renderHook(() => useCopyAsMarkdown());

  act(() => {
    result.current(element);
  });

  fireEvent(element, fakeClipboardEvent);

  // Expect no clipboard interception to have happened. This means
  // we let the browser handle the copy event.
  expect(setData).not.toHaveBeenCalled();
});

test('uses backticks for multiline code examples', () => {
  element.innerHTML =
    '<h1>Banana Banana Banana?</h1><pre><code class="language-javascript">' +
    'const variable = `this is a multiline code example`;\n' +
    'console.log(`banana banana banana`);</code></pre>';

  mockSelection(element, element.children[1]);

  const {result} = renderHook(() => useCopyAsMarkdown());

  act(() => {
    result.current(element);
  });

  fireEvent(element, fakeClipboardEvent);

  expect(setData.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        "text/plain",
        "\`\`\`javascript
    const variable = \`this is a multiline code example\`;
    console.log(\`banana banana banana\`);
    \`\`\`",
      ],
    ]
  `);
});

test('processes the HTML node before copying', () => {
  const {result} = renderHook(() =>
    useCopyAsMarkdown(null, {
      processNode: (element) => {
        const a = document.createElement('a');
        a.href = 'https://cpojer.net';
        a.innerHTML = 'cpojer.net';
        element.appendChild(a);
        return element;
      },
    }),
  );

  act(() => {
    result.current(element);
  });

  fireEvent(element, fakeClipboardEvent);

  expect(setData.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        "text/plain",
        "# Banana Banana Banana?

    [cpojer.net](https://cpojer.net)",
      ],
    ]
  `);
});
