import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-blue-500 text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">SmartChat</Link>
        <nav>
          <ul className="flex space-x-4">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li><Link href="/chat" className="hover:underline">Chat</Link></li>
            <li><Link href="/upload" className="hover:underline">Documents</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}