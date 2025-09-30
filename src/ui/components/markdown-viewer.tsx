'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewerProps {
  content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <div className="prose prose-invert prose-blue max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        h1: ({ children }) => (
          <h1 className="text-4xl font-bold text-white mb-6 mt-8 pb-3 border-b border-gray-700">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-3xl font-bold text-white mb-4 mt-8 pb-2 border-b border-gray-800">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-2xl font-semibold text-white mb-3 mt-6">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-xl font-semibold text-white mb-2 mt-4">
            {children}
          </h4>
        ),
        p: ({ children }) => (
          <p className="text-gray-300 mb-4 leading-relaxed">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-2 mb-4 text-gray-300 ml-4">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-300 ml-4">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-gray-300 leading-relaxed">
            {children}
          </li>
        ),
        code: ({ inline, children, ...props }: any) => {
          if (inline) {
            return (
              <code className="bg-gray-800 text-blue-400 px-2 py-0.5 rounded text-sm font-mono border border-gray-700" {...props}>
                {children}
              </code>
            );
          }
          return (
            <code className="block bg-gray-900 text-gray-300 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-gray-700 my-4" {...props}>
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="bg-gray-900 rounded-lg overflow-x-auto mb-4 border border-gray-700">
            {children}
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-600 bg-blue-900/20 pl-4 py-2 my-4 text-gray-300 italic">
            {children}
          </blockquote>
        ),
        a: ({ children, href }) => (
          <a
            href={href}
            className="text-blue-400 hover:text-blue-300 underline transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-6">
            <table className="min-w-full divide-y divide-gray-700 border border-gray-700 rounded-lg">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-gray-800">
            {children}
          </thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-gray-700 bg-gray-900">
            {children}
          </tbody>
        ),
        tr: ({ children }) => (
          <tr className="hover:bg-gray-800/50 transition-colors">
            {children}
          </tr>
        ),
        th: ({ children }) => (
          <th className="px-4 py-3 text-left text-sm font-semibold text-white">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-3 text-sm text-gray-300">
            {children}
          </td>
        ),
        hr: () => (
          <hr className="border-gray-700 my-6" />
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-white">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic text-gray-200">
            {children}
          </em>
        ),
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
