import type { StudyTopic } from '@/components/qual-exam/TopicStudyCard';
import type { ExamProblem } from '@/components/qual-exam/ExamProblemCard';
import type { QuizQuestion } from '@/components/qual-exam/PracticeQuiz';

/* ═══════════════════════════════════════════════════
   DSA TOPICS  (자료구조 및 알고리즘)
═══════════════════════════════════════════════════ */
export const DSA_TOPICS: StudyTopic[] = [
  {
    id: 'asymptotic',
    title: '점근 분석',
    titleEn: 'Asymptotic Analysis',
    icon: '📐',
    difficulty: 'intermediate',
    examFrequency: 5,
    keyPoints: [
      'Big-O (O): 점근적 상한 — A ≤ c·f(n) for n ≥ n₀',
      'Big-Omega (Ω): 점근적 하한 — A ≥ c·f(n) for n ≥ n₀',
      'Big-Theta (Θ): 정확한 점근한계 — c₁·f(n) ≤ A ≤ c₂·f(n)',
      'Little-o (o): 엄격한 상한 — lim(A/f(n)) → 0',
      'Little-omega (ω): 엄격한 하한 — lim(f(n)/A) → 0',
      '중요 관계: lg(n!) = Θ(n·lg n), n^k = o(c^n) for any k and c>1',
    ],
    theory: `점근 분석(Asymptotic Analysis)은 입력 크기 n이 커질수록 알고리즘의 성능이 어떻게 변하는지 분석합니다.

■ 핵심 정의
• f(n) = O(g(n))  ⟺  ∃c>0, n₀: f(n) ≤ c·g(n) for all n ≥ n₀
• f(n) = Ω(g(n))  ⟺  ∃c>0, n₀: f(n) ≥ c·g(n) for all n ≥ n₀
• f(n) = Θ(g(n))  ⟺  f(n)=O(g(n)) AND f(n)=Ω(g(n))
• f(n) = o(g(n))  ⟺  lim_{n→∞} f(n)/g(n) = 0
• f(n) = ω(g(n))  ⟺  lim_{n→∞} g(n)/f(n) = 0

■ 성장률 순서 (느린 → 빠른)
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ) < O(n!)

■ 중요 항등식 (시험에 자주 출제!)
• log^k(n) = o(n^ε) for any k≥1, ε>0  (로그는 임의의 다항식보다 작음)
• n^k = o(c^n) for any k and c>1  (다항식은 지수보다 작음)
• 2^n ≠ O(2^(n/2))  ← 2^n / 2^(n/2) = 2^(n/2) → ∞
• lg(n!) = Θ(n·lg n)  ← Stirling: n! ≈ (n/e)^n
• lg(n^n) = n·lg(n) = Θ(n·lg n)  ← 따라서 lg(n!) = Θ(lg(n^n))

■ 2024년 2학기 시험 테이블 답안 요약
A=lg^k(n), B=n^ε: O=T, o=T, Ω=F, ω=F, Θ=F (로그는 다항식보다 느림)
A=n^k, B=c^n: O=T, o=T, Ω=F, ω=F, Θ=F (다항식은 지수보다 느림)
A=2^n, B=2^(n/2): O=F, o=F, Ω=T, ω=T, Θ=F (2^n은 2^(n/2)보다 빠름)
A=lg(n!), B=lg(n^n): O=T, o=F, Ω=T, ω=F, Θ=T (둘 다 Θ(n·lg n))`,
    complexityTable: [
      { operation: 'O(1) 상수', complexity: 'O(1)', note: '배열 인덱싱, 해시맵 평균' },
      { operation: 'O(log n) 로그', complexity: 'O(log n)', note: '이진 탐색, BST 평균' },
      { operation: 'O(n) 선형', complexity: 'O(n)', note: '선형 탐색, 배열 순회' },
      { operation: 'O(n log n)', complexity: 'O(n log n)', note: '합병·힙·퀵(평균) 정렬' },
      { operation: 'O(n²) 이차', complexity: 'O(n²)', note: '버블·선택·삽입 정렬' },
      { operation: 'O(2ⁿ) 지수', complexity: 'O(2ⁿ)', note: '부분집합 열거, 피보나치 재귀' },
    ],
  },
  {
    id: 'sorting',
    title: '정렬 알고리즘',
    titleEn: 'Sorting Algorithms',
    icon: '🔢',
    difficulty: 'intermediate',
    examFrequency: 5,
    keyPoints: [
      'QuickSort: 피벗 기준 분할, 평균 O(n log n), 최악 O(n²), in-place',
      'MergeSort: 분할정복, 항상 O(n log n), NOT in-place (O(n) 추가 공간)',
      'HeapSort: 힙 구조 이용, 항상 O(n log n), in-place',
      'BubbleSort: 인접 교환, O(n²), in-place',
      'QuickSort partition: last element as pivot (CLRS 방식)',
    ],
    theory: `■ QuickSort Partition (2025년 2학기 기출)
partition(A, p, r):
  pivot ← A[r]       // 마지막 원소를 피벗으로
  i ← p - 1         // smaller-than-pivot zone의 경계
  for j = p to r-1:
    if A[j] <= pivot:
      i ← i + 1
      swap A[i] and A[j]   // if i=j, skip swap
  swap A[i+1] and A[r]    // 피벗을 최종 위치로
  return i+1

A=[37,22,81,63,19,97,53,47,73,55], pivot=55
step1: i=3, j=5 → A=[37,22,19,63,81,97,53,47,73,55] (i=2,j=3일 때 37<55→swap)
... (trace table로 실제 단계 추적)

■ 정렬 비교표`,
    complexityTable: [
      { operation: 'QuickSort 평균', complexity: 'O(n log n)', note: '제자리 정렬(in-place)' },
      { operation: 'QuickSort 최악', complexity: 'O(n²)', note: '이미 정렬된 경우' },
      { operation: 'MergeSort', complexity: 'O(n log n)', note: '안정 정렬, O(n) 추가 공간' },
      { operation: 'HeapSort', complexity: 'O(n log n)', note: '제자리, 불안정 정렬' },
      { operation: 'BubbleSort', complexity: 'O(n²)', note: '안정 정렬' },
      { operation: 'InsertionSort', complexity: 'O(n²) / O(n)', note: '거의 정렬된 경우 O(n)' },
    ],
    visualizerType: 'quicksort',
    commonPitfalls: [
      'MergeSort는 in-place가 아님 (O(n) 추가 공간 필요)',
      'QuickSort가 항상 빠른 것은 아님 — 피벗 선택이 핵심',
      'partition 인덱스가 1-based vs 0-based 혼동 주의',
    ],
  },
  {
    id: 'heap',
    title: '힙 (Heap)',
    titleEn: 'Binary Heap',
    icon: '🌳',
    difficulty: 'intermediate',
    examFrequency: 5,
    keyPoints: [
      'Min-Heap: 부모 ≤ 자식, 루트가 최솟값',
      'Max-Heap: 부모 ≥ 자식, 루트가 최댓값',
      '삽입: 마지막에 추가 후 sift-up → O(log n)',
      '최솟값 추출: 루트 제거, 마지막 노드를 루트로 이동 후 sift-down → O(log n)',
      '배열로 표현: i의 부모=(i-1)/2, 좌자식=2i+1, 우자식=2i+2 (0-indexed)',
    ],
    theory: `■ 이진 힙 기본
완전 이진 트리(Complete Binary Tree)이며 힙 속성을 만족합니다.

배열 표현 (0-indexed):
• 노드 i의 부모: ⌊(i-1)/2⌋
• 왼쪽 자식: 2i + 1
• 오른쪽 자식: 2i + 2

■ 삽입 (Insert)
1. 배열 끝에 추가
2. sift-up: 부모와 비교하며 올라감
   while i > 0 and heap[i] < heap[parent(i)]:
     swap(heap[i], heap[parent(i)])
     i = parent(i)

■ 최솟값 추출 (Extract-Min)
1. 루트(최솟값) 저장
2. 마지막 원소를 루트로 이동
3. sift-down: 자식과 비교하며 내려감

■ 2024년 2학기 기출: Insert 11,9,12,14,3,15,7,8,1
초기: []
삽입 11: [11]
삽입 9:  [9, 11]   (sift-up: 9<11 → swap)
삽입 12: [9, 11, 12]
삽입 14: [9, 11, 12, 14]
삽입 3:  [3, 9, 12, 14, 11] (sift-up: 3<11→swap, 3<9→swap)
삽입 15: [3, 9, 12, 14, 11, 15]
삽입 7:  [3, 9, 7, 14, 11, 15, 12] (sift-up: 7<12→swap)
삽입 8:  [3, 9, 7, 8, 11, 15, 12, 14] (sift-up: 8<14→swap)
삽입 1:  [1, 3, 7, 8, 9, 15, 12, 14, 11] (1<8→swap, 1<3→swap)

Extract-min (1회): 루트=1 저장, 11을 루트로, sift-down
→ [3, 8, 7, 11, 9, 15, 12, 14]`,
    complexityTable: [
      { operation: '삽입', complexity: 'O(log n)', note: 'sift-up' },
      { operation: '최솟값/최댓값 추출', complexity: 'O(log n)', note: 'sift-down' },
      { operation: '최솟값/최댓값 조회', complexity: 'O(1)', note: '루트 접근' },
      { operation: 'Heapify (배열→힙)', complexity: 'O(n)', note: '아래서부터 sift-down' },
      { operation: 'HeapSort', complexity: 'O(n log n)', note: 'Heapify + n회 extract' },
    ],
    visualizerType: 'minheap',
  },
  {
    id: 'bst',
    title: 'BST & 균형 트리',
    titleEn: 'Binary Search Tree & Balanced Trees',
    icon: '🌲',
    difficulty: 'intermediate',
    examFrequency: 4,
    keyPoints: [
      'BST 속성: left < parent < right',
      'BFS로 BST를 순회하면 레벨 순서를 얻음',
      'BST의 BFS 순서가 주어지면 루트부터 재구성 가능',
      'Red-Black Tree: 루트는 항상 검정(Black)',
      'MST는 유일하지 않을 수 있음 (같은 가중치 간선이 있을 경우)',
    ],
    theory: `■ BST (이진 탐색 트리)
왼쪽 서브트리의 모든 키 < 노드 키 < 오른쪽 서브트리의 모든 키

순회:
• 전위(Preorder): root → left → right
• 중위(Inorder): left → root → right  ← BST에서 오름차순 출력
• 후위(Postorder): left → right → root
• BFS (레벨순서): 큐(Queue) 사용

■ 2025년 1학기 기출: BFS 순서로 BST 재구성
BFS 순서: 30, 20, 40, 10, 35, 42, 37, 50, 36
• 루트: 30 (첫 번째 원소)
• 30의 왼쪽: 20, 오른쪽: 40 (레벨 2)
• 20의 왼쪽: 10, 오른쪽: 35? → BST 속성 위반! 35>30이므로 40의 왼쪽
재구성: 30의 자식 = 20(좌), 40(우)
  20의 자식 = 10(좌), 35(우)?  → 35>30 이므로 40의 왼쪽
  실제: 20→left=10, 40→left=35, 40→right=42
  35→left=?, 42→right=50
  37: 35 < 37 < 40 → 35의 오른쪽
  36: 35 < 36 < 37 → 37의 왼쪽

■ Red-Black Tree 속성
1. 모든 노드는 Red 또는 Black
2. 루트는 Black ← 자주 출제!
3. 모든 리프(NIL)는 Black
4. Red 노드의 자식은 항상 Black (Red 연속 불가)
5. 임의의 노드에서 리프까지 경로의 Black 노드 수는 동일`,
    complexityTable: [
      { operation: '검색 (평균)', complexity: 'O(log n)', note: '균형 잡힌 트리' },
      { operation: '검색 (최악)', complexity: 'O(n)', note: '불균형 (선형 체인)' },
      { operation: '삽입/삭제 (평균)', complexity: 'O(log n)', note: '' },
      { operation: 'Red-Black Tree', complexity: 'O(log n)', note: '항상 균형 보장' },
      { operation: 'AVL Tree', complexity: 'O(log n)', note: '더 엄격한 균형' },
    ],
    visualizerType: 'bst',
  },
  {
    id: 'graph',
    title: '그래프 알고리즘',
    titleEn: 'Graph Algorithms',
    icon: '🕸️',
    difficulty: 'advanced',
    examFrequency: 5,
    keyPoints: [
      'Dijkstra: 음수 간선 불가, O((V+E) log V) with min-heap',
      'BFS: 최단 경로(가중치 없음), 큐 사용',
      'DFS: 스택(재귀), 위상 정렬, SCC 탐지',
      'Prim: MST, 그리디, O(E log V)',
      'Kruskal: MST, Union-Find, 간선 정렬 기준',
    ],
    theory: `■ Dijkstra 알고리즘
음수 가중치가 없는 그래프에서 단일 출발점 최단 경로

1. 시작 노드 거리 = 0, 나머지 = ∞
2. 미방문 노드 중 거리가 가장 작은 노드 u 선택
3. u의 인접 노드 v에 대해: dist[v] = min(dist[v], dist[u] + w(u,v))
4. u를 방문 처리
5. 모든 노드 방문까지 반복

■ 2024년 2학기 기출 (그래프: A,B,C,D,E,F,G)
간선: A-B=4, A-G=1, A-F=5, B-C=3, G-C=9, G-F=7, G-E=12, C-D=2, D-E=1
시작: D (dist[D]=0)

방문 순서: D(0) → C(2) → B(5) → E(3) → A(9) → G(10) → F(14)
D→C: 2, D→E: 1+2=? 실제: D-E=1, D-C=2

정답 (D 기준):
D→D: 0, D→C: 2, D→E: 1, D→B: 5, D→A: 9, D→G: 10, D→F: 14

■ Prim's MST (2025년 2학기 기출)
Star graph (N vertices, 1 center):
  항상 center에서 나가는 간선만 선택 → N-1번의 relaxation

Path graph (N vertices, 선형):
  시작 노드가 어디냐에 따라 다름
  임의의 노드에서 시작 → 양쪽으로 확장
  총 relaxation 수 = N-1 (모든 노드를 하나씩 추가)`,
    complexityTable: [
      { operation: 'BFS / DFS', complexity: 'O(V + E)', note: '인접 리스트 기준' },
      { operation: 'Dijkstra (min-heap)', complexity: 'O((V+E) log V)', note: '음수 간선 불가' },
      { operation: 'Bellman-Ford', complexity: 'O(VE)', note: '음수 간선 가능' },
      { operation: 'Prim (min-heap)', complexity: 'O(E log V)', note: 'MST' },
      { operation: 'Kruskal', complexity: 'O(E log E)', note: 'MST, Union-Find' },
      { operation: 'Floyd-Warshall', complexity: 'O(V³)', note: '전쌍 최단 경로' },
    ],
    visualizerType: 'dijkstra',
    commonPitfalls: [
      'Dijkstra는 음수 가중치 간선에서 잘못된 결과를 냄',
      'MST는 가중치가 모두 다르면 유일하지만, 같은 가중치가 있으면 유일하지 않을 수 있음',
      'Prim과 Kruskal 모두 MST를 구하지만 접근 방식이 다름',
    ],
  },
  {
    id: 'dp',
    title: '동적 프로그래밍',
    titleEn: 'Dynamic Programming',
    icon: '🧩',
    difficulty: 'advanced',
    examFrequency: 4,
    keyPoints: [
      'DP 조건: 최적 부분구조(Optimal Substructure) + 중복 부분문제(Overlapping Subproblems)',
      'LCS(Longest Common Subsequence): dp[i][j] 정의로 O(|X|·|Y|)',
      'Greedy vs DP: Greedy는 항상 최적 해를 보장하지 않음',
      '재귀 관계식(Recurrence Relation) 정의가 핵심',
    ],
    theory: `■ LCS (Longest Common Subsequence) — 2025년 2학기 기출

정의: X와 Y에서 같은 상대적 순서로 나타나는 가장 긴 공통 부분 수열

DP 정의: dp[i][j] = X의 앞 i글자와 Y의 앞 j글자의 LCS 길이

재귀 관계:
• 기저 조건: dp[i][0] = 0, dp[0][j] = 0
• X[i] = Y[j]: dp[i][j] = dp[i-1][j-1] + 1
• X[i] ≠ Y[j]: dp[i][j] = max(dp[i-1][j], dp[i][j-1])

시간 복잡도: O(|X| · |Y|)

예시: X="ACDBE", Y="ABCDE"
실제 LCS = "ACDE" 또는 "ABDE" (길이 4)

Greedy 알고리즘 (시험 내용):
X="ACDBE", Y="ABCDE"를 왼쪽부터 동시에 스캔
A=A → 추가: "A", 다음 X="CDBE", Y="BCDE"
C≠B → 스킵, X="DBE", Y="CDE"
D≠C → 스킵, X="BE", Y="DE"
B≠D → 스킵, X="E", Y="E"
E=E → 추가: "AE" (길이 2)
Greedy 결과: "AE" (최적이 아님!)

■ 기타 DP 예시
• Fibonacci: F(n) = F(n-1) + F(n-2)
• 0-1 Knapsack: dp[i][w] = max(dp[i-1][w], dp[i-1][w-wi]+vi)
• Edit Distance: 문자열 변환 최소 연산 수`,
    complexityTable: [
      { operation: 'LCS', complexity: 'O(|X|·|Y|)', note: '공간도 O(|X|·|Y|)' },
      { operation: 'Fibonacci (DP)', complexity: 'O(n)', note: 'vs 재귀 O(2ⁿ)' },
      { operation: 'Knapsack (0-1)', complexity: 'O(nW)', note: 'n=아이템수, W=용량' },
      { operation: 'Matrix Chain', complexity: 'O(n³)', note: '행렬 곱셈 최적화' },
    ],
    commonPitfalls: [
      'Greedy가 항상 최적해를 주지 않음 (LCS, Knapsack 등)',
      'dp 배열의 인덱싱 실수 (0-based vs 1-based)',
      '기저 조건(base case)을 빠뜨리는 실수',
    ],
  },
  {
    id: 'linked-list',
    title: '연결 리스트 & 배열',
    titleEn: 'Linked List & Array',
    icon: '🔗',
    difficulty: 'basic',
    examFrequency: 4,
    keyPoints: [
      '단방향 연결 리스트: 앞 삽입 O(1), 임의 위치 삽입 O(n)',
      '양방향 연결 리스트: tail 유지 시 끝 삽입 O(1)',
      '배열: 임의 접근 O(1), 중간 삽입 O(n) (shift 필요)',
      '배열이 꽉 찰 때 끝 삽입: O(n) (resize + copy)',
    ],
    theory: `■ 2025년 1학기 기출: Insert 시간 복잡도

C1: array.insert(idx=array.length(), "a")  // 배열 끝 삽입
• 배열이 꽉 차지 않음: O(1) (그냥 추가)
• 배열이 꽉 찼을 수 있음: O(n) (resize 필요, 전체 복사)

C2: array.insert(idx=x, "b")  // 임의 위치 삽입
• 배열이 꽉 차지 않음: O(n) (idx 이후 원소를 뒤로 shift)
• 배열이 꽉 찼을 수 있음: O(n) (동일, resize 포함)

C3: list.insert(idx=list.length(), "c")  // 연결 리스트 끝 삽입
• 단방향 연결 리스트 (tail 없음): O(n) (끝까지 순회 필요)
• 단방향 연결 리스트 (tail 있음): O(1)
• 양방향 연결 리스트 (tail 있음): O(1)

■ Stack vs Queue
Stack (LIFO):
• push: 맨 위에 추가
• pop: 맨 위에서 제거
• peek: 맨 위 조회
• isEmpty: 빈 여부 확인

Queue (FIFO):
• enqueue: 뒤에 추가
• dequeue: 앞에서 제거

중요: 스택은 LIFO만 지원 (FIFO 지원 X)`,
    complexityTable: [
      { operation: '배열 임의 접근', complexity: 'O(1)', note: '' },
      { operation: '배열 끝 삽입 (여유 있음)', complexity: 'O(1)', note: '' },
      { operation: '배열 끝 삽입 (꽉 참)', complexity: 'O(n)', note: 'resize' },
      { operation: '배열 임의 삽입', complexity: 'O(n)', note: 'shift' },
      { operation: '단방향 LL 앞 삽입', complexity: 'O(1)', note: '' },
      { operation: '단방향 LL 끝 삽입 (tail 없음)', complexity: 'O(n)', note: '순회' },
      { operation: '단방향 LL 끝 삽입 (tail 있음)', complexity: 'O(1)', note: '' },
    ],
  },
  {
    id: 'huffman',
    title: '허프만 코딩',
    titleEn: 'Huffman Coding',
    icon: '🗜️',
    difficulty: 'advanced',
    examFrequency: 3,
    keyPoints: [
      '탐욕 알고리즘(Greedy)을 이용한 최적 접두사 코드(prefix-free code)',
      'ABL(Average Bits per Letter) 최소화가 목표',
      '빈도수가 높을수록 짧은 코드 할당',
      '허프만 트리: 빈도 최소인 두 노드를 반복적으로 합침',
    ],
    theory: `■ 허프만 코딩 (2024년 1학기 기출)

ABL(Average Bits per Letter) = Σ fₓ · |c(x)| / Σ fₓ
where fₓ = frequency, |c(x)| = code length

■ 빌드 과정:
1. 각 문자를 노드로 만들어 min-heap에 삽입 (key = 빈도)
2. 빈도 최소인 두 노드를 꺼내 합침 (합계 = 두 빈도의 합)
3. 합쳐진 노드를 다시 heap에 삽입
4. 노드가 1개 남을 때까지 반복

■ 예시: {a:11, b:10, c:4, d:17, e:13, f:45}
힙: c(4), b(10), a(11), e(13), d(17), f(45)

단계1: c(4)+b(10) → cb(14)
힙: a(11), cb(14), e(13), d(17), f(45)

단계2: a(11)+e(13) → ae(24)
힙: cb(14), d(17), ae(24), f(45)

단계3: cb(14)+d(17) → cbd(31)
힙: ae(24), cbd(31), f(45)

단계4: ae(24)+cbd(31) → aecbd(55)
힙: f(45), aecbd(55)

단계5: f(45)+aecbd(55) = 100
결과 트리:
  f: 0 (1비트)
  a,e,c,b,d: 1+... (더 긴 코드)

최종 코드 (예시): f=0, a=100, e=101, c=110, b=111, d는 4비트

■ 고정 길이 코드와 비교
n개의 문자 → ⌈log₂ n⌉ 비트 필요
6개 문자 → ⌈log₂ 6⌉ = 3비트`,
    complexityTable: [
      { operation: '허프만 트리 빌드', complexity: 'O(n log n)', note: 'min-heap 사용' },
      { operation: 'ABL 계산', complexity: 'O(n)', note: '' },
    ],
  },
  {
    id: 'hash',
    title: '해시 테이블',
    titleEn: 'Hash Table',
    icon: '#️⃣',
    difficulty: 'basic',
    examFrequency: 2,
    keyPoints: [
      '완전 해시 함수(Perfect Hash): 충돌 없음 — 모든 키가 서로 다른 인덱스로 매핑',
      '충돌 해결: 체이닝(Chaining), 오픈 어드레싱(Linear/Quadratic Probing)',
      '평균 O(1) 탐색, 최악 O(n)',
      'Load factor = n/m (n: 항목수, m: 버킷수)',
    ],
    theory: `■ 해시 테이블 핵심

해시 함수: key → index (0 ~ m-1)

■ 충돌 해결 방법
1. 체이닝 (Chaining): 같은 인덱스에 여러 원소를 연결 리스트로 저장
2. 오픈 어드레싱: 다른 빈 슬롯을 찾아 저장
   - 선형 프로빙: h(k), h(k)+1, h(k)+2, ...
   - 이차 프로빙: h(k), h(k)+1², h(k)+2², ...
   - 이중 해싱: h1(k) + i·h2(k)

■ 완전 해시 (Perfect Hash)
- 모든 키에 대해 충돌이 없음
- 정적 데이터셋에만 구성 가능
- 조건: 서로 다른 모든 키가 서로 다른 인덱스로 매핑됨`,
    complexityTable: [
      { operation: '검색 (평균)', complexity: 'O(1)', note: '' },
      { operation: '검색 (최악)', complexity: 'O(n)', note: '모든 키가 같은 버킷' },
      { operation: '삽입/삭제', complexity: 'O(1) 평균', note: '' },
    ],
  },
];

