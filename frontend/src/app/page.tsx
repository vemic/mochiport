import { redirect } from 'next/navigation';

export default function HomePage() {
  // ダッシュボードにリダイレクト
  redirect('/dashboard');
}

HomePage.displayName = 'HomePage';
