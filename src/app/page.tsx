import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-lg bg-green-500" />
          <span className="text-2xl font-bold text-zinc-100">Problocks</span>
        </div>
        <p className="text-zinc-400 text-sm">AI-powered game creation platform</p>
        <div className="flex gap-3 justify-center mt-8">
          <Link href="/studio" className="px-5 py-2.5 bg-green-500 hover:bg-green-400 text-white text-sm font-semibold rounded-xl transition-colors">
            Open Studio
          </Link>
          <Link href="/marketplace" className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold rounded-xl transition-colors">
            Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