/* ═══════════════════════════════════════════════════
   DSA EXAM PROBLEMS (기출문제)
═══════════════════════════════════════════════════ */
export const DSA_EXAM_PROBLEMS: ExamProblem[] = [
  {
    id: 'dsa-2024-2-1',
    year: '2024',
    semester: '2',
    subject: 'dsa',
    problemNumber: 1,
    totalPoints: 40,
    category: '점근 분석',
    title: '점근 표기법 T/F 테이블 채우기',
    description: `For each pair of expressions (A, B) in the table below, where A is O, o, Ω, ω, or Θ of B (e.g., A = O(B)), each empty cell (from a-1 to d-5) represents the asymptotic relationship between A and B.

Assuming k ≥ 1, ε > 0, and c > 1 are constants, fill all the 20 empty cells with either "T" or "F". For example, (a-1) is "T" if lg^k(n) = O(n^ε) is true, "F" otherwise.`,
    subQuestions: [
      {
        label: 'a',
        points: 10,
        text: '(a) A = lg^k(n), B = n^ε (k≥1, ε>0 상수)\n각 관계에 대해 T/F를 채우시오: O, o, Ω, ω, Θ',
        answer: `O=T, o=T, Ω=F, ω=F, Θ=F

해설: lg^k(n)은 n^ε보다 점근적으로 느리게 증가합니다.
lim_{n→∞} lg^k(n) / n^ε = 0 이므로 little-o 관계가 성립합니다.
따라서 O (상한)도 T, Ω (하한)은 F, Θ도 F입니다.`
      },
      {
        label: 'b',
        points: 10,
        text: '(b) A = n^k, B = c^n (k≥1, c>1 상수)\n각 관계에 대해 T/F를 채우시오: O, o, Ω, ω, Θ',
        answer: `O=T, o=T, Ω=F, ω=F, Θ=F

해설: 다항식 n^k는 지수 c^n보다 점근적으로 느리게 증가합니다.
lim_{n→∞} n^k / c^n = 0 (L'Hôpital 반복 적용)
따라서 little-o 관계 성립 → O=T, o=T, Ω=F, ω=F, Θ=F`
      },
      {
        label: 'c',
        points: 10,
        text: '(c) A = 2^n, B = 2^(n/2)\n각 관계에 대해 T/F를 채우시오: O, o, Ω, ω, Θ',
        answer: `O=F, o=F, Ω=T, ω=T, Θ=F

해설: 2^n / 2^(n/2) = 2^(n - n/2) = 2^(n/2) → ∞
따라서 A = 2^n은 B = 2^(n/2)보다 훨씬 빠르게 증가합니다.
Ω (하한) = T, ω (엄격한 하한) = T
O = F (상한이 될 수 없음), Θ = F`
      },
      {
        label: 'd',
        points: 10,
        text: '(d) A = lg(n!), B = lg(n^n)\n각 관계에 대해 T/F를 채우시오: O, o, Ω, ω, Θ',
        answer: `O=T, o=F, Ω=T, ω=F, Θ=T

해설: Stirling 공식: n! ≈ (n/e)^n
lg(n!) ≈ n·lg(n) - n·lg(e) = Θ(n·lg n)
lg(n^n) = n·lg(n) = Θ(n·lg n)
따라서 둘은 Θ 관계: O=T, Ω=T, Θ=T, o=F, ω=F`
      },
    ],
    tags: ['점근분석', 'Big-O', 'Big-Omega', 'Big-Theta', 'little-o', '로그', '지수'],
    hint: '핵심: 로그 < 다항식 < 지수 성장률 순서를 기억하세요. lim 계산으로 확인!',
  },
  {
    id: 'dsa-2024-2-2',
    year: '2024',
    semester: '2',
    subject: 'dsa',
    problemNumber: 2,
    totalPoints: 30,
    category: '그래프 알고리즘',
    title: 'Dijkstra 최단 경로 알고리즘',
    description: `You want to find the shortest path for the given graph using Dijkstra's algorithm.

Graph vertices: A, B, C, D, E, F, G
Edges (undirected): A-B=4, A-G=1, A-F=5, B-C=3, G-C=9, G-F=7, G-E=12, C-D=2, D-E=1`,
    subQuestions: [
      {
        label: 'a',
        points: 15,
        text: '(a) vertex D에서 출발하여 모든 다른 정점까지의 최단 경로를 계산할 때, 정점 방문 순서를 나열하시오.',
        answer: `방문 순서: D → E → C → B → A → G → F

상세:
초기: D=0, 나머지=∞
1단계: D 방문 (dist=0) → C=2, E=1 갱신
2단계: E 방문 (dist=1) → G=13 갱신
3단계: C 방문 (dist=2) → B=5, G=11 갱신
4단계: B 방문 (dist=5) → A=9 갱신
5단계: A 방문 (dist=9) → G=10, F=14 갱신
6단계: G 방문 (dist=10) → F=17? (이미 14가 더 작음)
7단계: F 방문 (dist=14)`,
      },
      {
        label: 'b',
        points: 15,
        text: '(b) vertex D에서 출발하는 모든 최단 경로와 각 비용을 구하시오.\n형식: (V_D - V_1 - ... - V_k, "cost")',
        answer: `(D, "0")
(D - E, "1")
(D - C, "2")
(D - C - B, "5")
(D - C - B - A, "9")
(D - C - B - A - G, "10")
(D - C - B - A - F, "14")

주요 경로:
• D→C: D-C (cost=2)
• D→E: D-E (cost=1)  ← D-E 직접 연결!
• D→B: D-C-B (cost=5)
• D→A: D-C-B-A (cost=9)
• D→G: D-C-B-A-G (cost=10)
• D→F: D-C-B-A-F (cost=14)`,
      },
    ],
    tags: ['Dijkstra', '최단경로', '그래프', '우선순위큐'],
    hint: 'D의 인접 노드를 확인하세요. D-C=2, D-E=1이 직접 연결됩니다.',
  },
  {
    id: 'dsa-2024-2-3',
    year: '2024',
    semester: '2',
    subject: 'dsa',
    problemNumber: 3,
    totalPoints: 30,
    category: '힙',
    title: 'Binary Min Heap 삽입과 추출',
    description: `Answer the following questions related to the binary min heap.`,
    subQuestions: [
      {
        label: 'a',
        points: 10,
        text: '(a) 빈 힙에서 시작하여 11, 9, 12, 14, 3, 15, 7, 8, 1을 순서대로 삽입한 후의 이진 최소 힙을 그리시오.',
        answer: `최종 Min-Heap:
배열 표현: [1, 3, 7, 8, 9, 15, 12, 14, 11]

트리 구조:
         1
       /   \\
      3     7
     / \\   / \\
    8   9 15  12
   / \\
  14  11

삽입 과정:
[11] → [9,11] → [9,11,12] → [9,11,12,14] → [3,9,12,14,11]
→ [3,9,12,14,11,15] → [3,9,7,14,11,15,12] → [3,9,7,8,11,15,12,14]
→ [1,3,7,8,9,15,12,14,11] (1 삽입 후 sift-up)`,
      },
      {
        label: 'b',
        points: 10,
        text: '(b) (a)의 답에서 최솟값 원소를 추출(extract)한 후의 이진 최소 힙을 그리시오.',
        answer: `최솟값 1 추출:
1. 루트(1)를 제거하고 저장
2. 마지막 원소(11)를 루트로 이동
3. Sift-down 실행: 11과 자식(3, 7) 비교 → min=3 → swap
4. 11과 자식(8, 9) 비교 → min=8 → swap

최종 배열: [3, 8, 7, 11, 9, 15, 12, 14]

트리:
         3
       /   \\
      8     7
     / \\   / \\
    11   9 15  12
   /
  14`,
      },
      {
        label: 'c',
        points: 10,
        text: '(c) (b)의 답에서 다시 최솟값 원소를 추출한 후의 이진 최소 힙을 그리시오.',
        answer: `최솟값 3 추출:
1. 루트(3)를 제거
2. 마지막 원소(14)를 루트로 이동
3. Sift-down: 14와 자식(8, 7) 비교 → min=7 → swap
4. 14와 자식(15, 12) 비교 → min=12 → swap

최종 배열: [7, 8, 12, 11, 9, 15, 14]

트리:
         7
       /   \\
      8     12
     / \\   /
    11   9 15`,
      },
    ],
    tags: ['MinHeap', '힙', '삽입', 'Extract-Min', 'sift-up', 'sift-down'],
  },
  {
    id: 'dsa-2025-1-1',
    year: '2025',
    semester: '1',
    subject: 'dsa',
    problemNumber: 1,
    totalPoints: 40,
    category: '복잡도',
    title: 'True or False — 자료구조·알고리즘 기본 개념',
    description: `For each statement below, write True or False. You do not need to justify your answers.`,
    subQuestions: [
      { label: 'a', points: 5, text: 'If the implementation A\'s algorithm has a time complexity of O(n²) and the implementation B\'s algorithm has O(n³), the runtime of A is always faster than that of B for all input sizes.', answer: 'FALSE\n\n해설: 점근적 표기법은 충분히 큰 n에 대한 상한이므로, 작은 n에서는 O(n³) 알고리즘이 더 빠를 수 있습니다. 상수 계수를 무시하기 때문에 실제 런타임은 다를 수 있습니다.' },
      { label: 'b', points: 5, text: 'A stack supports both LIFO (Last-In-First-Out) and FIFO (First-In-First-Out) operations.', answer: 'FALSE\n\n해설: 스택은 LIFO만 지원합니다. FIFO는 큐(Queue)의 특성입니다. 스택에서 push/pop은 항상 맨 위에서만 이루어집니다.' },
      { label: 'c', points: 5, text: 'Inserting an element at the front of a singly linked list always takes O(1) time.', answer: 'TRUE\n\n해설: 단방향 연결 리스트에서 앞 삽입은 새 노드를 만들고 head를 업데이트하기만 하면 됩니다. 리스트 길이에 무관하게 O(1)입니다.' },
      { label: 'd', points: 5, text: 'Dijkstra\'s algorithm can handle graphs with negative weight edges without any modifications.', answer: 'FALSE\n\n해설: Dijkstra는 음수 가중치 간선에서 올바르지 않은 결과를 낼 수 있습니다. 음수 간선이 있을 때는 Bellman-Ford 알고리즘을 사용해야 합니다.' },
      { label: 'e', points: 5, text: 'The QuickSort algorithm is an in-place sorting algorithm, while MergeSort is not.', answer: 'TRUE\n\n해설: QuickSort는 추가 배열 없이 제자리에서 정렬합니다 (O(log n) 재귀 스택만 사용). MergeSort는 합병 시 O(n) 추가 공간이 필요합니다.' },
      { label: 'f', points: 5, text: 'A perfect hash function ensures that no two keys map to the same index in the hash table.', answer: 'TRUE\n\n해설: 완전 해시 함수(Perfect Hash Function)는 정의상 충돌(collision)이 없습니다. 모든 서로 다른 키는 서로 다른 버킷에 매핑됩니다.' },
      { label: 'g', points: 5, text: 'In a Red-Black Tree, the root node must always be black.', answer: 'TRUE\n\n해설: Red-Black Tree의 성질 중 하나: 루트는 항상 검정(Black)입니다. Red 노드가 루트가 되면 Black으로 색상을 변경합니다.' },
      { label: 'h', points: 5, text: 'A minimum spanning tree (MST) of a graph is always unique.', answer: 'FALSE\n\n해설: MST는 모든 간선의 가중치가 서로 다를 때만 유일합니다. 같은 가중치의 간선이 여러 개 있으면 MST가 여러 개일 수 있습니다.' },
    ],
    tags: ['T/F', 'Stack', 'LinkedList', 'Dijkstra', 'QuickSort', 'MergeSort', 'Hash', 'RedBlackTree', 'MST'],
  },
  {
    id: 'dsa-2025-1-2',
    year: '2025',
    semester: '1',
    subject: 'dsa',
    problemNumber: 2,
    totalPoints: 30,
    category: 'BST',
    title: 'BST + BFS 순회로 트리 재구성',
    description: `Consider a scenario where you are given a binary search tree (BST). If you traverse this BST using breadth-first search (BFS), the nodes are visited in the following order:

30, 20, 40, 10, 35, 42, 37, 50, 36

Based on such visit orders, reconstruct the BST.`,
    subQuestions: [
      { label: 'a', points: 5, text: '(5 pts) Identify the root node of the BST', answer: '루트: 30\n\nBFS의 첫 번째 방문 노드가 루트입니다.' },
      { label: 'b', points: 5, text: '(5 pts) Identify the left and right children of the root node accordingly.', answer: '30의 왼쪽 자식: 20, 오른쪽 자식: 40\n\nBFS 순서에서 루트 다음에 오는 두 노드가 루트의 왼쪽/오른쪽 자식입니다.\n20 < 30 이므로 왼쪽, 40 > 30 이므로 오른쪽.' },
      {
        label: 'c', points: 10, text: '(10pts) Draw the complete layout of the BST.',
        answer: `전체 BST 구조:

         30
       /    \\
     20      40
    /       /  \\
   10      35   42
             \\    \\
             37   50
            /
           36

재구성 과정:
- BFS 레벨 1: 30 (루트)
- BFS 레벨 2: 20(좌), 40(우)
- BFS 레벨 3: 10(<20, 20의 좌), 35(<40, 40의 좌), 42(>40, 40의 우)
- BFS 레벨 4: 37(35<37<40, 35의 우), 50(>42, 42의 우)
- BFS 레벨 5: 36(35<36<37, 37의 좌)` },
    ],
    tags: ['BST', 'BFS', '트리재구성', '레벨순회'],
  },
  {
    id: 'dsa-2025-1-3',
    year: '2025',
    semester: '1',
    subject: 'dsa',
    problemNumber: 3,
    totalPoints: 30,
    category: '복잡도',
    title: 'Array/List 삽입 시간 복잡도 분석',
    description: `Consider the following code, where "array" is a standard (i.e., one-ended) array, and "list" is a singly or doubly linked list. Both array and list implement the insert method, which inserts the value at the position "idx" into either array or list, respectively.

Three possible insert calls:
• C1: array.insert(idx=array.length(), value="a")  // 배열 끝에 삽입
• C2: array.insert(idx=x, value="b")               // 임의 위치에 삽입 (x는 모름)
• C3: list.insert(idx=list.length(), value="c")    // 리스트 끝에 삽입

Note 1: use the big-O notation.
Note 2: 'list' maintains head and tail pointers.`,
    subQuestions: [
      { label: 'a', points: 5, text: '(a) What is the worst-case runtime of C1 above if we assume that the underlying array is not full?', answer: 'O(1)\n\n해설: 배열이 꽉 차지 않았다면, 끝에 삽입은 그냥 새 위치에 값을 쓰면 됩니다. shift 필요 없음.' },
      { label: 'b', points: 5, text: '(b) How does your answer in (a) change if we cannot assume that the underlying array is not full?', answer: 'O(n)\n\n해설: 배열이 꽉 찼을 수 있다면, resize(새 배열 할당 + 전체 복사)가 필요하므로 O(n)이 됩니다.' },
      { label: 'c', points: 5, text: '(c) What is the worst-case runtime of C2 above if we assume that the underlying array is not full?', answer: 'O(n)\n\n해설: 임의 위치 삽입은 해당 위치 이후의 모든 원소를 한 칸씩 오른쪽으로 shift해야 합니다. 최악의 경우 idx=0이면 n개를 shift → O(n).' },
      { label: 'd', points: 5, text: '(d) How does your answer in (c) change if we cannot assume that the underlying array is not full?', answer: 'O(n)\n\n해설: 꽉 찼더라도 shift 자체가 O(n)이므로 복잡도는 동일합니다 (resize도 O(n)이지만 이미 shift가 O(n)).' },
      { label: 'e', points: 5, text: '(e) What is the worst-case runtime of C3 above if the list is a singly linked list?', answer: 'O(1)\n\n해설: list가 tail pointer를 유지한다면(Note 2), 끝 삽입은 tail.next = new node, tail = new node로 O(1)입니다.\n\n만약 tail pointer가 없다면 O(n)이지만, Note 2에서 head and tail pointers를 유지한다고 명시.' },
      { label: 'f', points: 5, text: '(f) What is the worst-case runtime of C3 above if the list is a doubly linked list?', answer: 'O(1)\n\n해설: 양방향 연결 리스트도 tail pointer를 유지하므로 끝 삽입은 O(1)입니다.' },
    ],
    tags: ['배열', '연결리스트', '시간복잡도', '삽입', '복잡도분석'],
  },
  {
    id: 'dsa-2025-2-1',
    year: '2025',
    semester: '2',
    subject: 'dsa',
    problemNumber: 1,
    totalPoints: 50,
    category: '정렬',
    title: 'QuickSort Partition 추적 테이블',
    description: `The following pseudocode defines the partition function used in Quicksort. It assumes that the last element A[r] is chosen as the pivot. (List index starts from 1. A[0] will return -inf)

partition(A, p, r):
1:  pivot ← A[r]           // rename A[r] as pivot for clarity
2:  i ← p - 1              // boundary of (max index of) smaller-than-pivot zone
3:  for j = p to r - 1 do  // for loop includes "r-1"
4:    if A[j] <= pivot then
5:      i ← i + 1
6:      swap A[i] and A[j]  // if i=j, skip swap.
7:  swap A[i + 1] and A[r]  // place pivot in final position
8:  return i + 1            // pivot index

Given array: A = [37, 22, 81, 63, 19, 97, 53, 47, 73, 55]
Call: partition(A, p=1, r=10), pivot = A[10] = 55`,
    subQuestions: [
      {
        label: 'a',
        points: 40,
        text: '(a) Fill the trace table showing indices i and j as well as the array contents after each swap (skip if i=j).\n\nGiven: Step 1 → i=3, j=5, Array=[37, 22, 19, 63, 81, 97, 53, 47, 73, 55]\nFind (A), (B), (C), (D), (E)',
        answer: `Step 1: j=3→A[3]=81>55, j=4→A[4]=63>55... wait
피벗=55, 초기 i=0

실제 추적:
i=0, j=1: A[1]=37≤55 → i=1, swap(A[1],A[1])=skip, A=[37,22,81,63,19,97,53,47,73,55]
i=1, j=2: A[2]=22≤55 → i=2, skip, A unchanged
i=2, j=3: A[3]=81>55 → no action
i=2, j=4: A[4]=63>55 → no action
i=2, j=5: A[5]=19≤55 → i=3, swap(A[3],A[5]): A=[37,22,19,63,81,97,53,47,73,55] ← Step 1!

i=3, j=6: A[6]=97>55 → no action
i=3, j=7: A[7]=53≤55 → i=4, swap(A[4],A[7]): A=[37,22,19,53,81,97,63,47,73,55]
→ Step 2: i=4, j=(A)7, Array=(B)=[37,22,19,53,81,97,63,47,73,55]

i=4, j=8: A[8]=47≤55 → i=5, swap(A[5],A[8]): A=[37,22,19,53,47,97,63,81,73,55]
→ Step 3: i=(C)5, j=(D)8, Array=(E)=[37,22,19,53,47,97,63,81,73,55]

j=9: A[9]=73>55 → no action
pivot swap: swap(A[6],A[10]): A=[37,22,19,53,47,55,63,81,73,97]

답:
(A) = 7
(B) = [37, 22, 19, 53, 81, 97, 63, 47, 73, 55]
(C) = 5
(D) = 8
(E) = [37, 22, 19, 53, 47, 97, 63, 81, 73, 55]`
      },
      {
        label: 'b',
        points: 10,
        text: '(b) From the results of calling partition() in (a), state the final pivot index q returned by partition() and write the two sub-arrays that the next recursive Quicksort calls will handle.',
        answer: `피벗 최종 위치: q = 6

pivot swap 후 배열: [37, 22, 19, 53, 47, 55, 63, 81, 73, 97]
                                            ↑ index 6

다음 재귀 호출:
• 왼쪽 sub-array: A[1..5] = [37, 22, 19, 53, 47]  (quicksort(A, 1, 5))
• 오른쪽 sub-array: A[7..10] = [63, 81, 73, 97]  (quicksort(A, 7, 10))`
      },
    ],
    tags: ['QuickSort', 'partition', '정렬', 'pivot', '추적'],
    hint: '피벗=55, 인덱스 1-based. i는 55보다 작거나 같은 원소들의 마지막 위치.',
  },
  {
    id: 'dsa-2025-2-2',
    year: '2025',
    semester: '2',
    subject: 'dsa',
    problemNumber: 2,
    totalPoints: 20,
    category: '그래프 알고리즘',
    title: "Prim's Algorithm MST Relaxation 분석",
    description: `In Prim's algorithm for finding the Minimum Spanning Tree (MST) of a connected, undirected graph with N vertices, relaxation refers to updating the minimum edge weight required to connect a vertex to the growing MST. At the beginning of the algorithm, we choose the starting vertex randomly.

Prim(v): // v is a vertex chosen randomly
1: Mark v as visited and include it in the m.s.t. (S)
2: while (there are unvisited vertices) // each iteration is one relaxation
3:   Find a least-cost edge (x-u) from a visited vertex x to an unvisited vertex u
4:   Mark u as visited
5:   Add the vertex u and the edge (x-u) to the m.s.t.`,
    subQuestions: [
      {
        label: 'a',
        points: 10,
        text: '(a) Suppose the input graph is a star graph with N vertices (one central vertex connected directly to all others, e.g., N=6). How many key updates (relaxations) will Prim\'s algorithm perform in total? Express your answer as a function of N and justify.',
        answer: `답: N - 1

해설 (Star graph, N=6):
- 중앙 노드를 시작 노드로 선택하면:
  각 외부 노드를 순서대로 추가, 매 반복에서 1번의 relaxation
  총 N-1번

- 외부 노드를 시작으로 선택하면:
  중앙 노드 추가 (1번) → 나머지 N-2개는 중앙 노드에서 모두 연결
  매 반복에서 N-2개까지 relaxation 업데이트가 발생...

총 이터레이션(relaxation 횟수): N-1
(각 반복에서 새로운 노드를 1개씩 MST에 추가, N-1개의 노드 추가 필요)`
      },
      {
        label: 'b',
        points: 10,
        text: '(b) Suppose the input graph is a path graph with N vertices (i.e., a graph as a simple line, N=6: 5-4-3-2-1-0). How many key updates (relaxations) will Prim\'s algorithm perform in total? Express your answer as a function of N and justify.',
        answer: `답: N - 1

해설 (Path graph):
경로 그래프에서 Prim의 각 반복은 현재 MST의 끝 노드에서 인접한 미방문 노드를 선택합니다.
각 반복에서 정확히 1개의 새 노드가 추가되므로, 총 N-1번의 relaxation이 발생합니다.

Star와 Path 모두 N-1번이지만 이유가 다름:
- Star: 중앙 노드가 한번에 모든 외부 노드를 relaxation
- Path: 양 끝 방향으로만 relaxation 가능`
      },
    ],
    tags: ['Prim', 'MST', '최소신장트리', 'relaxation'],
  },
  {
    id: 'dsa-2025-2-3',
    year: '2025',
    semester: '2',
    subject: 'dsa',
    problemNumber: 3,
    totalPoints: 30,
    category: '동적 프로그래밍',
    title: 'LCS — Greedy vs Dynamic Programming',
    description: `Given two strings X and Y, the Longest Common Subsequence (LCS) problem asks for the longest sequence of characters that appear in both X and Y in the same relative order (not necessarily contiguous).`,
    subQuestions: [
      {
        label: 'a',
        points: 10,
        text: `(a) Consider the following Greedy algorithm:
Scan strings X and Y from left to right simultaneously. Whenever the same character is found in both, add it to the subsequence and continue with remaining suffixes.
When characters differ, skip and continue with remaining suffixes of X and Y.

For X = "ACDBE" and Y = "ABCDE", compute the subsequence found by this Greedy algorithm and compare it with the actual LCS.`,
        answer: `Greedy 결과:
X="ACDBE", Y="ABCDE"
- A=A → 추가 "A", X="CDBE", Y="BCDE"
- C≠B → skip, X="DBE", Y="CDE"
- D≠C → skip, X="BE", Y="DE"
- B≠D → skip, X="E", Y="E"
- E=E → 추가 "AE"

Greedy 결과: "AE" (길이 2)

실제 LCS: "ACDE" 또는 "ABDE" (길이 4)

결론: Greedy는 최적해를 보장하지 않습니다!`
      },
      {
        label: 'b',
        points: 20,
        text: '(b) Present a dynamic programming recurrence relation for solving the LCS problem. Write the base case and recurrent equation. Analyze the time complexity.',
        answer: `DP 정의: dp[i][j] = X의 앞 i글자와 Y의 앞 j글자의 LCS 길이

(1) Base case:
dp[i][0] = 0  for all i
dp[0][j] = 0  for all j

(2) Recurrence equation:
if X[i] = Y[j]:  dp[i][j] = dp[i-1][j-1] + 1
else:             dp[i][j] = max(dp[i-1][j], dp[i][j-1])

(3) Time complexity: O(|X| × |Y|)
공간 복잡도: O(|X| × |Y|), 최적화 시 O(min(|X|,|Y|))`
      },
    ],
    tags: ['LCS', '동적프로그래밍', 'DP', 'Greedy', '재귀관계'],
  },
  {
    id: 'dsa-2024-1-1',
    year: '2024',
    semester: '1',
    subject: 'dsa',
    problemNumber: 1,
    totalPoints: 50,
    category: '허프만 코딩',
    title: 'Huffman Coding — Prefix Codes & ABL',
    description: `Answer the following questions about the Huffman coding based on the frequency table below.

Characters: a, b, c, d with frequencies f₁, f₂, f₃, f₄ where f₁ ≥ f₂ ≥ f₃ ≥ f₄`,
    subQuestions: [
      {
        label: 'a',
        points: 10,
        text: '(a) [10 pts] Suppose that f₁ ≥ f₂ ≥ f₃ ≥ f₄. What are the possible code lengths (n₁, n₂, n₃, n₄) of the prefix codes minimizing ABL? ABL(c) = Σ fₓ · |c(x)| where S is the set of characters.',
        answer: `ABL 최소화 접두사 코드에서 빈도 높은 문자는 짧은 코드를 받습니다.
f₁ ≥ f₂ ≥ f₃ ≥ f₄ 이므로 n₁ ≤ n₂ ≤ n₃ ≤ n₄

가능한 코드 길이 (Huffman):
• 4개 문자에서: n₁=1 or 2, n₂, n₃, n₄ 각 1~4
• 가장 낮은 빈도 두 개(f₃, f₄)가 가장 긴 코드
• 이들의 코드 길이는 같거나 1 차이

가능한 패턴:
(1, 2, 3, 3): f₁=1비트, f₂=2비트, f₃=f₄=3비트
(1, 2, 2, 2): 불가 (접두사 코드 불가)
(2, 2, 2, 2): f₁=f₂=f₃=f₄=2비트 (균등한 경우)`
      },
      {
        label: 'b',
        points: 10,
        text: '(b) [10 pts] The fixed-length code is a coding scheme in which all characters are encoded with the code having the same length. Let the least ABL of the fixed-length code be ABL(T_F). Express ABL(T_F) using f₁, f₂, f₃, f₄.',
        answer: `4개 문자를 고정 길이로 인코딩하려면 ⌈log₂ 4⌉ = 2 비트 필요

ABL(T_F) = 2 · (f₁ + f₂ + f₃ + f₄) / (f₁ + f₂ + f₃ + f₄) = 2

(단순히 각 문자에 2비트 코드를 할당: 00, 01, 10, 11)`
      },
      {
        label: 'd',
        points: 15,
        text: '(d) [15 pts] Make a Huffman code using the following frequency table:\na:11, b:10, c:4, d:17, e:13, f:45',
        answer: `허프만 트리 구축:
힙: c(4), b(10), a(11), e(13), d(17), f(45)

단계1: c(4)+b(10) → cb(14)
힙: a(11), e(13), cb(14), d(17), f(45)

단계2: a(11)+e(13) → ae(24)
힙: cb(14), d(17), ae(24), f(45)

단계3: cb(14)+d(17) → cbd(31)
힙: ae(24), cbd(31), f(45)

단계4: ae(24)+cbd(31) → aecbd(55)
힙: f(45), aecbd(55)

단계5: f(45)+aecbd(55) → root(100)

최종 코드:
f: 0
a: 100
e: 101
c: 1100
b: 1101
d: 111

ABL = (45·1 + 11·3 + 13·3 + 4·4 + 10·4 + 17·3) / 100
    = (45 + 33 + 39 + 16 + 40 + 51) / 100
    = 224 / 100 = 2.24 bits/letter`
      },
    ],
    tags: ['허프만코딩', 'ABL', '접두사코드', '그리디', '트리'],
  },
];

