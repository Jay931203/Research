'use client';

import Link from 'next/link';
import { BookOpen, ChevronRight, Clock, GraduationCap, Hash, Layers } from 'lucide-react';
import Header from '@/components/layout/Header';

/* ------------------------------------------------------------------ */
/*  Data — fill in your courses here                                   */
/* ------------------------------------------------------------------ */

type Course = {
  name: string;        // 한국어 과목명
  nameEn?: string;     // 영문 과목명 (선택)
  code?: string;       // 과목 코드 (선택)
  semester: string;    // 예: '2023-1', '2024-2'
  credits: number;     // 학점
  grade?: string;      // 성적: 'A+', 'A0', 'B+', … (선택)
  category: 'undergrad' | 'grad';
  tags?: string[];     // 키워드 태그 (선택)
  note?: string;       // 한 줄 메모 (선택)
};

const COURSES: Course[] = [
  // ── 대학원 ────────────────────────────────────────────────────────
  // {
  //   name: '심층학습 이론',
  //   nameEn: 'Deep Learning Theory',
  //   semester: '2024-1',
  //   credits: 3,
  //   grade: 'A+',
  //   category: 'grad',
  //   tags: ['딥러닝', '최적화', '이론'],
  //   note: '역전파·표현 이론 중심',
  // },

  // ── 학부 ─────────────────────────────────────────────────────────
  // {
  //   name: '자료구조',
  //   semester: '2021-1',
  //   credits: 3,
  //   grade: 'A+',
  //   category: 'undergrad',
  //   tags: ['알고리즘'],
  // },
];

/* ------------------------------------------------------------------ */

const GRADE_COLORS: Record<string, string> = {
  'A+': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'A0': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'B+': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'B0': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  'C+': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
};

function CourseCard({ course }: { course: Course }) {
  const gradeClass = course.grade
    ? (GRADE_COLORS[course.grade] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300')
    : null;

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[10px] font-semibold tracking-wider text-gray-400 dark:text-gray-500">
            {course.semester} · {course.credits}학점
            {course.code && ` · ${course.code}`}
          </span>
          <h3 className="text-sm font-bold leading-snug text-gray-900 dark:text-gray-100">
            {course.name}
          </h3>
          {course.nameEn && (
            <span className="text-xs text-gray-400 dark:text-gray-500">{course.nameEn}</span>
          )}
        </div>
        {gradeClass && (
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${gradeClass}`}>
            {course.grade}
          </span>
        )}
      </div>

      {course.note && (
        <p className="mb-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {course.note}
        </p>
      )}

      {course.tags && course.tags.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {course.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyGroup({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-14 text-center dark:border-gray-700 dark:bg-gray-900">
      <BookOpen className="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
        {label} 과목이 없습니다
      </p>
      <p className="mt-1 text-xs text-gray-300 dark:text-gray-600">
        page.tsx의 COURSES 배열에 과목을 추가하세요
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function CourseworkPage() {
  const gradCourses = COURSES.filter((c) => c.category === 'grad');
  const undergradCourses = COURSES.filter((c) => c.category === 'undergrad');

  const totalCredits = COURSES.reduce((sum, c) => sum + c.credits, 0);
  const graded = COURSES.filter((c) => c.grade);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-5xl items-center gap-2 text-sm">
          <Link
            href="/"
            className="text-gray-500 transition hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
          >
            홈
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="font-medium text-gray-800 dark:text-gray-200">코스웍</span>
        </div>
      </div>

      <main className="mx-auto max-w-5xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="overflow-hidden rounded-2xl shadow-sm">
          <div className="bg-gradient-to-br from-teal-700 via-cyan-700 to-sky-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                Course Record
              </span>
            </div>
            <h1 className="text-2xl font-bold leading-snug text-white sm:text-3xl">
              코스웍 과목 목록
            </h1>
            <p className="mt-2 text-sm text-cyan-200">
              학부 및 대학원 수강 과목 정리
            </p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {[
              { icon: <Hash className="h-4 w-4" />, label: '총 과목', value: COURSES.length },
              { icon: <Layers className="h-4 w-4" />, label: '총 학점', value: totalCredits },
              { icon: <GraduationCap className="h-4 w-4" />, label: '성적 기록', value: graded.length },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex flex-col items-center py-4 gap-1">
                <span className="text-gray-400 dark:text-gray-500">{icon}</span>
                <span className="text-xl font-bold text-gray-800 dark:text-gray-200">{value}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Graduate courses */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
              대학원
            </span>
            <span className="text-sm text-gray-400 dark:text-gray-500">
              {gradCourses.length}과목 · {gradCourses.reduce((s, c) => s + c.credits, 0)}학점
            </span>
          </div>
          {gradCourses.length === 0 ? (
            <EmptyGroup label="대학원" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gradCourses.map((course, i) => (
                <CourseCard key={i} course={course} />
              ))}
            </div>
          )}
        </section>

        {/* Undergrad courses */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              학부
            </span>
            <span className="text-sm text-gray-400 dark:text-gray-500">
              {undergradCourses.length}과목 · {undergradCourses.reduce((s, c) => s + c.credits, 0)}학점
            </span>
          </div>
          {undergradCourses.length === 0 ? (
            <EmptyGroup label="학부" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {undergradCourses.map((course, i) => (
                <CourseCard key={i} course={course} />
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
