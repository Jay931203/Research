'use client';
import { useState } from 'react';
import type { StudyTopic } from '../TopicStudyCard';

function SH({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-lg">{icon}</span>
      <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">{title}</h2>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

function ConceptBox({ what, rules, caution }: { what: string; rules: string[]; caution?: string }) {
  return (
    <div className="mb-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 p-4 space-y-2.5">
      <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">{what}</p>
      <ul className="space-y-1.5">
        {rules.map((r, i) => (
          <li key={i} className="flex gap-2 text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
            <span className="mt-0.5 flex-shrink-0 h-4 w-4 rounded bg-blue-400/70 flex items-center justify-center text-[9px] font-black text-white">{i + 1}</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
      {caution && (
        <div className="flex gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 px-3 py-2 text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
          <span className="flex-shrink-0 font-bold">⚠</span>
          <span>{caution}</span>
        </div>
      )}
    </div>
  );
}

/* ── Section 1: Node/LinkedList 구조 시각화 (append는 prepend) ── */
function ListBuilderSection() {
  const [nodes, setNodes] = useState<number[]>([]);
  const [inputVal, setInputVal] = useState('');

  function append() {
    const v = parseInt(inputVal);
    if (isNaN(v)) return;
    setNodes(prev => [v, ...prev]); // prepend: head에 추가
    setInputVal('');
  }

  function reset() { setNodes([]); }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
            append()는 <span className="text-amber-600 dark:text-amber-400">앞에 삽입(prepend)</span> — 결과 순서에 주의
          </p>
        </div>
        <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
          <div className="flex gap-2">
            <input
              type="number"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && append()}
              placeholder="정수 입력"
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={append}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500 transition">
              append()
            </button>
            <button onClick={reset}
              className="rounded-lg bg-slate-200 dark:bg-slate-700 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition">
              초기화
            </button>
          </div>

          {/* Linked list visualization */}
          {nodes.length === 0 ? (
            <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-sm">
              값을 입력하고 append()를 눌러보세요
            </div>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div className="flex items-center gap-0 min-w-max">
                <div className="flex items-center gap-1 mr-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">head</span>
                  <span className="text-slate-400 text-sm">→</span>
                </div>
                {nodes.map((val, i) => (
                  <div key={i} className="flex items-center">
                    <div className="flex border-2 border-blue-500 dark:border-blue-400 rounded-lg overflow-hidden bg-blue-50 dark:bg-blue-950/40">
                      <div className="px-3 py-2 text-sm font-mono font-bold text-blue-800 dark:text-blue-200 border-r border-blue-300 dark:border-blue-700">
                        {val}
                      </div>
                      <div className="px-2 py-2 text-xs text-slate-400 dark:text-slate-500 font-mono">next</div>
                    </div>
                    {i < nodes.length - 1 ? (
                      <span className="mx-1.5 text-blue-400 font-bold">→</span>
                    ) : (
                      <span className="mx-1.5 text-slate-400 font-mono text-sm">→ null</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {nodes.length > 0 && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 p-3 text-xs text-amber-800 dark:text-amber-200">
              <p className="font-bold mb-1">호출 순서 vs 리스트 순서</p>
              <p>append({nodes.slice().reverse().join(') → append(')}) 순서로 호출했을 때:</p>
              <p className="font-mono mt-1">결과: {nodes.join(' → ')} → null</p>
              <p className="mt-1 text-amber-600 dark:text-amber-400">마지막에 append한 값이 head!</p>
            </div>
          )}
        </div>
      </div>

      {/* Code reference */}
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="bg-slate-800 px-4 py-2 border-b border-slate-700">
          <p className="text-xs text-slate-400">Node 구조 & append 구현</p>
        </div>
        <pre className="bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto leading-relaxed">{`class Node {
public:
    int data;
    Node* next;
    Node(int val, Node* nextNode = nullptr)
        : data(val), next(nextNode) {}
};

class LinkedList {
    Node* head;
public:
    LinkedList() : head(nullptr) {}

    // append: 앞에 추가! (= prepend)
    void append(int val) {
        head = new Node(val, head);
    }
};`}</pre>
      </div>
    </div>
  );
}

/* ── Section 2: 소멸자 스텝 플레이어 ── */
function DestructorStepSection() {
  const INITIAL = [1, 2, 3];
  const [step, setStep] = useState(0);
  // step 0: 초기 / step n: n번째 노드 삭제 중 / step 3: 완료

  const stepDescs = [
    { label: 'current = head', current: 0, nextSaved: false, deleted: [] as number[] },
    { label: 'next = current->next 저장\nthen delete current', current: 1, nextSaved: true, deleted: [0] },
    { label: 'next = current->next 저장\nthen delete current', current: 2, nextSaved: true, deleted: [0, 1] },
    { label: 'current = nullptr → 루프 종료', current: -1, nextSaved: false, deleted: [0, 1, 2] },
  ];

  const cur = stepDescs[Math.min(step, stepDescs.length - 1)];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">소멸자 순회 삭제 — step by step</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded px-2 py-1 text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-300 dark:hover:bg-slate-600 transition">
              ◀ 이전
            </button>
            <span className="text-xs text-slate-500 font-mono">{step + 1} / {stepDescs.length}</span>
            <button onClick={() => setStep(s => Math.min(stepDescs.length - 1, s + 1))}
              disabled={step === stepDescs.length - 1}
              className="rounded px-2 py-1 text-xs font-bold bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 transition">
              다음 ▶
            </button>
          </div>
        </div>
        <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
          {/* Node visualization */}
          <div className="overflow-x-auto">
            <div className="flex items-center gap-0 min-w-max">
              {INITIAL.map((val, i) => {
                const isDeleted = cur.deleted.includes(i);
                const isCurrent = cur.current === i;
                return (
                  <div key={i} className="flex items-center">
                    <div className={`relative flex border-2 rounded-lg overflow-hidden transition-all ${
                      isDeleted
                        ? 'border-red-400 bg-red-50 dark:bg-red-950/40 opacity-30'
                        : isCurrent
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                    }`}>
                      {isCurrent && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          current
                        </div>
                      )}
                      <div className={`px-3 py-2 text-sm font-mono font-bold ${
                        isDeleted ? 'text-red-400' : isCurrent ? 'text-emerald-800 dark:text-emerald-200' : 'text-slate-700 dark:text-slate-300'
                      } border-r ${isDeleted ? 'border-red-200 dark:border-red-800' : 'border-slate-200 dark:border-slate-700'}`}>
                        {val}
                      </div>
                      <div className="px-2 py-2 text-xs text-slate-400 font-mono">next</div>
                    </div>
                    {i < INITIAL.length - 1 ? (
                      <span className={`mx-1.5 font-bold ${isDeleted ? 'text-red-300' : 'text-slate-400'}`}>→</span>
                    ) : (
                      <span className="mx-1.5 text-slate-400 font-mono text-sm">→ null</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step description */}
          <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
            <pre className="text-xs font-mono text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{cur.label}</pre>
          </div>

          {cur.nextSaved && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 p-2.5 text-xs text-amber-800 dark:text-amber-200">
              ⚠ <strong>먼저 next 포인터를 저장</strong>한 후 delete — 순서가 바뀌면 다음 노드를 잃음!
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="bg-slate-800 px-4 py-2 border-b border-slate-700">
          <p className="text-xs text-slate-400">소멸자 구현</p>
        </div>
        <pre className="bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto leading-relaxed">{`LinkedList::~LinkedList() {
    Node* current = head;
    while (current) {
        Node* next = current->next;  // ① 다음 노드 저장
        delete current;              // ② 현재 삭제
        current = next;              // ③ 다음으로 이동
    }
}`}</pre>
      </div>
    </div>
  );
}

/* ── Section 3: 재귀 vs 반복 뒤집기 비교 ── */
function ReverseSection() {
  const [mode, setMode] = useState<'recursive' | 'iterative'>('recursive');
  const [listSize, setListSize] = useState(4);
  const [step, setStep] = useState(0);
  const nodes = Array.from({ length: listSize }, (_, i) => i + 1);

  const recursiveSteps = [
    { desc: 'reverseHelper(head=①, prev=null) 호출', state: { active: 0, prev: null as number | null } },
    { desc: 'next=②\n①.next = prev(null)\nreverseHelper(②, ①)', state: { active: 1, prev: 1 } },
    { desc: 'next=③\n②.next = ①\nreverseHelper(③, ②)', state: { active: 2, prev: 2 } },
    { desc: 'next=④\n③.next = ②\nreverseHelper(④, ③)', state: { active: 3, prev: 3 } },
    { desc: '④.next = ③\nreverseHelper(null, ④)\n→ return ④ (새 head)', state: { active: -1, prev: 4 } },
  ];

  const iterativeSteps = [
    { desc: 'prev=null, curr=①', prev: null as number | null, curr: 0, done: false },
    { desc: 'next=②\n①.next=null\nprev=①, curr=②', prev: 1, curr: 1, done: false },
    { desc: 'next=③\n②.next=①\nprev=②, curr=③', prev: 2, curr: 2, done: false },
    { desc: 'next=④\n③.next=②\nprev=③, curr=④', prev: 3, curr: 3, done: false },
    { desc: '④.next=③\nprev=④, curr=null\n→ head=④ (완료)', prev: 4, curr: -1, done: true },
  ];

  const steps = mode === 'recursive' ? recursiveSteps : iterativeSteps;
  const totalSteps = Math.min(listSize + 1, steps.length);
  const cur = steps[Math.min(step, totalSteps - 1)];

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {(['recursive', 'iterative'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setStep(0); }}
            className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition ${
              mode === m ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}>
            {m === 'recursive' ? '재귀 (reverseHelper)' : '반복 (3 포인터)'}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {mode === 'recursive' ? '재귀적 뒤집기' : '반복적 뒤집기'}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded px-2 py-1 text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-300 dark:hover:bg-slate-600 transition">
              ◀
            </button>
            <span className="text-xs text-slate-500 font-mono">{step + 1} / {totalSteps}</span>
            <button onClick={() => setStep(s => Math.min(totalSteps - 1, s + 1))}
              disabled={step === totalSteps - 1}
              className="rounded px-2 py-1 text-xs font-bold bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-500 transition">
              ▶
            </button>
            <button onClick={() => setStep(0)}
              className="rounded px-2 py-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition">
              ↺
            </button>
          </div>
        </div>
        <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
          {/* node row */}
          <div className="overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              {nodes.map((val, i) => (
                <div key={i} className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 text-sm font-mono font-bold transition ${
                  i === step - 1 || (mode === 'recursive' && i === step)
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200'
                    : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                }`}>
                  {val}
                </div>
              ))}
            </div>
          </div>
          {/* step desc */}
          <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
            <pre className="text-xs font-mono text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{cur.desc}</pre>
          </div>
        </div>
      </div>

      {/* Code side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl overflow-hidden border border-purple-200 dark:border-purple-800/40">
          <div className="bg-purple-900 px-4 py-2 border-b border-purple-700">
            <p className="text-xs text-purple-200 font-bold">재귀 (기출)</p>
          </div>
          <pre className="bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto leading-relaxed">{`Node* reverseHelper(
        Node* node, Node* prev) {
    if (!node) return prev;
    Node* next = node->next;
    node->next = prev;
    return reverseHelper(next, node);
}
void reverse() {
    head = reverseHelper(head, nullptr);
}`}</pre>
        </div>
        <div className="rounded-xl overflow-hidden border border-teal-200 dark:border-teal-800/40">
          <div className="bg-teal-900 px-4 py-2 border-b border-teal-700">
            <p className="text-xs text-teal-200 font-bold">반복 (3 포인터)</p>
          </div>
          <pre className="bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto leading-relaxed">{`void reverse_iter() {
    Node* prev = nullptr;
    Node* curr = head;
    while (curr) {
        Node* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    head = prev;
}`}</pre>
        </div>
      </div>
    </div>
  );
}

/* ── Main export ── */
export default function LinkedListImplContent({ topic }: { topic: StudyTopic }) {
  void topic;
  return (
    <div className="max-w-5xl mx-auto space-y-8 px-6 py-6">
      <section id="linked-list-impl-sec-builder">
        <SH icon="🔗" title="append() — 앞 삽입 시뮬레이터" />
        <ConceptBox
          what="append(val)는 이름과 달리 사실 prepend(앞에 삽입)처럼 동작합니다. head = new Node(val, head)에서 새 노드가 기존 head를 next로 가리키고 새 head가 됩니다."
          rules={[
            'head = new Node(val, head): 새 노드 생성, 기존 head가 새 노드의 next가 됨, 새 노드가 head가 됨',
            'append(1) → append(2) → append(3) 결과: 3→2→1→null (마지막 추가가 맨 앞!)',
            '직관과 반대: 호출 순서와 리스트 순서가 반전됨 — 시험에서 자주 출력 결과를 묻는 포인트',
          ]}
        />
        <ListBuilderSection />
      </section>

      <section id="linked-list-impl-sec-dtor">
        <SH icon="🗑️" title="소멸자 — 순회 삭제 step-by-step" />
        <ConceptBox
          what="링크드 리스트의 노드들은 모두 힙에 할당됩니다. 소멸자에서 직접 순회하며 모든 노드를 delete해야 메모리 누수가 없습니다."
          rules={[
            '순서 절대 준수: Node* next = current->next; 저장 먼저 → delete current → current = next',
            'delete current 후 current->next 접근은 해제된 메모리 접근 → Undefined Behavior',
            'while (current)는 current가 nullptr(null)가 될 때까지 반복 — 마지막 노드의 next는 nullptr',
          ]}
          caution="'먼저 next 저장, 그다음 delete' 순서를 절대 바꾸지 마세요! delete 후엔 그 메모리에 접근하면 안 됩니다."
        />
        <DestructorStepSection />
      </section>

      <section id="linked-list-impl-sec-reverse">
        <SH icon="🔄" title="reverse — 재귀 vs 반복 비교" />
        <ConceptBox
          what="리스트 뒤집기는 각 노드의 next 링크 방향을 반대로 바꾸는 작업입니다. 재귀와 반복 두 가지 방법이 있습니다."
          rules={[
            '재귀: reverseHelper(node, prev) — node.next를 prev로 변경 후 재귀. base case: node==null이면 prev가 새 head',
            '반복: 세 포인터(prev=null, curr=head, next) — 매 단계마다 하나씩 방향 전환 후 전진',
            '두 방법의 결과는 동일. 재귀는 직관적이나 깊은 리스트에서 스택 오버플로우 위험 있음',
          ]}
        />
        <ReverseSection />
      </section>
    </div>
  );
}
