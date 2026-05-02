import type { Metadata } from 'next';
import { Cairo, Tajawal, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});
const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800', '900'],
  variable: '--font-tajawal',
  display: 'swap',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'فيراري لتأجير السيارات — تأجير سيارات فاخرة في الكويت',
  description:
    'تأجير سيارات فاخرة في الكويت — مرسيدس، بي ام دبليو، رولز رويس، بورش وأكثر. تأمين شامل، بدون كمبيالة، وتسليم في المطار.',
  icons: { icon: '/assets/logo.jpg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${tajawal.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Lock theme to light mode and default yellow accent before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{localStorage.removeItem('fcr-theme');localStorage.removeItem('fcr-accent');document.documentElement.setAttribute('data-theme','light');document.documentElement.style.setProperty('--y','#FFD400');document.documentElement.style.setProperty('--y-deep','#f5c800');}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