/* ═══════════════════════════════════════════════════
   DSA PRACTICE QUESTIONS
═══════════════════════════════════════════════════ */
export const DSA_PRACTICE_QUESTIONS: QuizQuestion[] = [
  {
    id: 'dsa-p1',
    type: 'true-false',
    topic: '점근 분석',
    difficulty: 'easy',
    question: 'n² = O(n³)은 참인가?',
    answer: 'true',
    explanation: 'O는 점근적 상한입니다. n² ≤ c·n³ (c=1, n₀=1)이 성립하므로 n² = O(n³)은 참입니다.',
  },
  {
    id: 'dsa-p2',
    type: 'true-false',
    topic: '점근 분석',
    difficulty: 'medium',
    question: '2^n = O(2^(n/2))은 참인가?',
    answer: 'false',
    explanation: '2^n / 2^(n/2) = 2^(n/2) → ∞이므로 2^n은 2^(n/2)의 Big-O가 될 수 없습니다. 반대로 2^n = Ω(2^(n/2))이 성립합니다.',
  },
  {
    id: 'dsa-p3',
    type: 'multiple-choice',
    topic: '점근 분석',
    difficulty: 'easy',
    question: '다음 중 성장률이 가장 느린 것은?',
    options: ['n²', 'n log n', '2^n', 'n!'],
    answer: 1,
    explanation: '성장률 순서: n log n < n² < 2^n < n!. 따라서 n log n이 가장 느립니다.',
    tags: ['Big-O', '성장률'],
  },
  {
    id: 'dsa-p4',
    type: 'multiple-choice',
    topic: '정렬',
    difficulty: 'easy',
    question: '다음 중 최악의 경우 O(n log n)을 보장하는 정렬 알고리즘은?',
    options: ['QuickSort', 'BubbleSort', 'MergeSort', 'InsertionSort'],
    answer: 2,
    explanation: 'MergeSort는 항상 O(n log n)입니다. QuickSort는 평균 O(n log n)이지만 최악은 O(n²)입니다.',
    tags: ['정렬', 'MergeSort', 'QuickSort'],
  },
  {
    id: 'dsa-p5',
    type: 'true-false',
    topic: '정렬',
    difficulty: 'easy',
    question: 'MergeSort는 in-place 정렬 알고리즘이다.',
    answer: 'false',
    explanation: 'MergeSort는 합병 단계에서 O(n)의 추가 공간이 필요합니다. in-place가 아닙니다. in-place 정렬: QuickSort, HeapSort, BubbleSort.',
  },
  {
    id: 'dsa-p6',
    type: 'multiple-choice',
    topic: '힙',
    difficulty: 'medium',
    question: '8개 원소가 있는 min-heap에서 최솟값 추출(extract-min) 후 sift-down의 최대 비교 횟수는?',
    options: ['2', '3', '4', '8'],
    answer: 1,
    explanation: '8개 원소의 힙 높이 = ⌊log₂ 8⌋ = 3. sift-down은 각 레벨에서 최대 2번(두 자식 비교)하므로 최대 3번의 비교가 필요합니다.',
    tags: ['힙', 'sift-down', '시간복잡도'],
  },
  {
    id: 'dsa-p7',
    type: 'fill-blank',
    topic: '힙',
    difficulty: 'easy',
    question: '배열 [3, 7, 5, 10, 12, 8, 6]에서 인덱스 1(0-indexed, 값=7)의 왼쪽 자식의 인덱스는?',
    answer: '3',
    explanation: '0-indexed에서 노드 i의 왼쪽 자식은 2i+1입니다. i=1이면 2(1)+1=3. arr[3]=10이 왼쪽 자식입니다.',
    tags: ['힙', '배열표현'],
  },
  {
    id: 'dsa-p8',
    type: 'true-false',
    topic: 'BST',
    difficulty: 'easy',
    question: 'BST의 중위순회(Inorder)는 원소들을 오름차순으로 출력한다.',
    answer: 'true',
    explanation: 'BST 속성(left < root < right)에 의해 Inorder(left→root→right) 순회는 항상 오름차순입니다.',
  },
  {
    id: 'dsa-p9',
    type: 'true-false',
    topic: 'BST',
    difficulty: 'medium',
    question: 'Red-Black Tree에서 Red 노드의 자식은 항상 Black이어야 한다.',
    answer: 'true',
    explanation: 'Red-Black Tree 속성 4번: Red 노드의 부모와 자식은 모두 Black이어야 합니다 (연속된 Red 불가).',
  },
  {
    id: 'dsa-p10',
    type: 'multiple-choice',
    topic: '그래프 알고리즘',
    difficulty: 'easy',
    question: 'Dijkstra 알고리즘이 올바르게 동작하지 않는 경우는?',
    options: ['가중치가 없는 그래프', '음수 가중치 간선이 있는 그래프', '방향 그래프', '연결되지 않은 그래프'],
    answer: 1,
    explanation: 'Dijkstra는 음수 가중치가 있으면 이미 처리한 노드의 최단 거리가 갱신될 수 있어 올바르지 않습니다. 음수 간선에는 Bellman-Ford를 사용해야 합니다.',
    tags: ['Dijkstra', '음수가중치'],
  },
  {
    id: 'dsa-p11',
    type: 'fill-blank',
    topic: '그래프 알고리즘',
    difficulty: 'medium',
    question: 'V=5, E=8인 그래프에서 BFS의 시간 복잡도는 Big-O 표기로?',
    answer: 'O(V+E)',
    explanation: 'BFS(너비 우선 탐색)의 시간 복잡도는 O(V+E)입니다. 각 정점은 한 번, 각 간선은 한 번씩 처리됩니다.',
    tags: ['BFS', '시간복잡도'],
  },
  {
    id: 'dsa-p12',
    type: 'true-false',
    topic: '그래프 알고리즘',
    difficulty: 'medium',
    question: '그래프의 MST(최소 신장 트리)는 항상 유일하다.',
    answer: 'false',
    explanation: '간선 가중치가 모두 다르면 MST는 유일하지만, 같은 가중치의 간선이 여러 개면 MST가 여러 개일 수 있습니다.',
  },
  {
    id: 'dsa-p13',
    type: 'multiple-choice',
    topic: '동적 프로그래밍',
    difficulty: 'medium',
    question: 'X="ABCD", Y="ACBD"의 LCS 길이는?',
    options: ['2', '3', '4', '1'],
    answer: 1,
    explanation: '"ABD"가 LCS (길이 3): A(1,1)→B(2,3)→D(4,4) 또는 A(1,1)→C(3,2)→D(4,4). DP로 확인 가능.',
    tags: ['LCS', 'DP'],
  },
  {
    id: 'dsa-p14',
    type: 'true-false',
    topic: '동적 프로그래밍',
    difficulty: 'easy',
    question: 'Greedy 알고리즘은 LCS 문제를 항상 최적으로 풀 수 있다.',
    answer: 'false',
    explanation: 'Greedy는 LCS에서 최적해를 보장하지 않습니다. 시험에서 X="ACDBE", Y="ABCDE"의 예시처럼 Greedy는 "AE"(길이 2)를 반환하지만 실제 LCS는 길이 4입니다.',
  },
  {
    id: 'dsa-p15',
    type: 'multiple-choice',
    topic: '연결 리스트 & 배열',
    difficulty: 'easy',
    question: '단방향 연결 리스트(head만 있음)에서 n번째 노드에 접근하는 시간 복잡도는?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    answer: 2,
    explanation: '연결 리스트는 임의 접근이 불가능합니다. head에서부터 n-1번 next를 따라가야 하므로 O(n)입니다. 배열은 O(1).',
    tags: ['연결리스트', '시간복잡도'],
  },
  {
    id: 'dsa-p16',
    type: 'fill-blank',
    topic: '점근 분석',
    difficulty: 'hard',
    question: 'lg(n!) = Θ(?)  (n 팩토리얼의 로그의 점근적 정확한 한계)',
    answer: 'n log n',
    explanation: 'Stirling 공식: n! ≈ (n/e)^n이므로 lg(n!) ≈ n·lg(n) - n·lg(e) = Θ(n·lg n). 또한 lg(n^n) = n·lg(n)이므로 lg(n!) = Θ(lg(n^n)) = Θ(n·lg n).',
    tags: ['점근분석', 'Stirling', 'Theta'],
  },
  {
    id: 'dsa-p17',
    type: 'multiple-choice',
    topic: '힙',
    difficulty: 'medium',
    question: '빈 Min-Heap에 1, 5, 3, 2, 7을 순서대로 삽입 후 배열 표현은?',
    options: ['[1, 2, 3, 5, 7]', '[1, 5, 3, 2, 7]', '[1, 2, 3, 7, 5]', '[1, 2, 5, 3, 7]'],
    answer: 0,
    explanation: '삽입 과정: [1]→[1,5]→[1,5,3]→[1,2,3,5] (2<5, sift-up)→[1,2,3,5,7]. 최종: [1,2,3,5,7]',
    tags: ['MinHeap', '삽입', 'sift-up'],
  },
  {
    id: 'dsa-p18',
    type: 'true-false',
    topic: '정렬',
    difficulty: 'medium',
    question: 'QuickSort에서 피벗으로 항상 첫 번째 원소를 선택하면 이미 정렬된 배열에서 O(n²)이 된다.',
    answer: 'true',
    explanation: '피벗이 항상 최솟값이면 분할이 (0, n-1)로 극단적으로 치우쳐 n번의 분할 × 각 O(n) 작업 = O(n²). 랜덤 피벗이나 median-of-three로 방지 가능.',
  },
  {
    id: 'dsa-p19',
    type: 'multiple-choice',
    topic: '그래프 알고리즘',
    difficulty: 'medium',
    question: 'V개의 정점, E개의 간선이 있는 연결 그래프에서 MST의 간선 수는?',
    options: ['E', 'V', 'V-1', 'E-1'],
    answer: 2,
    explanation: '트리는 V개의 정점에 V-1개의 간선을 가집니다. MST도 트리이므로 V-1개의 간선을 가집니다.',
    tags: ['MST', '트리'],
  },
  {
    id: 'dsa-p20',
    type: 'short-answer',
    topic: '점근 분석',
    difficulty: 'hard',
    question: 'n^k = o(c^n) 이 성립하는 조건을 쓰시오 (k, c는 상수).',
    answer: 'k ≥ 1이고 c > 1인 경우',
    explanation: '다항식 n^k는 지수 c^n보다 점근적으로 느리게 성장합니다 (c > 1인 경우). lim_{n→∞} n^k / c^n = 0 (L\'Hôpital 반복 적용). k ≥ 1이고 c > 1이면 항상 성립합니다.',
    tags: ['little-o', '다항식', '지수'],
  },
  {
    id: 'dsa-p21',
    type: 'true-false',
    topic: '연결 리스트 & 배열',
    difficulty: 'medium',
    question: '스택(Stack)은 LIFO와 FIFO 모두를 지원한다.',
    answer: 'false',
    explanation: '스택은 LIFO(Last-In-First-Out)만 지원합니다. FIFO는 큐(Queue)의 특성입니다.',
  },
  {
    id: 'dsa-p22',
    type: 'multiple-choice',
    topic: '허프만 코딩',
    difficulty: 'medium',
    question: '허프만 코딩에서 가장 빈도가 높은 문자의 코드 길이는?',
    options: ['가장 길다', '가장 짧다', '항상 1비트', '항상 2비트'],
    answer: 1,
    explanation: '허프만 코딩은 빈도가 높은 문자에 짧은 코드를, 낮은 문자에 긴 코드를 할당하여 ABL을 최소화합니다.',
    tags: ['허프만', 'ABL'],
  },
  {
    id: 'dsa-p23',
    type: 'fill-blank',
    topic: 'BST',
    difficulty: 'easy',
    question: 'BST에 값 [5, 3, 7, 1, 4]를 순서대로 삽입 후 루트 노드의 값은?',
    answer: '5',
    explanation: '처음 삽입된 5가 루트가 됩니다. 이후 3(5의 좌), 7(5의 우), 1(3의 좌), 4(3의 우).',
    tags: ['BST', '삽입'],
  },
  {
    id: 'dsa-p24',
    type: 'multiple-choice',
    topic: '동적 프로그래밍',
    difficulty: 'easy',
    question: 'DP가 Greedy보다 더 많은 경우에 최적해를 보장하는 이유는?',
    options: [
      'DP가 항상 더 빠르기 때문',
      'DP는 모든 부분 문제의 해를 저장하고 최적화하기 때문',
      'Greedy는 전혀 사용할 수 없기 때문',
      'DP는 공간을 더 많이 사용하기 때문',
    ],
    answer: 1,
    explanation: 'DP는 중복 부분 문제의 해를 메모이제이션하고 최적 부분구조를 이용하여 전역 최적해를 보장합니다. Greedy는 지역적 최적 선택이 전역 최적을 보장하지 않을 수 있습니다.',
    tags: ['DP', 'Greedy', '최적해'],
  },
  {
    id: 'dsa-p25',
    type: 'true-false',
    topic: '그래프 알고리즘',
    difficulty: 'easy',
    question: 'Prim 알고리즘과 Kruskal 알고리즘은 같은 MST를 구한다.',
    answer: 'true',
    explanation: '간선 가중치가 모두 다를 때 두 알고리즘은 동일한 유일한 MST를 구합니다. 같은 가중치가 있을 때는 다른 MST를 구할 수도 있지만 비용은 동일합니다.',
  },
];
