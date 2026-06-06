import './globals.css';

export const metadata = {
  title: 'Study Accelerator',
  description: 'A modular learning workspace centered on knowledge bases'
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
