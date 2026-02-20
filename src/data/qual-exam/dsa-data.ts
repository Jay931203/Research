import type { StudyTopic } from '@/components/qual-exam/TopicStudyCard';
import type { ExamProblem } from '@/components/qual-exam/ExamProblemCard';
import type { QuizQuestion } from '@/components/qual-exam/PracticeList';

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
    studyOrder: 1,
    summary: '알고리즘 성능의 점근적 분석. Big-O, Big-Ω, Big-Θ 표기법으로 입력 크기에 따른 성장률을 정의합니다. 매년 출제되는 핵심 주제.',
    relatedExamIds: ['dsa-2024-2-1', 'dsa-2022-1-2', 'dsa-2025-1-1'],
    mathFormulas: [
      { label: 'Big-O 정의 (점근적 상한)', latex: 'f(n) = O(g(n)) \\iff \\exists\\, c > 0,\\, n_0 : f(n) \\le c \\cdot g(n)\\ \\forall n \\ge n_0' },
      { label: 'Big-Ω 정의 (점근적 하한)', latex: 'f(n) = \\Omega(g(n)) \\iff \\exists\\, c > 0,\\, n_0 : f(n) \\ge c \\cdot g(n)\\ \\forall n \\ge n_0' },
      { label: '성장률 순서 (느린 → 빠른)', latex: 'O(1) \\prec O(\\log n) \\prec O(n) \\prec O(n\\log n) \\prec O(n^2) \\prec O(2^n) \\prec O(n!)' },
      { label: 'Stirling 공식 (자주 출제)', latex: '\\lg(n!) = \\Theta(n\\lg n)' },
    ],
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
    studyOrder: 6,
    summary: 'QuickSort(평균 O(n log n), in-place), MergeSort(항상 O(n log n), NOT in-place), HeapSort(항상 O(n log n), in-place) 비교.',
    relatedExamIds: ['dsa-2025-2-1', 'dsa-2020-1-1', 'dsa-2020-2-1', 'dsa-2022-2-1'],
    mathFormulas: [
      { label: 'QuickSort 최악: 편향된 분할', latex: 'T(n) = T(n-1) + O(n) \\Rightarrow T(n) = O(n^2)' },
      { label: 'MergeSort: 항상 균등 분할', latex: 'T(n) = 2T(n/2) + O(n) \\Rightarrow T(n) = O(n\\log n)' },
    ],
    keyPoints: [
      'QuickSort: 피벗 기준 분할, 평균 O(n log n), 최악 O(n²), in-place',
      'MergeSort: 분할정복, 항상 O(n log n), NOT in-place (O(n) 추가 공간)',
      'HeapSort: 힙 구조 이용, 항상 O(n log n), in-place',
      'BubbleSort: 인접 교환, O(n²), in-place',
      'QuickSort partition: last element as pivot (CLRS 방식)',
    ],
    theory: `■ QuickSort — CLRS Lomuto Partition
partition(A, p, r):
  pivot ← A[r]       // 마지막 원소를 피벗
  i ← p - 1         // ≤pivot 구역 경계 (i 이하는 ≤pivot)
  for j = p to r-1:
    if A[j] ≤ pivot:
      i ← i + 1
      swap(A[i], A[j])
  swap(A[i+1], A[r])  // 피벗을 올바른 자리로
  return i+1           // 피벗의 최종 인덱스 반환

전체 호출: quicksort(A, p, q-1), quicksort(A, q+1, r) — 피벗은 재귀에서 제외

■ 완전 추적 예시 (A = [37, 22, 81, 63, 19, 97, 53, 47, 73, 55], pivot=55)
초기 상태: i = -1 (p=0 기준이면 i = p-1 = -1)
j=0: A[0]=37 ≤ 55 → i=0, swap(A[0],A[0]) → 변화 없음
j=1: A[1]=22 ≤ 55 → i=1, swap(A[1],A[1]) → 변화 없음
j=2: A[2]=81 > 55 → skip
j=3: A[3]=63 > 55 → skip
j=4: A[4]=19 ≤ 55 → i=2, swap(A[2],A[4]) → [37,22,19,63,81,97,53,47,73,55]
j=5: A[5]=97 > 55 → skip
j=6: A[6]=53 ≤ 55 → i=3, swap(A[3],A[6]) → [37,22,19,53,81,97,63,47,73,55]
j=7: A[7]=47 ≤ 55 → i=4, swap(A[4],A[7]) → [37,22,19,53,47,97,63,81,73,55]
j=8: A[8]=73 > 55 → skip
루프 종료 후: swap(A[5], A[9]) → [37,22,19,53,47,55,63,81,73,97]
피벗 55가 인덱스 5에 정착. 왼쪽[0..4]은 모두 ≤55, 오른쪽[6..9]은 모두 >55

■ QuickSort 복잡도 분석
최선/평균: 균등 분할 → T(n) = 2T(n/2) + O(n) → O(n log n)
최악: 이미 정렬된 배열 + last-element pivot → 매번 n-1 : 0으로 분할
  T(n) = T(n-1) + O(n) → T(n) = O(n²)
공간: in-place (추가 배열 없음), 재귀 깊이 O(log n) 평균 / O(n) 최악

■ MergeSort — 분할정복 (항상 O(n log n))
mergesort(A, p, r):
  if p < r:
    q ← ⌊(p+r)/2⌋
    mergesort(A, p, q)
    mergesort(A, q+1, r)
    merge(A, p, q, r)     // O(n) 시간, O(n) 추가 공간

예시: [38, 27, 43, 3, 9, 82, 10]
분할: [38,27,43,3] | [9,82,10]
재귀: [27,38] | [3,43] 병합 → [3,27,38,43]
     [9,82] | [10] 병합 → [9,10,82]
최종 병합: [3,9,10,27,38,43,82]
핵심: NOT in-place → O(n) 추가 공간 필요, 안정 정렬(stable)

■ HeapSort — 제자리 O(n log n)
1단계: Build-Max-Heap(A) — O(n), 아래서부터 sift-down
2단계: 루트(최댓값)를 배열 끝으로 보내고 힙 크기 감소, sift-down — O(n log n)
특징: in-place (추가 O(1)), 불안정 정렬(unstable)

■ 정렬 알고리즘 핵심 비교
알고리즘    | 최선       | 평균       | 최악       | 공간  | 안정성
QuickSort  | O(n log n) | O(n log n) | O(n²)     | O(1)  | 불안정
MergeSort  | O(n log n) | O(n log n) | O(n log n)| O(n)  | 안정
HeapSort   | O(n log n) | O(n log n) | O(n log n)| O(1)  | 불안정
InsertSort | O(n)       | O(n²)      | O(n²)     | O(1)  | 안정
BubbleSort | O(n)       | O(n²)      | O(n²)     | O(1)  | 안정

■ 시험 단골 함정
• MergeSort는 in-place가 아님 — "O(n) 추가 공간 필요"
• QuickSort 최악은 O(n²) — 이미 정렬되거나 역정렬된 배열에서 마지막 원소 피벗
• partition 후 피벗의 위치 = 반환된 q → quicksort(A,p,q-1)과 quicksort(A,q+1,r) 호출
• in-place 정렬: QuickSort, HeapSort, InsertionSort, BubbleSort
• 안정(stable) 정렬: MergeSort, InsertionSort, BubbleSort (QuickSort, HeapSort는 불안정)`,
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
    studyOrder: 3,
    summary: '완전 이진 트리로 구현된 우선순위 큐. 삽입·추출 O(log n), Heapify O(n). HeapSort에 활용.',
    relatedExamIds: ['dsa-2024-2-3', 'dsa-2020-1-1', 'dsa-2025-1-1'],
    mathFormulas: [
      { label: '노드 i의 부모 (0-indexed)', latex: '\\text{parent}(i) = \\left\\lfloor \\tfrac{i-1}{2} \\right\\rfloor' },
      { label: '왼쪽 자식', latex: '\\text{left}(i) = 2i + 1' },
      { label: '오른쪽 자식', latex: '\\text{right}(i) = 2i + 2' },
      { label: 'HeapSort 복잡도', latex: '\\underbrace{O(n)}_{\\text{Heapify}} + \\underbrace{n \\cdot O(\\log n)}_{\\text{extract}} = O(n\\log n)' },
    ],
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
    studyOrder: 4,
    summary: 'BST 속성(left < parent < right), 전위/중위/후위/BFS 순회, Red-Black Tree 5가지 속성.',
    relatedExamIds: ['dsa-2025-1-2', 'dsa-2021-2-1', 'dsa-2023-1-1'],
    keyPoints: [
      'BST 속성: left < parent < right',
      'BFS로 BST를 순회하면 레벨 순서를 얻음',
      'BST의 BFS 순서가 주어지면 루트부터 재구성 가능',
      'Red-Black Tree: 루트는 항상 검정(Black)',
      'MST는 유일하지 않을 수 있음 (같은 가중치 간선이 있을 경우)',
    ],
    theory: `■ BST 속성 (Binary Search Tree Property)
모든 노드 x에 대해:
  left subtree의 모든 y → y.key < x.key
  right subtree의 모든 z → z.key > x.key
(중복 키는 보통 허용하지 않거나 왼쪽/오른쪽 한 방향으로만 허용)

■ 4가지 순회 (예시 트리: 루트=50, L=30(L=20,R=40), R=70(L=60,R=80))
전위(Preorder) — root → L → R:    50, 30, 20, 40, 70, 60, 80
중위(Inorder)  — L → root → R:    20, 30, 40, 50, 60, 70, 80  ← 오름차순!
후위(Postorder)— L → R → root:    20, 40, 30, 60, 80, 70, 50
BFS (레벨순서): 큐 이용 → 50, 30, 70, 20, 40, 60, 80

■ 삽입 알고리즘
tree-insert(T, z):
  y ← NIL; x ← T.root
  while x ≠ NIL:
    y ← x
    if z.key < x.key: x ← x.left
    else:              x ← x.right
  z.parent ← y
  if y = NIL:    T.root ← z       // 트리가 비어 있음
  elif z.key < y.key: y.left ← z
  else:               y.right ← z

■ 삭제 — 3가지 경우
Case 1: 삭제 노드 z가 자식이 없음 → 그냥 제거
Case 2: 삭제 노드 z가 자식이 하나 → 자식이 z 자리를 대신
Case 3: 삭제 노드 z가 자식이 둘 → z의 중위 후계자(in-order successor) y를 찾아 z.key를 y.key로 교체하고, y를 삭제 (y는 왼쪽 자식이 없으므로 Case 1 or 2)
중위 후계자: z의 오른쪽 서브트리에서 가장 왼쪽 노드

■ BFS 순서로 BST 재구성 (2025년 1학기 기출)
BFS 순서: 30, 20, 40, 10, 35, 42, 37, 50, 36
방법: 각 원소를 BST에 순차 삽입 (BFS 순서 = 레벨 순서이므로 순서대로 insert하면 됨)

삽입 30: root=30
삽입 20: 20<30 → 30.left=20
삽입 40: 40>30 → 30.right=40
삽입 10: 10<30→left, 10<20→left → 20.left=10
삽입 35: 35>30→right, 35<40→left → 40.left=35
삽입 42: 42>30→right, 42>40→right → 40.right=42
삽입 37: 37>30→right, 37<40→left, 37>35→right → 35.right=37
삽입 50: 50>30→right, 50>40→right, 50>42→right → 42.right=50
삽입 36: 36>30→right, 36<40→left, 36>35→right, 36<37→left → 37.left=36

최종 트리:
            30
          /    \
        20      40
       /       /  \
      10      35   42
               \    \
               37   50
              /
             36

BFS로 순회하면: 30,20,40,10,35,42,37,50,36 — 주어진 순서와 일치 ✓

■ Red-Black Tree — 5가지 속성 (암기 필수)
1. 모든 노드는 RED 또는 BLACK
2. 루트는 항상 BLACK                              ← 시험에서 자주 묻는 것
3. 모든 리프 (NIL 센티넬) 노드는 BLACK
4. RED 노드의 두 자식은 모두 BLACK (RED-RED 연속 불가)
5. 임의의 노드에서 리프까지의 모든 경로는 동일한 수의 BLACK 노드를 포함 (black-height)

RB-Tree 성질:
• 높이 h ≤ 2 lg(n+1) — 항상 O(log n) 보장
• 삽입/삭제 시 최대 O(log n)번의 color-flip과 최대 3번의 rotation
• AVL Tree보다 rotation이 적음 (삽입에서 AVL은 최대 2번, RB는 최대 2번)
• AVL은 더 엄격한 균형(높이 ≤ 1.44 lg n) → 탐색 빠름, 삽입/삭제 느림

■ 시험 함정
• BST 중위 순회는 항상 오름차순 — 역순이 되려면 (R→root→L)
• BFS 순서로 트리를 준다면 → 순서대로 BST에 삽입하면 동일한 트리 재구성 가능
• 삭제의 Case 3에서 in-order successor (오른쪽 서브트리의 최솟값)를 사용
• RB-Tree: 루트는 반드시 Black (삽입 후 루트가 Red가 되면 Black으로 변경)`,
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
    studyOrder: 8,
    summary: '최단 경로(Dijkstra, Bellman-Ford), 최소 신장 트리(Prim, Kruskal). Dijkstra는 음수 간선 불가.',
    relatedExamIds: ['dsa-2024-2-2', 'dsa-2021-2-1', 'dsa-2022-2-1', 'dsa-2025-2-2', 'dsa-2020-2-1'],
    mathFormulas: [
      { label: 'Dijkstra Relaxation', latex: '\\text{dist}[v] = \\min\\bigl(\\text{dist}[v],\\ \\text{dist}[u] + w(u,v)\\bigr)' },
      { label: 'Dijkstra 복잡도 (min-heap)', latex: 'O\\bigl((V + E)\\log V\\bigr)' },
    ],
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
    studyOrder: 7,
    summary: '최적 부분구조 + 중복 부분문제. LCS(O(|X|·|Y|))와 Knapsack이 핵심. Greedy는 최적 보장 안 함.',
    relatedExamIds: ['dsa-2025-2-3', 'dsa-2021-1-1'],
    mathFormulas: [
      { label: 'LCS — X[i]=Y[j]인 경우', latex: 'dp[i][j] = dp[i-1][j-1] + 1' },
      { label: 'LCS — X[i]≠Y[j]인 경우', latex: 'dp[i][j] = \\max\\bigl(dp[i-1][j],\\ dp[i][j-1]\\bigr)' },
      { label: '0-1 Knapsack', latex: 'dp[i][w] = \\max\\bigl(dp[i-1][w],\\ dp[i-1][w-w_i] + v_i\\bigr)' },
    ],
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
    studyOrder: 2,
    summary: '배열(임의 접근 O(1))과 연결 리스트(삽입 O(1))의 트레이드오프. Stack(LIFO), Queue(FIFO) 자료구조.',
    relatedExamIds: ['dsa-2025-1-3', 'dsa-2025-1-1'],
    keyPoints: [
      '단방향 연결 리스트: 앞 삽입 O(1), 임의 위치 삽입 O(n)',
      '양방향 연결 리스트: tail 유지 시 끝 삽입 O(1)',
      '배열: 임의 접근 O(1), 중간 삽입 O(n) (shift 필요)',
      '배열이 꽉 찰 때 끝 삽입: O(n) (resize + copy)',
    ],
    theory: `■ 배열(Array) 핵심
임의 접근(Random Access): arr[i] → O(1) (메모리 주소 = base + i × size)
삽입 at end (여유 있음): O(1) — 마지막 위치에 저장
삽입 at end (꽉 찼을 때): O(n) — 2배 크기 새 배열 할당 + 전체 복사 (Dynamic Array)
삽입 at index i: O(n) — arr[i..n-1]을 한 칸씩 뒤로 shift
삭제 at index i: O(n) — arr[i+1..n-1]을 한 칸씩 앞으로 shift
탐색 (정렬된 경우): O(log n) (이진 탐색)
탐색 (비정렬): O(n)

■ 단방향 연결 리스트 (Singly Linked List)
구조: head → [data|next] → [data|next] → ... → NIL
앞 삽입 (prepend): O(1) — 새 노드.next = head, head = 새 노드
뒤 삽입 (tail 없음): O(n) — tail까지 순회 후 삽입
뒤 삽입 (tail 포인터 유지): O(1)
임의 위치 삽입: O(n) — 해당 위치까지 순회 O(n) + 삽입 O(1)
탐색: O(n)
역방향 순회: 불가 (단방향)

■ 양방향 연결 리스트 (Doubly Linked List)
구조: head ⇄ [prev|data|next] ⇄ ... ⇄ NIL (tail 포인터 보유 시)
앞/뒤 삽입: O(1) (head 또는 tail 포인터 이용)
임의 위치 삽입: O(n) 탐색 + O(1) 삽입
삭제: O(1) — 앞뒤 포인터 조작으로 즉시 제거 (단방향은 이전 노드 찾기 O(n))

■ 2025년 1학기 기출: Insert 연산 시간 복잡도
C1: array.insert(idx=array.length(), "a")  // 배열 끝 삽입
  → 꽉 차지 않았다면 O(1), 꽉 찼다면 O(n) (resize)
  → 최악 O(n), 분할 상환(amortized) O(1)

C2: array.insert(idx=x, "b")  // 배열 임의 위치 삽입
  → 항상 O(n) (idx 이후 원소를 shift해야 함)

C3: list.insert(idx=list.length(), "c")  // 연결 리스트 끝 삽입
  → tail 포인터 없음: O(n) (끝까지 순회)
  → tail 포인터 있음: O(1)

■ Stack (LIFO — Last In First Out)
구현: 배열(top 포인터) 또는 연결 리스트(head가 top)
push(x): top에 추가 → O(1)
pop():   top 제거 및 반환 → O(1)
peek():  top 값 반환 (제거 안 함) → O(1)
용도: 함수 호출 스택, 괄호 검사, DFS(비재귀), 수식 계산

■ Queue (FIFO — First In First Out)
구현: 원형 배열(head/tail 포인터) 또는 연결 리스트
enqueue(x): tail에 추가 → O(1)
dequeue():  head에서 제거 및 반환 → O(1)
용도: BFS, 프로세스 스케줄링, 프린터 대기열

■ 시험 함정
• 배열 끝 삽입: 평균(amortized) O(1)이지만 worst case는 O(n)
• 연결 리스트는 임의 접근(O(1)) 불가 — 무조건 O(n) 탐색
• 스택은 LIFO, 큐는 FIFO — 스택으로 큐 구현 가능하지만 O(n) 비용
• 이중 연결 리스트의 중간 삽입/삭제: 노드 위치를 알면 O(1), 위치 탐색에 O(n)`,
    complexityTable: [
      { operation: '배열 임의 접근', complexity: 'O(1)', note: '주소 = base + i × size' },
      { operation: '배열 끝 삽입 (여유 있음)', complexity: 'O(1)', note: '' },
      { operation: '배열 끝 삽입 (꽉 참)', complexity: 'O(n)', note: 'resize + copy' },
      { operation: '배열 임의 삽입', complexity: 'O(n)', note: 'idx 이후 shift' },
      { operation: '단방향 LL 앞 삽입', complexity: 'O(1)', note: 'head 포인터만 변경' },
      { operation: '단방향 LL 끝 삽입 (tail 없음)', complexity: 'O(n)', note: '끝까지 순회' },
      { operation: '단방향 LL 끝 삽입 (tail 있음)', complexity: 'O(1)', note: '' },
      { operation: '이중 LL 앞/뒤 삽입', complexity: 'O(1)', note: 'head/tail 포인터' },
      { operation: '이중 LL 중간 삭제 (노드 알 때)', complexity: 'O(1)', note: '포인터 조작만' },
      { operation: 'Stack push / pop', complexity: 'O(1)', note: 'LIFO' },
      { operation: 'Queue enqueue / dequeue', complexity: 'O(1)', note: 'FIFO' },
    ],
    visualizerType: 'linkedlist',
    codeExamples: [
      {
        caption: '단방향 연결 리스트 — 앞 삽입 O(1) / 뒤 삽입 O(n)',
        language: 'python',
        code: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None   # 다음 노드 포인터

class SinglyLinkedList:
    def __init__(self):
        self.head = None   # head 포인터

    # 앞 삽입 — O(1): head만 변경
    def prepend(self, val):
        node = Node(val)
        node.next = self.head  # 새 노드 → 기존 head
        self.head = node       # head = 새 노드

    # 뒤 삽입 — O(n): tail까지 순회
    def append(self, val):
        node = Node(val)
        if not self.head:
            self.head = node; return
        cur = self.head
        while cur.next:        # ← O(n) 순회
            cur = cur.next
        cur.next = node        # 마지막 노드에 연결`,
      },
      {
        caption: 'Stack (LIFO) — push/pop 모두 O(1)',
        language: 'python',
        code: `class Stack:
    def __init__(self):
        self.top = None        # head = top

    def push(self, val):       # O(1) — 앞 삽입과 동일
        node = Node(val)
        node.next = self.top
        self.top = node

    def pop(self):             # O(1) — head 삭제
        if not self.top:
            raise IndexError("Stack underflow")
        val = self.top.val
        self.top = self.top.next
        return val

    def peek(self):            # O(1) — top 조회 (제거 없음)
        return self.top.val if self.top else None`,
      },
      {
        caption: 'Queue (FIFO) — enqueue/dequeue 모두 O(1)',
        language: 'python',
        code: `class Queue:
    def __init__(self):
        self.front = None      # dequeue 쪽
        self.rear  = None      # enqueue 쪽

    def enqueue(self, val):    # O(1) — rear에 추가
        node = Node(val)
        if not self.rear:
            self.front = self.rear = node; return
        self.rear.next = node
        self.rear = node

    def dequeue(self):         # O(1) — front에서 제거
        if not self.front:
            raise IndexError("Queue underflow")
        val = self.front.val
        self.front = self.front.next
        if not self.front:
            self.rear = None   # 큐가 비었으면 rear도 초기화
        return val`,
      },
    ],
  },
  {
    id: 'huffman',
    title: '허프만 코딩',
    titleEn: 'Huffman Coding',
    icon: '🗜️',
    difficulty: 'advanced',
    examFrequency: 3,
    studyOrder: 9,
    summary: '탐욕 알고리즘으로 최적 접두사 코드(prefix-free code) 생성. 빈도 높은 문자 = 짧은 코드. ABL 최소화.',
    relatedExamIds: ['dsa-2024-1-1', 'dsa-2022-1-1'],
    mathFormulas: [
      { label: 'ABL (Average Bits per Letter)', latex: '\\text{ABL}(c) = \\frac{\\displaystyle\\sum_{x \\in S} f_x \\cdot |c(x)|}{\\displaystyle\\sum_{x \\in S} f_x}' },
      { label: '고정 길이 코드 비트 수', latex: '\\lceil \\log_2 n \\rceil \\text{ bits (n개 문자)}' },
    ],
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
    studyOrder: 5,
    summary: '해시 함수로 키를 인덱스에 매핑. 충돌 해결: 체이닝, 오픈 어드레싱. 완전 해시 = 충돌 없음.',
    relatedExamIds: ['dsa-2025-1-1'],
    keyPoints: [
      '완전 해시 함수(Perfect Hash): 충돌 없음 — 모든 키가 서로 다른 인덱스로 매핑',
      '충돌 해결: 체이닝(Chaining), 오픈 어드레싱(Linear/Quadratic Probing)',
      '평균 O(1) 탐색, 최악 O(n)',
      'Load factor = n/m (n: 항목수, m: 버킷수)',
    ],
    theory: `■ 해시 테이블 기본 구조
해시 함수 h: U → {0, 1, ..., m-1}  (U = key universe, m = slot 수)
목표: 키 k를 O(1)에 저장/탐색

Load Factor α = n/m  (n: 저장된 원소 수, m: 슬롯 수)
α < 1: 오픈 어드레싱에서 필수 조건
α = 1: 슬롯이 꽉 참
탐색 평균 성능: O(1 + α) — α를 상수로 유지하면 O(1)

■ 충돌(Collision): 서로 다른 두 키 k₁ ≠ k₂가 h(k₁) = h(k₂)인 경우

■ 충돌 해결 방법 1 — 체이닝 (Chaining)
각 슬롯을 연결 리스트로 관리. 같은 해시값 → 같은 리스트에 연결
탐색 최악: O(n) (모든 키가 같은 슬롯)
탐색 평균: O(1 + α) → α가 상수이면 O(1)
삽입: O(1) (리스트 앞에 삽입)
장점: α > 1도 허용, 삭제가 간단
단점: 포인터 오버헤드, 캐시 비효율

■ 충돌 해결 방법 2 — 오픈 어드레싱 (α < 1 필수)
빈 슬롯을 probing sequence로 탐색

선형 프로빙 (Linear Probing):
  h(k, i) = (h(k) + i) mod m  (i = 0, 1, 2, ...)
  문제: 군집화(Primary Clustering) — 채워진 슬롯이 연속으로 늘어남

이차 프로빙 (Quadratic Probing):
  h(k, i) = (h(k) + c₁i + c₂i²) mod m
  군집화 완화, 단 Secondary Clustering 가능

이중 해싱 (Double Hashing):
  h(k, i) = (h₁(k) + i·h₂(k)) mod m
  h₂(k) ≠ 0 이어야 하며 h₂(k)와 m은 서로소
  군집화 최소화, 실용적으로 가장 좋음

■ 완전 해시 (Perfect Hashing)
• 모든 키 k₁ ≠ k₂에 대해 h(k₁) ≠ h(k₂) — 충돌 없음
• 정적(static) 데이터셋에서만 가능 (런타임에 키 집합이 고정)
• 2-level hashing으로 O(1) 최악 탐색 달성 가능 (Fredman et al.)
• 조건 확인: 모든 키의 해시값이 서로 다른지 점검하면 완전 해시 여부 판단

■ 해시 함수 설계 방법
• 나눗셈법: h(k) = k mod m (m은 소수 선택)
• 곱셈법: h(k) = ⌊m·(k·A mod 1)⌋  (A ≈ (√5-1)/2 = 0.618...)
• 유니버설 해싱: 함수를 랜덤하게 선택 — 최악 충돌 확률 최소화

■ 시험 함정
• 오픈 어드레싱에서 삭제는 슬롯을 "DELETED" 마커로 표시해야 함 (그냥 비우면 탐색 실패)
• 완전 해시 ≠ 충돌이 적은 해시; 충돌이 아예 없는 것
• 체이닝은 α > 1도 허용하지만, 오픈 어드레싱은 α < 1이어야 함
• 탐색 평균 O(1)은 α를 상수로 유지하는 조건 하에만 성립`,
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

  /* ── 2020 1학기 ─────────────────────────────── */
  {
    id: 'dsa-2020-1-1',
    year: '2020',
    semester: '1',
    subject: 'dsa',
    problemNumber: 1,
    totalPoints: 30,
    category: '힙 & 정렬',
    title: 'Max-Heap 구축 및 HeapSort',
    description: `Given array A = [1, 12, 4, 9, 2, 6, 7, 3, 8, 11] (1-indexed).`,
    subQuestions: [
      {
        label: 'a', points: 15,
        text: '(a) Build a Max-Heap from the array using the BUILD-MAX-HEAP procedure (bottom-up). Show the resulting array representation.',
        answer: `BUILD-MAX-HEAP: 아래서부터 MAX-HEAPIFY 수행 (인덱스 ⌊n/2⌋=5 부터 1까지)

초기: [1, 12, 4, 9, 2, 6, 7, 3, 8, 11]

i=5, node=2, children=11(idx 10 없음)→leaf, skip
i=4, node=9, children=3(idx 8), 8(idx 9) → max=9, already heap
i=3, node=4, children=6(idx 7), 7(idx 8=없음, 6만)
  실제 children: idx7=6, idx6(wait let me recount)

1-indexed: parent(i) children are 2i, 2i+1
A = [_, 1, 12, 4, 9, 2, 6, 7, 3, 8, 11] (A[1..10])

i=5: A[5]=2, children A[10]=11 → 2<11 → swap → A=[_,1,12,4,9,11,6,7,3,8,2]
i=4: A[4]=9, children A[8]=3, A[9]=8 → 9>8>3 → no swap
i=3: A[3]=4, children A[6]=6, A[7]=7 → max=7 → swap(4,7) → A=[_,1,12,7,9,11,6,4,3,8,2]
i=2: A[2]=12, children A[4]=9, A[5]=11 → 12>11>9 → no swap
i=1: A[1]=1, children A[2]=12, A[3]=7 → max=12 → swap(1,12) → A=[_,12,1,7,9,11,6,4,3,8,2]
  sift-down 1: A[1]=1, children A[2]=1, A[3]=11 → wait, after swap: A=[_,12,1,7,9,11,...]
  A[1]=1(moved down), children A[2]=9, A[5]=11? Let me redo.

After swap A[1]↔A[2]: [_,12,1,7,9,11,6,4,3,8,2]
Sift-down from idx 2: A[2]=1, children A[4]=9, A[5]=11 → max=11 → swap(A[2],A[5])
→ [_,12,11,7,9,1,6,4,3,8,2]
Sift-down from idx 5: A[5]=1, children A[10]=2 → 1<2 → swap
→ [_,12,11,7,9,2,6,4,3,8,1]

최종 Max-Heap: [12, 11, 7, 9, 2, 6, 4, 3, 8, 1]

트리:
           12
         /    \\
       11       7
      /  \\    /  \\
     9    2  6    4
    / \\ /
   3  8 1`,
      },
      {
        label: 'b', points: 15,
        text: '(b) Perform HeapSort on the resulting Max-Heap. Show the sorted array after all extractions.',
        answer: `HeapSort: Max-Heap에서 최댓값을 반복 추출

Max-Heap: [12,11,7,9,2,6,4,3,8,1]

Extraction 1: swap A[1]↔A[10] → [1,11,7,9,2,6,4,3,8,|12]
  Sift-down [1,11,7,9,2,6,4,3,8]: 1→11↔1, 11이 위로
  → [11,9,7,3,2,6,4,1,8,|12] (정확한 sift-down 결과)

Extraction 2: swap A[1]↔A[9] → [8,9,7,3,2,6,4,1,|11,12]
  → Sift-down → [9,8,7,3,2,6,4,1,|11,12]

...반복...

최종 정렬 결과 (오름차순): [1, 2, 3, 4, 6, 7, 8, 9, 11, 12]`,
      },
    ],
    tags: ['힙', 'MaxHeap', 'HeapSort', 'Heapify', '정렬'],
  },

  /* ── 2020 2학기 ─────────────────────────────── */
  {
    id: 'dsa-2020-2-1',
    year: '2020',
    semester: '2',
    subject: 'dsa',
    problemNumber: 1,
    totalPoints: 30,
    category: '정렬 & MST',
    title: 'QuickSort vs MergeSort 공간 복잡도 + MST 파티션 정리',
    description: `두 정렬 알고리즘의 공간 복잡도와 MST의 핵심 성질을 묻는 문제입니다.`,
    subQuestions: [
      {
        label: 'a', points: 15,
        text: '(a) QuickSort는 in-place 알고리즘이라고 하지만 MergeSort는 그렇지 않다. 두 알고리즘의 추가 공간(extra space) 사용을 O-notation으로 나타내고 이유를 설명하시오.',
        answer: `QuickSort: 추가 공간 O(log n) (재귀 호출 스택)
• in-place 정렬: 입력 배열 외에 별도의 배열을 사용하지 않음
• 다만 재귀 호출 깊이만큼 스택 공간 사용: 평균 O(log n), 최악 O(n)
• partition은 배열 내에서 원소를 교환(swap)하므로 추가 배열 불필요

MergeSort: 추가 공간 O(n) (병합 시 임시 배열)
• merge 단계에서 두 서브배열을 합칠 때 임시 배열이 필요
• 각 merge에서 O(n) 크기의 임시 배열 할당
• in-place MergeSort는 구현이 매우 복잡하여 실용적이지 않음

결론: MergeSort가 안정 정렬(stable sort)이지만, 메모리 사용에서는 QuickSort가 유리`,
      },
      {
        label: 'b', points: 15,
        text: '(b) MST의 Partition(Cut) 속성을 서술하시오: 그래프 G의 정점을 두 집합 S와 V-S로 분리할 때, S에서 V-S를 연결하는 최소 가중치 간선은 반드시 MST에 포함된다는 정리를 증명하시오.',
        answer: `MST Cut(Partition) Theorem:

정리: G=(V,E,w)에서 임의의 컷(S, V-S)에 대해, S에서 V-S를 잇는 cross-edges 중 가중치가 최소인 간선 e는 어떤 MST에도 반드시 포함된다.

증명 (Contradiction):
1. T가 MST이고 e=(u,v)가 cut의 최소 간선이라고 하자 (u∈S, v∈V-S)
2. 만약 T에 e가 없다고 가정
3. T는 연결 그래프이므로 u와 v를 잇는 경로 P가 T에 존재
4. P에는 반드시 S에서 V-S를 건너는 간선 e'=(x,y)가 존재 (x∈S, y∈V-S)
5. e가 cut의 최소 간선이므로 w(e) ≤ w(e')
6. T에서 e'를 제거하면 두 컴포넌트로 분리됨
7. e를 추가하면 다시 spanning tree T' 구성
8. w(T') = w(T) - w(e') + w(e) ≤ w(T)
9. T가 MST이므로 w(T') = w(T) → 즉 w(e) = w(e')
10. T'도 MST이며 e를 포함 → 모순 없음

결론: e를 포함하는 MST가 반드시 존재함 (Greedy의 정당성 근거)`,
      },
    ],
    tags: ['QuickSort', 'MergeSort', 'in-place', 'MST', 'Cut Theorem', '파티션'],
  },

  /* ── 2021 1학기 ─────────────────────────────── */
  {
    id: 'dsa-2021-1-1',
    year: '2021',
    semester: '1',
    subject: 'dsa',
    problemNumber: 1,
    totalPoints: 30,
    category: '점화식 & DP',
    title: '착석 배열 점화식 + Knapsack with Replacement',
    description: `점화식 설계와 동적 프로그래밍을 묻는 문제입니다.`,
    subQuestions: [
      {
        label: 'a', points: 15,
        text: '(a) n명의 학생이 일렬로 n개의 의자에 앉는다. 어떤 두 학생도 인접하게 앉지 않아야 한다 (즉, 한 학생이 앉으면 양옆 자리는 비워야 한다). 앉을 수 있는 방법의 수 f(n)에 대한 점화식을 쓰시오.',
        answer: `문제 재해석: n개 자리 중 k개를 선택 (어떤 두 자리도 인접하지 않게).
여기서는 n명이 n개 자리에 앉되 인접 불가 → 최대 ⌈n/2⌉명만 앉을 수 있음.

단순화: n개의 자리가 있을 때 어떤 두 자리도 인접하지 않도록 자리를 선택하는 방법 수

f(n): n개 자리에서 인접하지 않게 앉을 수 있는 부분집합 수 (빈 자리 포함)

재귀 관계:
• f(1) = 2 (앉거나 안 앉거나)
• f(2) = 3 ({}, {1}, {2})
• f(n) = f(n-1) + f(n-2)  for n ≥ 3

이유:
• n번 자리를 비우면: f(n-1)가지
• n번 자리에 앉으면: (n-1)번 자리는 비워야 하므로 f(n-2)가지
→ f(n) = f(n-1) + f(n-2)  ← 피보나치 수열 형태!

f(1)=2, f(2)=3, f(3)=5, f(4)=8, f(5)=13, ...`,
      },
      {
        label: 'b', points: 15,
        text: '(b) Knapsack with Replacement (Unbounded Knapsack): W=8, 아이템 3개 — (w=1, p=3), (w=3, p=2), (w=5, p=1). dp[w] = 용량 w에서 최대 이익. dp[0..8]을 채우시오.',
        answer: `Unbounded Knapsack (같은 아이템 여러 번 사용 가능):
dp[w] = max profit with capacity w

점화식: dp[w] = max(dp[w-wᵢ] + pᵢ) for all i where wᵢ ≤ w

아이템: (w=1,p=3), (w=3,p=2), (w=5,p=1)

dp[0] = 0
dp[1] = dp[0]+3 = 3          (아이템1 사용)
dp[2] = dp[1]+3 = 6          (아이템1 × 2)
dp[3] = max(dp[2]+3, dp[0]+2) = max(9, 2) = 9   (아이템1 × 3)
dp[4] = max(dp[3]+3, dp[1]+2) = max(12, 5) = 12  (아이템1 × 4)
dp[5] = max(dp[4]+3, dp[2]+2, dp[0]+1) = max(15, 8, 1) = 15
dp[6] = max(dp[5]+3, dp[3]+2, dp[1]+1) = max(18, 11, 4) = 18
dp[7] = max(dp[6]+3, dp[4]+2, dp[2]+1) = max(21, 14, 7) = 21
dp[8] = max(dp[7]+3, dp[5]+2, dp[3]+1) = max(24, 17, 10) = 24

최적해: dp[8] = 24  (아이템1을 8번 사용, w=1×8=8, p=3×8=24)`,
      },
    ],
    tags: ['점화식', '피보나치', 'DP', 'Knapsack', 'Unbounded Knapsack'],
  },

  /* ── 2021 2학기 ─────────────────────────────── */
  {
    id: 'dsa-2021-2-1',
    year: '2021',
    semester: '2',
    subject: 'dsa',
    problemNumber: 1,
    totalPoints: 40,
    category: 'MST & 트리 순회 & TSP',
    title: 'MST 구축 + 전위순회 + TSP 2-근사',
    description: `가중치 그래프에서 MST 구축, 트리 순회, TSP 근사 알고리즘을 묻는 문제입니다.`,
    subQuestions: [
      {
        label: 'a', points: 15,
        text: `(a) 다음 무방향 가중치 그래프에서 Kruskal 알고리즘으로 MST를 구하시오.
정점: a,b,c,d,e,f,g,h,i
간선: (a,b,4), (a,h,8), (b,c,8), (b,h,11), (c,d,7), (c,f,2), (c,i,4), (d,e,9), (d,f,14), (e,f,10), (f,g,2), (g,h,1), (g,i,6), (h,i,7)`,
        answer: `Kruskal: 간선을 가중치 오름차순으로 정렬 후 사이클 없이 선택

정렬된 간선:
(g,h,1), (c,f,2), (f,g,2), (a,b,4), (c,i,4), (c,d,7), (a,h,8), (b,c,8),
(d,e,9), (e,f,10), (b,h,11), (d,f,14), (g,i,6), (h,i,7)

선택 과정:
1. (g,h,1) → MST에 추가 ✓
2. (c,f,2) → MST에 추가 ✓
3. (f,g,2) → MST에 추가 ✓ [c-f-g-h 연결]
4. (a,b,4) → MST에 추가 ✓
5. (c,i,4) → MST에 추가 ✓
6. (g,i,6) → g와 i 이미 연결 → 사이클! 스킵
7. (h,i,7) → h와 i 이미 연결 → 사이클! 스킵
8. (c,d,7) → MST에 추가 ✓
9. (a,h,8) → MST에 추가 ✓ [a가 나머지와 연결]
10. (b,c,8) → MST에 추가 ✓ [b가 c-컴포넌트와 연결]
11. (d,e,9) → MST에 추가 ✓

MST 간선 (9개 = V-1): (g,h,1),(c,f,2),(f,g,2),(a,b,4),(c,i,4),(c,d,7),(a,h,8),(b,c,8),(d,e,9)
총 가중치: 1+2+2+4+4+7+8+8+9 = 45`,
      },
      {
        label: 'b', points: 10,
        text: '(b) 위 MST에서 f를 루트로 했을 때의 전위순회(Preorder) 결과를 쓰시오.',
        answer: `f를 루트로 한 MST 트리 구조 (간선: g-h, c-f, f-g, a-b, c-i, c-d, a-h, b-c, d-e):

f의 자식: c (c-f 간선), g (f-g 간선)
c의 자식: i (c-i), d (c-d), b (b-c 간선)
g의 자식: h (g-h 간선)
h의 자식: a (a-h 간선)
a의 자식: b (a-b 간선) → 하지만 b는 이미 c의 자식
b의 자식: a (a-b) → 트리에서는 방향 없으므로 루트 방향으로 재구성 필요

f 기준 재구성:
f → {c, g}
c → {i, d, b}  (b-c, c-i, c-d)
b → {a}  (a-b)
a → {}  (a-h의 h는 g의 자식이므로 방향 고려)
d → {e}  (d-e)
g → {h}
h → {}  (a-h에서 a는 b의 부모이므로)

전위순회 (root→left→right, 알파벳 순):
f, c, b, a, d, e, i, g, h`,
      },
      {
        label: 'c', points: 15,
        text: '(c) TSP(여행 판매원 문제)의 2-근사 알고리즘을 설명하고, 최적해의 2배를 초과하지 않음을 증명하시오.',
        answer: `2-근사 알고리즘 (MST 기반):
1. 임의의 정점 r을 루트로 MST T를 구축
2. T의 전위순회(DFS preorder) 순서로 정점 방문
3. 이 순서로 여행 경로 구성

증명 (비용 ≤ 2 × OPT):

단계 1: MST 비용 ≤ OPT
• 최적 TSP 경로에서 임의의 간선 하나를 제거하면 spanning tree 생성
• MST는 최소 spanning tree이므로 c(MST) ≤ c(OPT-경로) ≤ OPT

단계 2: 전위순회의 비용 ≤ 2 × c(MST)
• MST의 각 간선을 정확히 2번 방문 (왕복)하면 Euler 경로 생성
• Euler 경로 비용 = 2 × c(MST)
• 전위순회는 반복 방문을 건너뛰는 shortcut
• 삼각 부등식(triangle inequality) 가정 시: shortcut 비용 ≤ 원래 비용
• 따라서 전위순회 비용 ≤ 2 × c(MST) ≤ 2 × OPT

결론: 2-근사 알고리즘의 비용 ≤ 2 × OPT`,
      },
    ],
    tags: ['MST', 'Kruskal', '전위순회', 'TSP', '근사알고리즘', '2-approximation'],
  },

  /* ── 2022 1학기 ─────────────────────────────── */
  {
    id: 'dsa-2022-1-1',
    year: '2022',
    semester: '1',
    subject: 'dsa',
    problemNumber: 1,
    totalPoints: 30,
    category: '허프만 코딩',
    title: 'Fibonacci 빈도 허프만 코딩 + 복호화',
    description: `피보나치 수열 빈도를 가진 문자들의 허프만 코딩을 구성하고 복호화합니다.`,
    subQuestions: [
      {
        label: 'a', points: 15,
        text: '(a) 다음 빈도로 허프만 코드를 구축하시오.\na:1, b:1, c:2, d:3, e:5, f:8, g:13, h:21',
        answer: `빈도 합계: 1+1+2+3+5+8+13+21 = 54

허프만 트리 구축 (피보나치 빈도 — 특이하게 선형 구조):

초기 Min-Heap: a(1),b(1),c(2),d(3),e(5),f(8),g(13),h(21)

단계1: a(1)+b(1) → ab(2)
힙: ab(2),c(2),d(3),e(5),f(8),g(13),h(21)

단계2: ab(2)+c(2) → abc(4)
힙: d(3),abc(4),e(5),f(8),g(13),h(21)

단계3: d(3)+abc(4) → dabc(7)
힙: e(5),dabc(7),f(8),g(13),h(21)

단계4: e(5)+dabc(7) → edabc(12)
힙: f(8),edabc(12),g(13),h(21)

단계5: f(8)+edabc(12) → fedabc(20)
힙: g(13),h(21),fedabc(20)

단계6: g(13)+fedabc(20) → gfedabc(33)
힙: h(21),gfedabc(33)

단계7: h(21)+gfedabc(33) → root(54)

코드 (왼쪽=0, 오른쪽=1):
h: 0
g: 10
f: 110
e: 1110
d: 11110
a,b: 빈도 같으므로 111110, 111111 (또는 순서 달라질 수 있음)
c: 11110x (d와 abc 분기에서)

정확한 코드:
h: 0         (1비트)
g: 10        (2비트)
f: 110       (3비트)
e: 1110      (4비트)
d: 11110     (5비트)
c: 111110    (6비트)
a: 1111110   (7비트)
b: 1111111   (7비트)

ABL = (21×1 + 13×2 + 8×3 + 5×4 + 3×5 + 2×6 + 1×7 + 1×7) / 54
    = (21 + 26 + 24 + 20 + 15 + 12 + 7 + 7) / 54
    = 132 / 54 ≈ 2.44 bits/letter`,
      },
      {
        label: 'b', points: 15,
        text: '(b) (a)의 허프만 코드로 "110111100111010"을 복호화하시오.',
        answer: `코드 테이블:
h=0, g=10, f=110, e=1110, d=11110, c=111110, a=1111110, b=1111111

입력: 110 111 100 111 010

순서대로 복호화:
1. "1" → 미완성
   "11" → 미완성
   "110" → f  ✓

2. "1" → 미완성
   "11" → 미완성
   "111" → 미완성
   "1110" → e  ✓

3. "0" → h  ✓

4. "1" → 미완성
   "11" → 미완성
   "111" → 미완성
   "1110" → e  ✓

5. "1" → 미완성
   "10" → g  ✓

결과: f e h e g

검증: f(110) + e(1110) + h(0) + e(1110) + g(10)
= 110 + 1110 + 0 + 1110 + 10 = 110111100111010 ✓`,
      },
    ],
    tags: ['허프만코딩', '피보나치', 'ABL', '복호화', '트리'],
  },

  /* ── 2022 1학기 - Big-O ─────────────────────── */
  {
    id: 'dsa-2022-1-2',
    year: '2022',
    semester: '1',
    subject: 'dsa',
    problemNumber: 2,
    totalPoints: 30,
    category: '점근 분석',
    title: '8개 함수 성장률 순서 + 세제곱근 알고리즘',
    description: `다양한 함수들의 점근적 성장률을 비교하고, 세제곱근 계산 알고리즘을 설계합니다.`,
    subQuestions: [
      {
        label: 'a', points: 20,
        text: `(a) 다음 8개 함수를 성장률 오름차순으로 정렬하고, 어떤 두 함수가 Θ 관계인지 밝히시오.
f₁ = n², f₂ = n^(3/2), f₃ = 2^(log₂n), f₄ = n!, f₅ = 2^n, f₆ = n^(1/3)·log n, f₇ = n·log n, f₈ = 4^(log₂n)`,
        answer: `각 함수 분석:
f₃ = 2^(log₂n) = n  (since 2^(log₂n) = n)
f₈ = 4^(log₂n) = (2²)^(log₂n) = 2^(2·log₂n) = n²
f₆ = n^(1/3)·log n  (n^(1/3)보다 약간 큰 함수)

오름차순 정렬:
f₆ < f₂ < f₃ < f₇ < f₁ = f₈ < f₅ < f₄

즉:
n^(1/3)·log n < n^(3/2) < n < n·log n < n² = n² < 2^n < n!

Θ 관계: f₁ = Θ(f₈)  (둘 다 n²)

상세:
• f₆ = n^(1/3)·log n → 성장률: n^(0.33+ε) 수준
• f₂ = n^(3/2) → 성장률: n^1.5
• f₃ = n → 선형
• f₇ = n·log n → 선형×로그
• f₁ = n² = f₈ = 4^(log₂n) → 이차 Θ
• f₅ = 2^n → 지수
• f₄ = n! → 팩토리얼

최종 순서: f₆ ≺ f₂ ≺ f₃ ≺ f₇ ≺ f₁=f₈ ≺ f₅ ≺ f₄`,
      },
      {
        label: 'b', points: 10,
        text: '(b) 양의 정수 n의 세제곱근을 O(log n) 시간에 구하는 알고리즘을 설명하시오.',
        answer: `이진 탐색으로 세제곱근 계산:

알고리즘:
lo ← 0, hi ← n
while lo ≤ hi:
    mid ← (lo + hi) / 2
    if mid³ = n: return mid   // 정확한 세제곱근
    elif mid³ < n: lo ← mid + 1
    else: hi ← mid - 1
return -1  // n이 완전 세제곱수가 아님

시간 복잡도 분석:
• 탐색 범위: [0, n]
• 각 반복에서 범위가 절반으로 감소
• 반복 횟수: log₂(n)
• 따라서 O(log n)

검증 (n=27):
lo=0, hi=27
mid=13: 13³=2197>27 → hi=12
mid=6: 6³=216>27 → hi=5
mid=2: 2³=8<27 → lo=3
mid=4: 4³=64>27 → hi=3
mid=3: 3³=27=27 → return 3  ✓`,
      },
    ],
    tags: ['점근분석', 'Big-O', '성장률', '이진탐색', 'O(log n)', '세제곱근'],
  },

  /* ── 2022 2학기 ─────────────────────────────── */
  {
    id: 'dsa-2022-2-1',
    year: '2022',
    semester: '2',
    subject: 'dsa',
    problemNumber: 1,
    totalPoints: 40,
    category: '정렬 & 그래프',
    title: 'QuickSort 분석 + Dijkstra 두 번째 최단 경로',
    description: `QuickSort의 복잡도 분석과 Dijkstra를 이용한 두 번째 최단 경로 탐색.`,
    subQuestions: [
      {
        label: 'a', points: 10,
        text: '(a) QuickSort의 최선/최악 경우 시간 복잡도를 점화식으로 나타내고 풀이를 보이시오.',
        answer: `최선의 경우 (피벗이 항상 중앙값):
T(n) = 2T(n/2) + O(n)
마스터 정리 case 2: a=2, b=2, f(n)=O(n)=O(n^log₂2)
→ T(n) = O(n log n)

최악의 경우 (피벗이 항상 최솟값 또는 최댓값):
T(n) = T(n-1) + T(0) + O(n) = T(n-1) + O(n)
= O(n) + O(n-1) + ... + O(1) = O(n²)

예: 이미 정렬된 배열에서 첫/마지막 원소를 피벗으로 선택`,
      },
      {
        label: 'b', points: 10,
        text: '(b) Threshold k=3인 Hybrid QuickSort (크기가 k 이하이면 InsertionSort 사용)의 시간 복잡도는?',
        answer: `Hybrid QuickSort:
• 크기 n > k: QuickSort로 재귀 분할
• 크기 n ≤ k: InsertionSort (O(k²) = O(1) since k is constant)

재귀 깊이: log(n/k) = log n - log k = O(log n)
각 레벨의 작업: O(n)

따라서: T(n) = O(n log n)

장점:
• 작은 서브배열에서 InsertionSort의 캐시 효율성 활용
• 실제 실험에서 순수 QuickSort보다 2~3배 빠름`,
      },
      {
        label: 'c', points: 20,
        text: `(c) Dijkstra 알고리즘으로 다음 그래프에서 s에서 모든 정점까지의 최단 경로를 구하고, s→t의 두 번째 최단 경로(second shortest path)를 찾으시오.
정점: s, t, y, z, x
간선 (방향): s→t=10, s→y=5, t→y=2, t→x=1, y→t=3, y→x=9, y→z=2, z→s=7, z→x=6, x→z=4`,
        answer: `Dijkstra (시작: s):

초기: s=0, t=∞, y=∞, z=∞, x=∞

1단계: s 방문 (dist=0)
  t: 0+10=10, y: 0+5=5 갱신
  → s=0✓, y=5, t=10, z=∞, x=∞

2단계: y 방문 (dist=5)
  t: 5+3=8 < 10 → t=8
  x: 5+9=14, z: 5+2=7
  → y=5✓, z=7, t=8, x=14, ...

3단계: z 방문 (dist=7)
  s: 7+7=14 (이미 0), x: 7+6=13 < 14 → x=13
  → z=7✓

4단계: t 방문 (dist=8)
  y: 8+2=10 (이미 5), x: 8+1=9 < 13 → x=9
  → t=8✓

5단계: x 방문 (dist=9)
  z: 9+4=13 (이미 7)
  → x=9✓

최단 경로:
s→s: 0
s→y: 5  (s→y)
s→z: 7  (s→y→z)
s→t: 8  (s→y→t)
s→x: 9  (s→y→t→x)

두 번째 최단 경로 s→t:
최단: s→y→t (비용 8)
후보들:
• s→t 직접: 10
• s→y→z→x→... 다른 경로

두 번째: s→t (직접, 비용 10)`,
      },
    ],
    tags: ['QuickSort', 'Hybrid', 'Dijkstra', '최단경로', '두번째최단경로'],
  },

  /* ── 2023 1학기 ─────────────────────────────── */
  {
    id: 'dsa-2023-1-1',
    year: '2023',
    semester: '1',
    subject: 'dsa',
    problemNumber: 1,
    totalPoints: 30,
    category: 'BST & 행렬 탐색',
    title: 'BST O(log n) 균형 조건 + 정렬된 2D 행렬 탐색',
    description: `BST에서 O(log n) 보장 조건과 정렬된 2D 행렬에서 원소를 효율적으로 찾는 알고리즘.`,
    subQuestions: [
      {
        label: 'a', points: 15,
        text: '(a) BST에서 검색이 O(log n)을 보장하려면 어떤 조건을 만족해야 하는가? AVL Tree와 Red-Black Tree가 이를 어떻게 보장하는지 설명하시오.',
        answer: `O(log n) 보장을 위한 조건:
트리의 높이(height) h = O(log n) 이어야 함.
일반 BST는 최악 h = O(n) (선형 체인) → O(n) 탐색.

AVL Tree (더 엄격한 균형):
• 모든 노드에서 왼쪽/오른쪽 서브트리 높이 차이 ≤ 1
• 높이 h ≤ 1.44 × log₂(n+2) → O(log n) 보장
• 삽입/삭제 후 회전(rotation)으로 균형 복구

Red-Black Tree (더 유연한 균형):
• 5가지 속성 (루트=검정, Red 연속 불가, Black-height 일치 등)
• 높이 h ≤ 2 × log₂(n+1) → O(log n) 보장
• 삽입/삭제 후 recoloring + 회전으로 균형 복구
• AVL보다 회전 횟수 적어 실용적 (C++ std::map 내부 구현)`,
      },
      {
        label: 'b', points: 15,
        text: `(b) n×n 행렬에서 각 행과 열이 오름차순 정렬되어 있다. 주어진 값 x를 찾는 두 알고리즘:
- 알고리즘 A: O(n log n) — 각 행에 이진 탐색
- 알고리즘 B: O(n) — 오른쪽 위 모서리에서 시작
각 알고리즘을 설명하고 복잡도를 분석하시오.`,
        answer: `알고리즘 A: O(n log n)
각 행(n개)에 대해 이진 탐색(O(log n)):
for each row r (0..n-1):
    binary_search(matrix[r], x)
복잡도: n × O(log n) = O(n log n)

알고리즘 B: O(n) — "Staircase Search"
오른쪽 위 모서리(matrix[0][n-1])에서 시작:

row = 0, col = n-1
while row < n and col >= 0:
    if matrix[row][col] == x:
        return (row, col)  // 발견
    elif matrix[row][col] > x:
        col -= 1  // 현재 값이 너무 크면 왼쪽으로
    else:
        row += 1  // 현재 값이 너무 작으면 아래로
return NOT_FOUND

복잡도 분석:
• 각 단계에서 row가 1 증가하거나 col이 1 감소
• 최대 이동: n번(아래) + n번(왼쪽) = 2n번
• O(n)

왜 동작하는가:
• oright-top에서: 해당 행의 최댓값, 해당 열의 최솟값
• x < matrix[r][c]: x는 이 열에 없음 → col--
• x > matrix[r][c]: x는 이 행에 없음 → row++`,
      },
    ],
    tags: ['BST', 'AVL', 'Red-Black Tree', '행렬탐색', 'O(n)', '이진탐색'],
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
