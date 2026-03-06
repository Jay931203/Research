'use client';

interface CrossRefProps {
  to: string; // target section id
  children: React.ReactNode;
}

export default function CrossRef({ to, children }: CrossRefProps) {
  const handleClick = () => {
    const el = document.getElementById(to);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      // Brief highlight effect
      el.classList.add('ring-2', 'ring-blue-400', 'ring-offset-2');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-2');
      }, 2000);
    }
  };

  return (
    <button onClick={handleClick} className="cross-ref">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
      {children}
    </button>
  );
}
