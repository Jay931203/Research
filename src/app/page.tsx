import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="z-10 max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            CSI AutoEncoder
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300">
            연구 시각화 플랫폼
          </p>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            CSI AutoEncoder 관련 연구들을 인터랙티브한 마인드맵으로 탐색하고,
            학습 진도를 관리하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard"
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all hover:-translate-y-1"
          >
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600">
              대시보드
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              논문 검색, 마인드맵 시각화, 통계 확인
            </p>
          </Link>

          <Link
            href="/import"
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all hover:-translate-y-1"
          >
            <div className="text-4xl mb-4">📥</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600">
              데이터 Import
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              초기 논문 데이터 로드 및 관리
            </p>
          </Link>

          <Link
            href="/test"
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all hover:-translate-y-1"
          >
            <div className="text-4xl mb-4">🔌</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600">
              연결 테스트
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Supabase 데이터베이스 연결 상태 확인
            </p>
          </Link>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <h3 className="font-semibold mb-3">✨ 주요 기능</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 인터랙티브 논문 마인드맵
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 핵심 수식 LaTeX 렌더링
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 논문 간 관계 시각화
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 개인 학습 진도 관리
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
