import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter';
import './globals.css';
export const metadata: Metadata = {
  title: 'videoia', description: 'De una imagen o una frase a un vídeo corto, con movimientos de cámara.',
  robots: process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true' ? undefined : { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: '#09090b', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body>{children}</body></html>;
}
