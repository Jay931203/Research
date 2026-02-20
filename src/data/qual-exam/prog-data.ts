import type { StudyTopic } from '@/components/qual-exam/TopicStudyCard';
import type { ExamProblem } from '@/components/qual-exam/ExamProblemCard';
import type { QuizQuestion } from '@/components/qual-exam/PracticeQuiz';

/* ═══════════════════════════════════════════════════
   PROGRAMMING TOPICS (프로그래밍의 기초)
═══════════════════════════════════════════════════ */
export const PROG_TOPICS: StudyTopic[] = [
  {
    id: 'oop-basics',
    title: 'OOP 기초 — 클래스와 객체',
    titleEn: 'OOP Basics — Classes & Objects',
    icon: '🏗️',
    difficulty: 'basic',
    examFrequency: 3,
    keyPoints: [
      '클래스: 데이터(멤버 변수)와 동작(멤버 함수)의 묶음',
      '생성자: 객체 초기화, 소멸자: 자원 해제',
      'public/private/protected 접근 제어',
      '기본 생성자: 컴파일러가 자동 생성 (단, 사용자 정의 생성자가 없을 때)',
    ],
    theory: `■ 클래스 기본 구조 (C++)

class MyClass {
private:
    int data_;           // 멤버 변수 (캡슐화)
    char* name_;
public:
    MyClass(int d);      // 생성자
    MyClass(const MyClass& other);  // 복사 생성자
    ~MyClass();          // 소멸자
    int getData() const; // const 멤버 함수 (객체 변경 안 함)
};

■ 생성자 초기화 리스트 (Initialization List)
MyClass::MyClass(int d) : data_(d), name_(nullptr) {}
// 멤버 변수를 생성과 동시에 초기화 (더 효율적)

■ 접근 제어
• private: 클래스 내부에서만 접근
• public: 외부에서 접근 가능
• protected: 파생 클래스에서 접근 가능`,
    codeExample: `class Student {
private:
    int id_;
    char* name_;
public:
    Student(const char* name, int id) : id_(id) {
        name_ = new char[strlen(name) + 1];
        strcpy(name_, name);
    }
    ~Student() { delete[] name_; }
    void getInfo() const {
        cout << "Name: " << name_ << ", ID: " << id_ << endl;
    }
};`,
  },
  {
    id: 'constructors',
    title: '생성자·소멸자·Rule of Three',
    titleEn: 'Constructors, Destructors & Rule of Three',
    icon: '⚙️',
    difficulty: 'intermediate',
    examFrequency: 5,
    keyPoints: [
      'Rule of Three: 소멸자, 복사 생성자, 복사 대입 연산자 — 셋 중 하나를 정의하면 나머지도 정의해야 함',
      '얕은 복사(Shallow Copy): 포인터만 복사 → 더블 프리(double-free) 위험!',
      '깊은 복사(Deep Copy): 메모리 새로 할당 + 내용 복사',
      '컴파일러 생성 복사 생성자는 얕은 복사를 수행함',
    ],
    theory: `■ Rule of Three (시험 핵심!)
포인터 멤버 변수가 있으면 반드시 셋 다 정의:

class Student {
    char* name_;
public:
    // 1. 소멸자
    ~Student() { delete[] name_; }

    // 2. 복사 생성자 (깊은 복사)
    Student(const Student& other) : id_(other.id_) {
        name_ = new char[strlen(other.name_) + 1];
        strcpy(name_, other.name_);
    }

    // 3. 복사 대입 연산자
    Student& operator=(const Student& other) {
        if (this == &other) return *this;  // 자기 대입 방지
        delete[] name_;                    // 기존 메모리 해제
        name_ = new char[strlen(other.name_) + 1];
        strcpy(name_, other.name_);
        id_ = other.id_;
        return *this;
    }
};

■ 2024년 2학기 기출 오류 분석
Student s1("mina", 10);
Student s2 = s1;  // 컴파일러 생성 복사 생성자 → 얕은 복사!
// s1.name_ == s2.name_ (같은 메모리 주소 공유!)
s2.setID(20);
// 함수 종료 시: ~s2() → delete[] name_ → ~s1() → delete[] name_ (이미 해제됨!)
// → double-free → undefined behavior (crash)`,
    codeExample: `// 올바른 복사 생성자 구현
Student(const Student& other) : id_(other.id_) {
    name_ = new char[strlen(other.name_) + 1];
    strcpy(name_, other.name_);
}

// 올바른 소멸자 (포인터 배열 해제)
~Student() { delete[] name_; }`,
    commonPitfalls: [
      '포인터를 멤버로 가질 때 컴파일러 생성 복사 생성자는 얕은 복사 → 반드시 직접 정의',
      'delete vs delete[]: 배열은 반드시 delete[]',
      '자기 대입(s = s) 처리를 복사 대입 연산자에서 빠뜨리면 위험',
    ],
  },
  {
    id: 'virtual-functions',
    title: '가상 함수와 다형성',
    titleEn: 'Virtual Functions & Polymorphism',
    icon: '🔄',
    difficulty: 'advanced',
    examFrequency: 5,
    keyPoints: [
      'virtual 키워드: 런타임 다형성 지원 (동적 디스패치)',
      '순수 가상 함수: virtual void f() = 0; → 추상 클래스',
      '가상 소멸자: 기반 클래스 포인터로 삭제 시 반드시 필요',
      'vtable: 가상 함수 포인터 테이블, 런타임에 호출 결정',
      '비가상 함수는 정적 바인딩 (컴파일 타임에 결정)',
    ],
    theory: `■ 동적 디스패치 규칙
virtual 함수: 실제 객체 타입에 따라 호출 결정 (런타임)
non-virtual 함수: 선언된 포인터/참조 타입에 따라 결정 (컴파일 타임)

■ 2024년 2학기 기출 코드 분석
class Student {
    virtual void m1() { cout << "ss::m1"; }
    virtual void m2() { cout << "ss::m2"; }
    void m3() { m2(); cout << "ss::m3"; }  // non-virtual!
    void m4() { m3(); cout << "ss::m4"; }  // non-virtual!
};
class GradStudent : public Student {
    void m1() { cout << "gs::m1"; }     // Student::m1 override
    virtual void m2() { cout << "gs::m2"; }  // Student::m2 override
    void m3() { m1(); cout << "gs::m3"; }    // non-virtual
};
class PhD : public GradStudent {
    void m1() { cout << "phd::m1"; }    // GradStudent::m1 override
    virtual void m3() { m4(); cout << "phd::m3"; }  // NEW virtual!
};

■ 핵심 추적 규칙
• ss->m1(): m1은 virtual → 실제 객체(PhD)의 m1 호출 → "phd::m1"
• ss->m3(): m3은 non-virtual Student 버전 → Student::m3() 실행
  내부 m2() 호출: m2는 virtual → PhD 객체의 가장 파생 m2 = GradStudent::m2 → "gs::m2"
  그 다음: "ss::m3"
• mina->m3(): PhD* → PhD::m3 (virtual) → m4() 호출
  m4는 non-virtual → Student::m4() → m3() 호출 (virtual) → PhD::m3() → 무한 재귀!

■ 순수 가상 함수 (Pure Virtual Function)
virtual void area() const = 0;  // = 0으로 선언
→ 추상 클래스(Abstract Class): 직접 인스턴스화 불가
→ 파생 클래스에서 반드시 override해야 함`,
    codeExample: `// 2025년 2학기 기출 패턴
struct Shape {
    virtual ~Shape() {}              // 가상 소멸자 (필수!)
    virtual double area() const = 0; // 순수 가상 함수
    virtual Shape* clone() const = 0;
};

struct Circle : public Shape {
    double r;
    Circle(double rr) : r(rr) {}
    double area() const { return 3.14159 * r * r; }
    Shape* clone() const { return new Circle(*this); } // 자신 복사
};`,
    commonPitfalls: [
      '기반 클래스에 가상 소멸자가 없으면 기반 클래스 포인터로 delete 시 파생 클래스 소멸자가 호출 안 됨',
      'virtual이 아닌 함수는 포인터 타입 기준으로 호출됨 (오해 주의)',
      '순수 가상 함수가 있는 추상 클래스는 인스턴스화 불가',
    ],
  },
  {
    id: 'memory-management',
    title: '메모리 관리 & 포인터',
    titleEn: 'Memory Management & Pointers',
    icon: '💾',
    difficulty: 'intermediate',
    examFrequency: 5,
    keyPoints: [
      'new/delete: 힙 메모리 동적 할당/해제',
      'delete vs delete[]: 배열은 반드시 delete[]',
      '포인터 역참조: *ptr, 주소: &var',
      '포인터 산술: ptr+1은 sizeof(*ptr)바이트 이동',
      '세그멘테이션 폴트(Segfault): 유효하지 않은 메모리 접근',
    ],
    theory: `■ 메모리 영역
• 스택(Stack): 지역 변수, 함수 인수 → 자동 관리
• 힙(Heap): new로 할당 → 명시적 delete 필요
• 전역/정적: 프로그램 시작부터 끝까지

■ 포인터 기본
int x = 10;
int* ptr = &x;    // ptr은 x의 주소 저장
*ptr = 20;        // x를 20으로 변경 (역참조)

// 배열과 포인터
int arr[5] = {1,2,3,4,5};
int* p = arr;     // p는 arr[0]의 주소
p[1] = *(p+1);    // arr[1]에 접근

■ 2025년 2학기 기출: Segfault 분석
class Buffer {
    size_t n_; int* data_;
public:
    Buffer(size_t n): n_(n), data_(new int[n]) {}
    ~Buffer() { delete data_; }      // Bug 1: delete[] 사용해야 함!
    int& at(size_t i) { return data_[i]; }
};
void fill_with(Buffer& b, int v) {
    for (size_t i=0; i<=b.size(); ++i)  // Bug 2: i<b.size() 여야 함 (off-by-one)
        b.at(i) = v;                     // i==n일 때 out-of-bounds!
}

■ 2024년 1학기 기출: 포인터 배열과 버블 정렬
int items[5] = {16,9,28,12,1};
int* pitems[5];          // 포인터의 배열!
pitems[0] = items;       // pitems[0] = &items[0]
for(int i=1;i<5;i++) pitems[i] = pitems[i-1]+1;  // 포인터 산술

void swap(int* a, int* b) {
    int* tmp; tmp=a; a=b; b=tmp;  // Bug: 포인터 값만 지역 복사됨!
    // 실제로는 a,b가 지역 변수이므로 원래 배열에 영향 없음
}
if(pitems[j] > pitems[j+1])  // 포인터 주소 비교! (값 비교 아님)
// pitems는 이미 주소 오름차순 정렬 → 항상 false → swap 안 일어남
출력 B: 16, 9, 28, 12, 1  (pitems 기준 원래 순서)
출력 C: 16, 9, 28, 12, 1  (items 배열 변경 없음)`,
    codeExample: `// 올바른 포인터 swap
void swap(int* a, int* b) {
    int tmp = *a;  // 값 역참조!
    *a = *b;
    *b = tmp;
}

// 배열 동적 할당/해제
int* arr = new int[10];
// ... 사용
delete[] arr;  // 배열은 delete[] !`,
    commonPitfalls: [
      'delete vs delete[]: 배열은 반드시 delete[]',
      '오프-바이-원(off-by-one): for (i=0; i<=n; i++) → i<n이어야 함',
      '지역 변수로 포인터를 swap하면 원본에 영향 없음',
      '포인터 주소 비교(ptr1 > ptr2)는 메모리 주소 비교임 (값 비교 아님)',
    ],
  },
  {
    id: 'templates',
    title: '템플릿 (Templates)',
    titleEn: 'C++ Templates',
    icon: '🧬',
    difficulty: 'advanced',
    examFrequency: 4,
    keyPoints: [
      'template<typename T>: 타입 파라미터화',
      '클래스 템플릿: 임의의 타입으로 동작하는 컨테이너',
      '템플릿 인스턴스화: 컴파일 타임에 구체 타입으로 생성',
      'Pair<LinkedList>가 컴파일 안 되는 이유: LinkedList가 필요한 연산을 지원하지 않을 때',
    ],
    theory: `■ 클래스 템플릿 기본
template<typename T>
class Pair {
private:
    T* first;
    T* second;
public:
    Pair(T* a, T* b) : first(a), second(b) {}
    void add(const Pair& other) { *first += *(other.first); }
};

■ 2025년 1학기 기출: Pair 클래스

int data[4] = {1,2,3,4};
Pair a(data, data+2);    // first=&data[0]=1, second=&data[2]=3
Pair b(data+1, data+3);  // first=&data[1]=2, second=&data[3]=4
a.add(b);                // data[0]+=data[1] → data[0]=3; data[2]+=data[3] → data[2]=7
a.print();               // 출력: (3, 7)

■ Pair<LinkedList> 컴파일 실패 이유
template<typename T>에서 Pair를 사용하면:
• add() 내부: *first += *(other.first) → LinkedList에 += 연산자 없음
• 또는 복사 생성자가 필요할 수 있음

해결: LinkedList에 필요한 연산자 선언 추가
(시험에서는 함수 헤더만 선언하면 됨)`,
    codeExample: `template<typename T>
class Pair {
private:
    T* first;
    T* second;
public:
    Pair(T* a, T* b) : first(a), second(b) {}
    void add(const Pair<T>& other) {
        *first += *(other.first);
        *second += *(other.second);
    }
    void print() {
        cout << "(" << *first << "," << *second << ")" << endl;
    }
};`,
    commonPitfalls: [
      '템플릿 클래스의 멤버 함수는 헤더 파일에 정의해야 함 (분리 컴파일 불가)',
      'Pair<T>를 사용할 때 T가 필요한 연산(+=, 복사 등)을 지원해야 함',
    ],
  },
  {
    id: 'linked-list-impl',
    title: '연결 리스트 구현 (C++)',
    titleEn: 'Linked List Implementation in C++',
    icon: '🔗',
    difficulty: 'intermediate',
    examFrequency: 4,
    keyPoints: [
      '소멸자에서 모든 노드 순회하여 delete',
      '재귀적 뒤집기: reverseHelper(node, prev)',
      '반복적 뒤집기: 세 포인터(prev, curr, next) 사용',
    ],
    theory: `■ 2025년 1학기 기출: LinkedList 구현

// 노드 클래스
class Node {
public:
    int data;
    Node* next;
    Node(int val, Node* nextNode = nullptr) : data(val), next(nextNode) {}
};

// LinkedList
class LinkedList {
    Node* head;
public:
    LinkedList() : head(nullptr) {}

    // append: 앞에 추가! (prepend)
    void append(int val) { head = new Node(val, head); }
    // list1.append(3); list1.append(2); list1.append(1);
    // 결과: 1 -> 2 -> 3 (마지막 추가된 1이 head)

// 1. 소멸자 완성
LinkedList::~LinkedList() {
    Node* current = head;
    while (current) {
        Node* next = current->next;  // 다음 노드 저장
        delete current;              // 현재 삭제
        current = next;              // 다음으로 이동
    }
}

// 2. reverseHelper 완성 (재귀, 2줄 해답)
Node* LinkedList::reverseHelper(Node* node, Node* prev) {
    if (!node) return prev;
    Node* next = node->next;   // 다음 노드 저장
    node->next = prev;         // 링크 뒤집기
    return reverseHelper(next, node);  // 재귀
}
void LinkedList::reverse() {
    head = reverseHelper(head, nullptr);
}

■ 반복적 뒤집기 (참고)
void reverse_iter() {
    Node* prev = nullptr;
    Node* curr = head;
    while (curr) {
        Node* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    head = prev;
}`,
    codeExample: `// 소멸자: 모든 노드 삭제
LinkedList::~LinkedList() {
    Node* current = head;
    while (current) {
        Node* next = current->next;
        delete current;
        current = next;
    }
}

// reverseHelper (재귀, 레퍼런스 해답 2줄)
Node* LinkedList::reverseHelper(Node* node, Node* prev) {
    if (!node) return prev;
    Node* next = node->next;   // 이 줄
    node->next = prev;          // 이 줄
    return reverseHelper(next, node);
}`,
    commonPitfalls: [
      '소멸자에서 현재 노드를 delete하기 전에 next 포인터를 저장해야 함',
      '재귀 뒤집기에서 base case(!node)가 prev를 반환함',
    ],
  },
  {
    id: 'stack-queue-impl',
    title: 'Stack & Queue 구현',
    titleEn: 'Stack & Queue Implementation',
    icon: '📚',
    difficulty: 'basic',
    examFrequency: 4,
    keyPoints: [
      'Stack: LIFO, top 포인터 (배열 기반: top=-1)',
      'Queue: FIFO, front/rear 포인터 (배열 기반)',
      'isEmpty: top==-1 (Stack), front==rear (Queue)',
      '오버플로우/언더플로우 처리',
    ],
    theory: `■ 2025년 2학기 기출: Stack & Queue 구현

#define MAX 5

// Stack (배열 기반)
class Stack {
    int arr[MAX];
    int top;
public:
    Stack() { top = -1; }

    void push(int x) {
        if (top < MAX-1)    // overflow 체크
            arr[++top] = x;
    }

    int pop() {
        if (top == -1) return -1;  // underflow
        return arr[top--];
    }

    bool isEmpty() { return top == -1; }
};

// Queue (배열 기반, 단순)
class Queue {
    int arr[MAX];
    int front, rear;
public:
    Queue() { front = 0; rear = 0; }

    void enqueue(int x) {
        if (rear < MAX)     // overflow 체크
            arr[rear++] = x;
    }

    int dequeue() {
        if (front == rear) return -1;  // empty
        return arr[front++];
    }

    bool isEmpty() { return front == rear; }
};

■ main 실행 결과
Stack s;
s.push(10); s.push(20); s.push(30);
cout << s.pop() << " ";   // 30 (LIFO)
cout << s.pop() << endl;  // 20

Queue q;
q.enqueue(5); q.enqueue(6); q.enqueue(7);
cout << q.dequeue() << " ";  // 5 (FIFO)
cout << q.dequeue() << endl; // 6`,
    codeExample: `// Stack push/pop
void push(int x) {
    if (top < MAX-1) arr[++top] = x;
}
int pop() {
    if (top == -1) return -1;
    return arr[top--];
}

// Queue enqueue/dequeue
void enqueue(int x) {
    if (rear < MAX) arr[rear++] = x;
}
int dequeue() {
    if (front == rear) return -1;
    return arr[front++];
}`,
    commonPitfalls: [
      'push 전 가득 찼는지 (top < MAX-1), pop 전 비었는지 (top != -1) 체크',
      'Queue에서 dequeue 후 front 인덱스가 증가하면 앞 공간이 낭비됨 (원형 큐로 해결)',
    ],
  },
  {
    id: 'polymorphism-abstract',
    title: '추상 클래스와 다형성 활용',
    titleEn: 'Abstract Classes & Polymorphism Patterns',
    icon: '🎭',
    difficulty: 'advanced',
    examFrequency: 5,
    keyPoints: [
      'clone() 패턴: 파생 클래스의 동적 복사',
      'Scene 클래스: vector<Shape*>로 다형성 컨테이너',
      '소멸자 체인: 가상 소멸자가 있어야 파생 클래스 소멸자 호출됨',
      '복사 생성자: Scene(const Scene& s)에서 각 Shape을 clone()으로 깊은 복사',
    ],
    theory: `■ 2025년 2학기 기출: Shape 다형성

// 빈칸 (A)~(E) 채우기
struct Shape {
    virtual ~Shape() {}
    virtual double area() const = 0;
    virtual Shape* clone() const = 0;
};

struct Circle : public Shape {
    double r;
    double area() const { return 3.14159 * r * r; }
    Shape* clone() const { return new Circle(*this); }  // (A): new Circle(*this)
};

struct Rect : public Shape {
    double w, h;
    double area() const { return w * h; }
    Shape* clone() const { return new Rect(*this); }     // (B): new Rect(*this)
};

class Scene {
    vector<Shape*> v;
public:
    Scene() {}
    Scene(const Scene& s) {   // 복사 생성자: 깊은 복사
        for (size_t i=0; i<s.v.size(); ++i) this->add(*s.v[i]);
    }

    ~Scene() {                // (C): delete v[i]
        for (size_t i=0; i<v.size(); ++i) delete v[i];
    }

    void add(const Shape& s) {
        v.push_back(s.clone());  // (D): s.clone() — 다형적 복사!
    }

    double total() const {
        double sum = 0;
        for (size_t i=0; i<v.size(); ++i) sum += v[i]->area();  // (E): v[i]->area()
        return sum;
    }
};

int main() {
    Scene a;
    a.add(Circle(2.0));    // Circle(r=2)
    a.add(Rect(3.0, 4.0)); // Rect(w=3, h=4)
    Scene b = a;           // 복사 생성자: 깊은 복사
    cout << "A=" << a.total() << ", B=" << b.total() << "\n";
    // A = π*4 + 12 ≈ 24.566
}

■ clone() 패턴 핵심
• add(const Shape& s): Shape의 레퍼런스로 받음
• s.clone()을 호출하면 실제 타입(Circle/Rect)의 clone이 호출됨 (가상 함수!)
• 반환값은 Shape*이지만 실제 객체는 Circle 또는 Rect`,
    commonPitfalls: [
      'add()에서 s.clone() 대신 &s를 저장하면 지역 객체가 소멸 후 dangling pointer',
      '소멸자에서 delete 대신 delete[]를 쓰면 UB',
      '복사 생성자에서 clone()을 쓰지 않으면 얕은 복사',
    ],
  },
];

/* ═══════════════════════════════════════════════════
   PROGRAMMING EXAM PROBLEMS (기출문제)
═══════════════════════════════════════════════════ */
export const PROG_EXAM_PROBLEMS: ExamProblem[] = [
  {
    id: 'prog-2024-2-1',
    year: '2024',
    semester: '2',
    subject: 'prog',
    problemNumber: 1,
    totalPoints: 50,
    category: '가상 함수',
    title: '가상 함수와 다형성 — 출력 추적 + 소멸자',
    codeBlock: `class Student {
public:
  Student() { cout << "[++] ss" << endl; }
  virtual void m1() { cout << "ss::m1" << endl; }
  virtual void m2() { cout << "ss::m2" << endl; }
          void m3() { m2(); cout << "ss::m3" << endl; }
          void m4() { m3(); cout << "ss::m4" << endl; }
};
class GradStudent : public Student {
public:
  GradStudent() { cout << "[++] gs" << endl; }
          void m1() { cout << "gs::m1" << endl; }
  virtual void m2() { cout << "gs::m2" << endl; }
          void m3() { m1(); cout << "gs::m3" << endl; }
};
class PhD : public GradStudent {
  int *data_;
public:
  PhD() : data_(new int[1]) { cout << "[++] phd" << endl; }
          void m1() { cout << "phd::m1" << endl; }
  virtual void m3() { m4(); cout << "phd::m3" << endl; }
};

int main() {
  PhD *mina = new PhD();
  GradStudent *gs = mina;
  Student *ss = gs;
  ss->m1();  ss->m3();
  cout << "=" << endl;
  gs->m1();  gs->m3();
  cout << "=" << endl;
  mina->m3();
  delete ss;
  return 0;
}`,
    description: 'PhD, GradStudent, Student 클래스 계층에서 가상 함수 동적 디스패치를 분석합니다.',
    subQuestions: [
      {
        label: 'A',
        points: 25,
        text: '[25pts] For the class implementations provided, write the output produced by the main function.',
        answer: `[++] ss
[++] gs
[++] phd
phd::m1
gs::m2
ss::m3
=
phd::m1
phd::m1
gs::m3
=
(mina->m3()는 PhD::m3()를 호출 → m4() → Student::m4() → m3() → PhD::m3() → 무한 재귀 → Stack Overflow)

상세 추적:
■ PhD *mina = new PhD():
  Student() → "[++] ss"
  GradStudent() → "[++] gs"
  PhD() → "[++] phd"

■ ss->m1(): m1은 virtual → 실제 타입 PhD::m1() → "phd::m1"

■ ss->m3(): m3은 Student에서 non-virtual → Student::m3()
  내부 m2() 호출 → m2는 virtual → PhD 객체에서 GradStudent::m2() → "gs::m2"
  → "ss::m3"

■ gs->m1(): m1은 virtual → PhD::m1() → "phd::m1"

■ gs->m3(): GradStudent* → m3은 non-virtual → GradStudent::m3()
  내부 m1() 호출 → m1은 virtual → PhD::m1() → "phd::m1"
  → "gs::m3"

■ mina->m3(): PhD* → PhD::m3() (virtual)
  m4() 호출 → m4는 non-virtual → Student::m4()
  Student::m4() 내 m3() → m3는 virtual → PhD::m3() → 재귀!`
      },
      {
        label: 'B',
        points: 15,
        text: '[15pts] Relying on compiler-generated destructors is inadequate for this code. Briefly explain why and implement the destructors appropriately.',
        answer: `이유:
PhD는 data_ = new int[1]로 힙 메모리를 동적 할당합니다.
컴파일러 생성 소멸자는 delete data_를 호출하지 않아 메모리 누수가 발생합니다.
또한 delete ss (Student*)로 삭제 시, Student에 가상 소멸자가 없으면
Student::~Student()만 호출되어 PhD::~PhD()가 호출되지 않습니다.

올바른 소멸자 구현:
// Student에 가상 소멸자 추가 (반드시!)
virtual ~Student() {}

// GradStudent: 추가 자원 없으면 default로도 OK
virtual ~GradStudent() {}

// PhD: data_ 해제
virtual ~PhD() { delete[] data_; }`
      },
      {
        label: 'C',
        points: 10,
        text: '[10pts] Explain what a pure virtual function is and how it is used.',
        answer: `순수 가상 함수(Pure Virtual Function):
선언: virtual void f() = 0;

특징:
1. 구현 없이 선언만 존재 (= 0)
2. 이를 포함하는 클래스는 추상 클래스(Abstract Class)가 됨
3. 추상 클래스는 직접 인스턴스화 불가
4. 파생 클래스에서 반드시 override해야 인스턴스화 가능

사용 예:
struct Shape {
    virtual ~Shape() {}
    virtual double area() const = 0;  // 순수 가상 함수
    virtual Shape* clone() const = 0;
};
Shape s;  // 오류! 추상 클래스 인스턴스화 불가
Circle c(5.0);  // OK - area()와 clone()을 override했으므로`
      },
    ],
    tags: ['가상함수', '다형성', '소멸자', '동적디스패치', 'vtable'],
  },
  {
    id: 'prog-2024-2-2',
    year: '2024',
    semester: '2',
    subject: 'prog',
    problemNumber: 2,
    totalPoints: 50,
    category: '복사 생성자',
    title: '복사 생성자와 Rule of Three — 런타임 오류 분석',
    codeBlock: `#include <cstring>
#include <iostream>
using namespace std;

class Student {
private:
  char *name_;      // Do not alter this line
  int id_;          // Do not alter this line

public:
  Student(const char *name, int id) : id_(id) {
    name_ = new char[strlen(name) + 1];
    strcpy(name_, name);
  }
  ~Student() { delete[] name_; }

  void setID(int id) { id_ = id; }
  void getInfo() const { cout << " Name: " << name_ << ", ID: " << id_ << endl; }
};

// Do not alter the main function
int main() {
  Student s1("mina", 10);
  Student s2 = s1;
  s2.setID(20);
  s1.getInfo();
  s2.getInfo();
  return 0;
}`,
    description: 'The program compiles successfully but encounters a runtime error during execution.',
    subQuestions: [
      {
        label: 'A',
        points: 25,
        text: '[25pts] Explain what the error is and why it occurs.',
        answer: `오류: 런타임 크래시 (이중 해제 - Double-Free)

원인:
Student s2 = s1;은 컴파일러가 자동 생성한 복사 생성자를 사용합니다.
이 기본 복사 생성자는 얕은 복사(Shallow Copy)를 수행합니다:
  s2.name_ = s1.name_;  // 같은 메모리 주소 복사!

결과:
s1.name_와 s2.name_이 같은 힙 메모리를 가리킵니다.

함수 종료 시:
1. ~s2() 호출 → delete[] s2.name_ (메모리 해제)
2. ~s1() 호출 → delete[] s1.name_ (이미 해제된 메모리를 다시 해제!)
→ Undefined Behavior (보통 크래시/segfault)`
      },
      {
        label: 'B',
        points: 25,
        text: '[25pts] Fix the error by modifying and/or adding some code in the Student class. Keep the code in the main function and the private field of the class intact.',
        answer: `// 복사 생성자 추가 (깊은 복사)
Student(const Student& other) : id_(other.id_) {
    name_ = new char[strlen(other.name_) + 1];
    strcpy(name_, other.name_);
}

// 복사 대입 연산자 추가 (완전한 Rule of Three를 위해)
Student& operator=(const Student& other) {
    if (this == &other) return *this;  // 자기 대입 방지
    delete[] name_;                    // 기존 메모리 해제
    name_ = new char[strlen(other.name_) + 1];
    strcpy(name_, other.name_);
    id_ = other.id_;
    return *this;
}

// 최소한 복사 생성자만 추가해도 이 문제는 해결됨
// name_는 독립적인 메모리를 가지므로 각각 해제해도 안전`
      },
    ],
    tags: ['복사생성자', 'Rule of Three', '얕은복사', '깊은복사', '메모리누수', 'double-free'],
  },
  {
    id: 'prog-2025-1-1',
    year: '2025',
    semester: '1',
    subject: 'prog',
    problemNumber: 1,
    totalPoints: 50,
    category: '연결 리스트',
    title: 'LinkedList 소멸자 & 재귀 뒤집기 구현',
    codeBlock: `class Node {
public:
    int data;
    Node *next;
    Node(int val, Node *nextNode = nullptr) : data(val), next(nextNode) {}
};

class LinkedList {
private:
    Node *head;
public:
    LinkedList() : head(nullptr) {}
    ~LinkedList();        // 구현 필요
    void append(int val) { head = new Node(val, head); }  // prepend!
    void reverse();
    void print() const;  // 이미 구현됨
};

int main() {
    LinkedList list1;
    list1.append(3); list1.append(2); list1.append(1);
    // 리스트: 1 -> 2 -> 3 (append는 앞에 추가!)
    list1.print();   // 첫 번째 출력
    list1.reverse();
    list1.print();   // 두 번째 출력: "3 -> 2 -> 1"
    return 0;
}

// reverse()에서 호출할 helper 함수
Node* LinkedList::reverseHelper(Node* node, Node* prev) {
    if (!node) return prev;
    // TODO: Complete the implementation here.
    // The reference solution has two lines.
    return reverseHelper(next, node);  // (이미 주어진 마지막 줄)
}
void LinkedList::reverse() {
    head = reverseHelper(head, nullptr);
}`,
    description: 'LinkedList의 소멸자와 재귀적 뒤집기 함수를 완성하세요.',
    subQuestions: [
      {
        label: '1',
        points: 20,
        text: '소멸자 구현을 완성하세요.\n\nLinkedList::~LinkedList() {\n    Node* current = head;\n    while (current) {\n        // TODO: Complete here.\n        // The reference solution has three lines.\n    }\n}',
        answer: `LinkedList::~LinkedList() {
    Node* current = head;
    while (current) {
        Node* next = current->next;  // 다음 노드 저장
        delete current;              // 현재 노드 삭제
        current = next;              // 다음 노드로 이동
    }
}`
      },
      {
        label: '2',
        points: 20,
        text: 'reverseHelper() 구현을 완성하세요.\n두 번째 print()의 출력이 "3 -> 2 -> 1"이 되어야 합니다.\n참조 해답은 2줄입니다.',
        answer: `Node* LinkedList::reverseHelper(Node* node, Node* prev) {
    if (!node) return prev;
    Node* next = node->next;   // 다음 노드 저장 (줄 1)
    node->next = prev;          // 링크 방향 뒤집기 (줄 2)
    return reverseHelper(next, node);
}

동작 설명:
1 -> 2 -> 3 -> nullptr
reverseHelper(1, nullptr):
  next = 2
  1->next = nullptr
  reverseHelper(2, 1):
    next = 3
    2->next = 1
    reverseHelper(3, 2):
      next = nullptr
      3->next = 2
      reverseHelper(nullptr, 3): return 3
    → head = 3
결과: 3 -> 2 -> 1`
      },
    ],
    tags: ['연결리스트', '소멸자', '재귀', '뒤집기', '포인터'],
  },
  {
    id: 'prog-2025-1-2',
    year: '2025',
    semester: '1',
    subject: 'prog',
    problemNumber: 2,
    totalPoints: 50,
    category: '템플릿',
    title: 'Pair 클래스 — 출력·템플릿·호환성',
    codeBlock: `class Pair {
private:
    int* first;
    int* second;
public:
    Pair(): first(nullptr),second(nullptr) {}
    Pair(int* a, int* b) { first = a; second = b; }
    void add(const Pair& other) {
        *first  += *(other.first);
        *second += *(other.second);
    }
    void print() {
        cout << "(" << *first << "," << *second << ")" << endl;
    }
};

int main() {
    int data[4] = {1, 2, 3, 4};
    Pair a(data, data+2);      // first=&data[0], second=&data[2]
    Pair b(data+1, data+3);    // first=&data[1], second=&data[3]
    a.add(b);
    a.print();
}`,
    description: '포인터 기반 Pair 클래스 분석 및 템플릿으로 일반화합니다.',
    subQuestions: [
      {
        label: '3',
        points: 15,
        text: "What's the output of the program?",
        answer: `출력: (3,7)

분석:
data[4] = {1, 2, 3, 4}
a.first = data+0 → *a.first = data[0] = 1
a.second = data+2 → *a.second = data[2] = 3
b.first = data+1 → *b.first = data[1] = 2
b.second = data+3 → *b.second = data[3] = 4

a.add(b):
  *first += *(other.first) → data[0] += data[1] → data[0] = 1+2 = 3
  *second += *(other.second) → data[2] += data[3] → data[2] = 3+4 = 7

a.print(): (*first, *second) = (data[0], data[2]) = (3, 7)`
      },
      {
        label: '4',
        points: 15,
        text: 'Indicate the required modifications to change the class to take a pair of pointers of an arbitrary datatype T instead of only supporting int*',
        answer: `template<typename T>
class Pair {
private:
    T* first;
    T* second;
public:
    Pair(): first(nullptr), second(nullptr) {}
    Pair(T* a, T* b) { first = a; second = b; }
    void add(const Pair<T>& other) {
        *first  += *(other.first);
        *second += *(other.second);
    }
    void print() {
        cout << "(" << *first << "," << *second << ")" << endl;
    }
};

변경 사항: int → T로 교체, template<typename T> 선언 추가`
      },
      {
        label: '5',
        points: 20,
        text: 'Pair<LinkedList> fails to compile. (A) Why? (B) List the function headers that need to be declared inside the LinkedList class.',
        answer: `(A) 컴파일 실패 이유:
Pair<LinkedList>를 사용하면 add()에서 *first += *(other.first)가 실행됩니다.
LinkedList에 operator+= 연산자가 정의되지 않아 컴파일 오류 발생.
또한 Pair 복사 시 LinkedList의 복사 연산이 필요할 수 있습니다.

(B) LinkedList에 추가 필요한 함수 헤더:
// add() 내부 *first += *(other.first)를 지원하기 위해:
LinkedList& operator+=(const LinkedList& other);

// print()를 지원하기 위해:
friend ostream& operator<<(ostream& os, const LinkedList& list);
// 또는: string toString() const;`
      },
    ],
    tags: ['포인터', '템플릿', 'template', 'Pair', '연산자오버로딩'],
  },
  {
    id: 'prog-2025-2-1',
    year: '2025',
    semester: '2',
    subject: 'prog',
    problemNumber: 1,
    totalPoints: 35,
    category: '다형성',
    title: 'Shape 다형성 코드 빈칸 채우기 (A)~(E)',
    codeBlock: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

struct Shape {
    virtual ~Shape(){}
    virtual double area() const = 0;
    virtual Shape* clone() const = 0;
};

struct Circle: public Shape {
    double r;
    Circle(double rr): r(rr) {}
    double area() const { return 3.1415926535 * r * r; }
    Shape* clone() const { return _______; } // (A)
};

struct Rect: public Shape {
    double w, h;
    Rect(double ww, double hh): w(ww), h(hh) {}
    double area() const { return w * h; }
    Shape* clone() const { return _______; } // (B)
};

class Scene {
    vector < Shape * > v;
 public:
    Scene() {}
    Scene(const Scene & s) {
        for (size_t i = 0; i < s.v.size(); ++i) this->add(*s.v[i]);
    }
    ~Scene() { for (size_t i = 0; i < v.size(); ++i) _______; } // (C)
    void add(const Shape & s) { v.push_back(_______); } // (D)
    double total() const {
        double sum = 0;
        for (size_t i = 0; i < v.size(); ++i) sum += _______; // (E)
        return sum;
    }
};

int main() {
    Scene a;
    a.add(Circle(2.0));
    a.add(Rect(3.0, 4.0));
    Scene b = a;
    cout << "A=" << a.total() << ", B=" << b.total() << "\n";
    return 0;
}`,
    description: '(A)부터 (E)까지 5개의 빈칸을 채워 프로그램을 완성하세요.',
    subQuestions: [
      {
        label: 'A',
        points: 7,
        text: 'Circle::clone()의 반환값 (A)를 채우시오.',
        answer: `new Circle(*this)

해설: clone()은 자신의 복사본을 힙에 생성하여 반환합니다.
*this는 현재 Circle 객체를 역참조, new Circle(*this)는 복사 생성자를 호출하여 새 Circle을 힙에 할당합니다.`
      },
      {
        label: 'B',
        points: 7,
        text: 'Rect::clone()의 반환값 (B)를 채우시오.',
        answer: `new Rect(*this)

해설: Circle과 동일하게, 현재 Rect 객체의 복사본을 힙에 생성합니다.`
      },
      {
        label: 'C',
        points: 7,
        text: 'Scene::~Scene()의 루프 내용 (C)를 채우시오.',
        answer: `delete v[i]

해설: v는 Shape* 포인터들을 저장합니다. 소멸자에서 각 포인터가 가리키는 힙 메모리를 해제해야 합니다.
Shape에 virtual ~Shape()가 있으므로 올바른 파생 클래스 소멸자가 호출됩니다.`
      },
      {
        label: 'D',
        points: 7,
        text: 'Scene::add()에서 v.push_back()의 인수 (D)를 채우시오.',
        answer: `s.clone()

해설: add()는 const Shape& s를 받습니다.
s를 직접 저장하면 지역 객체 소멸 후 dangling pointer가 됩니다.
s.clone()은 가상 함수이므로 실제 타입(Circle 또는 Rect)의 clone이 호출되어 힙에 새 객체를 생성합니다.`
      },
      {
        label: 'E',
        points: 7,
        text: 'Scene::total()의 루프 내용 (E)를 채우시오.',
        answer: `v[i]->area()

해설: v[i]는 Shape* 포인터입니다. area()는 virtual이므로 실제 객체 타입(Circle/Rect)에 맞는 area()가 호출됩니다 (동적 디스패치).`
      },
    ],
    tags: ['다형성', '추상클래스', 'clone', 'virtual', 'vector', '가상소멸자'],
  },
  {
    id: 'prog-2025-2-2',
    year: '2025',
    semester: '2',
    subject: 'prog',
    problemNumber: 2,
    totalPoints: 20,
    category: '메모리 관리',
    title: 'Buffer 클래스 — Segfault 원인 2가지 분석',
    codeBlock: `#include <cstddef>

class Buffer {
    size_t n_;
    int* data_;
public:
    Buffer(size_t n) : n_(n), data_(new int[n]) {}
    ~Buffer() { delete data_; }
    size_t size() const { return n_; }
    int& at(size_t i) { return data_[i]; }
};

void fill_with(Buffer& b, int v) {
    for (size_t i = 0; i <= b.size(); ++i)
        b.at(i) = v;
}

int main() {
    Buffer b(10);
    fill_with(b, 0);
    return 0;
}`,
    description: 'The following code sometimes crashes. Identify two causes of the segmentation fault and propose a correction for each.',
    subQuestions: [
      {
        label: '1',
        points: 10,
        text: '[10pts] 첫 번째 Segfault 원인과 수정 방법을 제시하세요.',
        answer: `원인 1: delete 대신 delete[]를 써야 함

~Buffer() { delete data_; }  // 오류!

data_는 new int[n]으로 배열을 할당받았습니다.
배열 해제는 반드시 delete[]를 사용해야 합니다.
delete를 사용하면 Undefined Behavior (보통 크래시).

수정:
~Buffer() { delete[] data_; }`
      },
      {
        label: '2',
        points: 10,
        text: '[10pts] 두 번째 Segfault 원인과 수정 방법을 제시하세요.',
        answer: `원인 2: Off-by-one 오류 (i <= b.size())

for (size_t i = 0; i <= b.size(); ++i)  // 오류!

b.size()는 n=10이므로 i는 0..10까지 실행됩니다.
data_[10]은 할당된 범위(0..9) 밖 → out-of-bounds 접근 → Segfault!

수정:
for (size_t i = 0; i < b.size(); ++i)  // < 로 변경`
      },
    ],
    tags: ['Segfault', '메모리관리', 'delete[]', 'off-by-one', '포인터'],
  },
  {
    id: 'prog-2025-2-3',
    year: '2025',
    semester: '2',
    subject: 'prog',
    problemNumber: 3,
    totalPoints: 45,
    category: '스택/큐',
    title: 'Stack & Queue 구현 — push/pop/enqueue/dequeue/isEmpty',
    codeBlock: `#include <iostream>
using namespace std;

#define MAX 5

class Stack {
    int arr[MAX];
    int top;
public:
    Stack() { top = -1; }
    void push(int x);    // TODO
    int pop();           // TODO
    bool isEmpty();      // TODO
};

class Queue {
    int arr[MAX];
    int front, rear;
public:
    Queue() { front = 0; rear = 0; }
    void enqueue(int x); // TODO
    int dequeue();       // TODO
    bool isEmpty();      // TODO
};

// ====== TODO: Implement the following methods ======
// Stack push, pop, isEmpty
void Stack::push(int x) { /* TODO */ }
int Stack::pop() { /* TODO */ }
bool Stack::isEmpty() { /* TODO */ }
// Queue enqueue, dequeue, isEmpty
void Queue::enqueue(int x) { /* TODO */ }
int Queue::dequeue() { /* TODO */ }
bool Queue::isEmpty() { /* TODO */ }
// ==================================================

int main() {
    Stack s;
    s.push(10); s.push(20); s.push(30);
    cout << s.pop() << " ";
    cout << s.pop() << endl;

    Queue q;
    q.enqueue(5); q.enqueue(6); q.enqueue(7);
    cout << q.dequeue() << " ";
    cout << q.dequeue() << endl;
    return 0;
}`,
    description: 'Stack과 Queue의 모든 TODO 메서드를 구현하고, main()의 정확한 출력을 쓰시오.',
    subQuestions: [
      {
        label: 'Stack push',
        points: 7,
        text: 'Stack::push(int x) 구현: x를 스택 맨 위에 삽입. 꽉 차면 무시.',
        answer: `void Stack::push(int x) {
    if (top < MAX - 1)
        arr[++top] = x;
}`
      },
      {
        label: 'Stack pop',
        points: 7,
        text: 'Stack::pop() 구현: 맨 위 원소를 제거하고 반환. 비어있으면 -1 반환.',
        answer: `int Stack::pop() {
    if (top == -1) return -1;
    return arr[top--];
}`
      },
      {
        label: 'Stack isEmpty',
        points: 5,
        text: 'Stack::isEmpty() 구현: 비어있으면 true, 아니면 false.',
        answer: `bool Stack::isEmpty() {
    return top == -1;
}`
      },
      {
        label: 'Queue enqueue',
        points: 7,
        text: 'Queue::enqueue(int x) 구현: x를 큐 뒤에 삽입. 꽉 차면 무시.',
        answer: `void Queue::enqueue(int x) {
    if (rear < MAX)
        arr[rear++] = x;
}`
      },
      {
        label: 'Queue dequeue',
        points: 7,
        text: 'Queue::dequeue() 구현: 앞 원소를 제거하고 반환. 비어있으면 -1 반환.',
        answer: `int Queue::dequeue() {
    if (front == rear) return -1;
    return arr[front++];
}`
      },
      {
        label: 'Queue isEmpty',
        points: 5,
        text: 'Queue::isEmpty() 구현 + main()의 출력을 쓰시오.',
        answer: `bool Queue::isEmpty() {
    return front == rear;
}

main() 출력:
30 20
5 6

해설:
Stack: push(10)→top=0, push(20)→top=1, push(30)→top=2
pop()→30, pop()→20 (LIFO)

Queue: enqueue(5)→rear=1, enqueue(6)→rear=2, enqueue(7)→rear=3
dequeue()→5, dequeue()→6 (FIFO)`
      },
    ],
    tags: ['Stack', 'Queue', 'LIFO', 'FIFO', '구현', '배열'],
  },
  {
    id: 'prog-2024-1-1',
    year: '2024',
    semester: '1',
    subject: 'prog',
    problemNumber: 1,
    totalPoints: 50,
    category: '포인터',
    title: '포인터 배열 + 버블 정렬 — 출력 분석',
    codeBlock: `#include <stdio.h>

void swap(int* a, int* b) {
    int* tmp;
    tmp = a;    // 로컬 복사만!
    a = b;
    b = tmp;
}

void sort(int* pitems[], int size) {
    for (int i=0; i<size-1; i++) {
        for (int j=0; j<size-1-i; j++) {
            if (pitems[j] > pitems[j+1]) {  // (A): 포인터 주소 비교!
                swap(pitems[j], pitems[j+1]); // (D)
            }
        }
    }
}

int main() {
    const int SIZE=5;
    int items[SIZE] = {16, 9, 28, 12, 1};
    int* pitems[SIZE];

    pitems[0] = items;
    for (int i=1; i<SIZE; i++) {
        pitems[i] = pitems[i-1]+1;  // 포인터 산술
    }

    sort(pitems, SIZE);

    for (int i=0; i<SIZE; i++) {  // (B)
        printf("%d, ", *pitems[i]);
    }
    printf("\\n");

    for (int i=0; i<SIZE; i++) {  // (C)
        printf("%d, ", items[i]);
    }
    printf("\\n");

    return 0;
}`,
    description: '포인터 배열을 이용한 버블 정렬 코드를 분석하여 출력을 예측하세요.',
    subQuestions: [
      {
        label: '1',
        points: 20,
        text: 'What is the output of the program? (출력 B와 C를 쓰시오)',
        answer: `출력 B: 16, 9, 28, 12, 1,
출력 C: 16, 9, 28, 12, 1,

분석:
■ pitems 배열 구성:
pitems[0] = &items[0] = (주소 0)
pitems[1] = &items[1] = (주소 4)  (+4바이트, int 크기)
pitems[2] = &items[2] = (주소 8)
pitems[3] = &items[3] = (주소 12)
pitems[4] = &items[4] = (주소 16)

■ (A) 비교: pitems[j] > pitems[j+1]
→ 포인터 주소를 비교! 주소는 이미 오름차순
→ 항상 false → swap이 한 번도 일어나지 않음!

■ swap(int* a, int* b):
→ a와 b는 지역 변수 (포인터의 값을 복사받음)
→ 내부에서 지역 변수 교환 → 원본 pitems 배열에 영향 없음

■ 결과: sort 후에도 pitems, items 모두 변경 없음
B = *pitems[0], *pitems[1], ... = 16, 9, 28, 12, 1
C = items[0], items[1], ... = 16, 9, 28, 12, 1`
      },
    ],
    tags: ['포인터', '포인터산술', '버블정렬', '포인터배열', 'swap'],
  },
];

/* ═══════════════════════════════════════════════════
   PROGRAMMING PRACTICE QUESTIONS
═══════════════════════════════════════════════════ */
export const PROG_PRACTICE_QUESTIONS: QuizQuestion[] = [
  {
    id: 'prog-p1',
    type: 'true-false',
    topic: '가상 함수',
    difficulty: 'easy',
    question: 'virtual 키워드로 선언된 함수는 런타임에 호출 대상이 결정된다.',
    answer: 'true',
    explanation: 'virtual 함수는 동적 디스패치(dynamic dispatch)를 사용합니다. 실제 객체의 타입에 따라 런타임에 vtable을 통해 호출 대상이 결정됩니다.',
  },
  {
    id: 'prog-p2',
    type: 'true-false',
    topic: '가상 함수',
    difficulty: 'medium',
    question: '기반 클래스 포인터로 파생 클래스 객체를 삭제할 때, 기반 클래스 소멸자가 virtual이 아니어도 안전하다.',
    answer: 'false',
    explanation: '기반 클래스 소멸자가 virtual이 아니면 delete base_ptr는 기반 클래스 소멸자만 호출합니다. 파생 클래스의 소멸자가 호출되지 않아 메모리 누수가 발생합니다.',
  },
  {
    id: 'prog-p3',
    type: 'multiple-choice',
    topic: '가상 함수',
    difficulty: 'easy',
    question: '순수 가상 함수가 1개 이상 있는 클래스를 무엇이라 하는가?',
    options: ['인터페이스 클래스', '추상 클래스', '가상 클래스', '기반 클래스'],
    answer: 1,
    explanation: '순수 가상 함수(virtual f() = 0)가 1개 이상 있는 클래스는 추상 클래스(Abstract Class)입니다. 직접 인스턴스화할 수 없습니다.',
    tags: ['순수가상함수', '추상클래스'],
  },
  {
    id: 'prog-p4',
    type: 'true-false',
    topic: '생성자·소멸자·Rule of Three',
    difficulty: 'medium',
    question: '포인터 멤버 변수가 있는 클래스에서 컴파일러가 자동 생성한 복사 생성자는 안전하다.',
    answer: 'false',
    explanation: '컴파일러 생성 복사 생성자는 얕은 복사(Shallow Copy)를 수행합니다. 포인터의 경우 같은 메모리 주소를 복사하여 두 객체가 같은 메모리를 공유 → 이중 해제(double-free) 위험.',
  },
  {
    id: 'prog-p5',
    type: 'multiple-choice',
    topic: '생성자·소멸자·Rule of Three',
    difficulty: 'medium',
    question: 'Rule of Three에서 함께 정의해야 하는 세 가지는?',
    options: [
      '생성자, 복사 생성자, 소멸자',
      '소멸자, 복사 생성자, 복사 대입 연산자',
      '생성자, 소멸자, 이동 생성자',
      '복사 생성자, 이동 생성자, 소멸자',
    ],
    answer: 1,
    explanation: 'Rule of Three: 소멸자, 복사 생성자, 복사 대입 연산자 (operator=). 이 셋 중 하나를 직접 정의해야 한다면 나머지도 정의해야 합니다.',
    tags: ['Rule of Three', '복사생성자', '소멸자'],
  },
  {
    id: 'prog-p6',
    type: 'fill-blank',
    topic: '메모리 관리 & 포인터',
    difficulty: 'easy',
    question: 'int* arr = new int[10]; 를 해제하는 올바른 코드는?',
    answer: 'delete[] arr',
    explanation: '배열 new[]로 할당한 메모리는 반드시 delete[]로 해제해야 합니다. delete arr (delete[]) 없이)를 사용하면 Undefined Behavior.',
    tags: ['delete[]', '메모리해제'],
  },
  {
    id: 'prog-p7',
    type: 'multiple-choice',
    topic: '메모리 관리 & 포인터',
    difficulty: 'medium',
    question: '다음 코드에서 오류는?\nvoid swap(int* a, int* b) { int* tmp = a; a = b; b = tmp; }',
    options: [
      '오류 없음, 정상 동작',
      '포인터가 아닌 값을 교환해야 함 (*a, *b)',
      'tmp 타입이 잘못됨',
      '컴파일 오류',
    ],
    answer: 1,
    explanation: 'a와 b는 지역 포인터 변수입니다. tmp = a; a = b; b = tmp;는 지역 변수만 교환하고 원본에 영향 없음. 올바른 swap: int tmp = *a; *a = *b; *b = tmp;',
    tags: ['포인터swap', '메모리관리'],
  },
  {
    id: 'prog-p8',
    type: 'true-false',
    topic: '메모리 관리 & 포인터',
    difficulty: 'medium',
    question: 'int arr[5]에서 arr[5]에 접근하면 항상 컴파일 오류가 발생한다.',
    answer: 'false',
    explanation: '배열 범위를 벗어난 접근은 Undefined Behavior이지만 컴파일 오류는 아닙니다. 런타임 크래시(segfault) 또는 예상치 못한 동작이 발생할 수 있습니다.',
    tags: ['off-by-one', 'UB', '배열'],
  },
  {
    id: 'prog-p9',
    type: 'multiple-choice',
    topic: 'OOP 기초 — 클래스와 객체',
    difficulty: 'easy',
    question: 'C++에서 클래스 멤버의 기본 접근 제어는?',
    options: ['public', 'protected', 'private', '없음'],
    answer: 2,
    explanation: 'C++ 클래스에서 접근 제어를 명시하지 않으면 기본은 private입니다. struct는 기본이 public으로 다릅니다.',
    tags: ['접근제어', 'private'],
  },
  {
    id: 'prog-p10',
    type: 'fill-blank',
    topic: '연결 리스트 구현 (C++)',
    difficulty: 'medium',
    question: '연결 리스트 소멸자에서 current = head; while(current) { ___; current = next; } 의 빈칸에 들어갈 2개의 문장은?',
    answer: 'Node* next = current->next; delete current;',
    explanation: '현재 노드를 삭제하기 전에 다음 포인터를 저장해야 합니다. delete current 후에는 current->next에 접근할 수 없으므로 순서가 중요합니다.',
    tags: ['소멸자', '연결리스트', '포인터'],
  },
  {
    id: 'prog-p11',
    type: 'true-false',
    topic: '스택/큐 구현',
    difficulty: 'easy',
    question: 'top = -1인 Stack 배열에서 push(x)는 arr[++top] = x로 구현한다.',
    answer: 'true',
    explanation: '전위 증가(++top)를 사용하면 먼저 top을 1 증가시킨 후 해당 위치에 x를 저장합니다. top = -1에서 시작하므로 첫 push 후 top = 0, arr[0] = x.',
    tags: ['Stack', 'push', '구현'],
  },
  {
    id: 'prog-p12',
    type: 'multiple-choice',
    topic: '스택/큐 구현',
    difficulty: 'easy',
    question: 'Queue에서 isEmpty() 조건은 (front, rear 기반)?',
    options: ['front == 0', 'rear == 0', 'front == rear', 'rear > MAX'],
    answer: 2,
    explanation: 'front와 rear이 같은 위치를 가리키면 큐가 비어있는 것입니다. enqueue는 rear++, dequeue는 front++하므로 front == rear이면 빈 큐.',
    tags: ['Queue', 'isEmpty'],
  },
  {
    id: 'prog-p13',
    type: 'true-false',
    topic: '템플릿 (Templates)',
    difficulty: 'medium',
    question: 'C++ 클래스 템플릿의 멤버 함수 정의는 .cpp 파일에 별도로 작성할 수 있다.',
    answer: 'false',
    explanation: '템플릿은 컴파일 타임에 인스턴스화되므로 정의가 헤더 파일에 있어야 합니다. .cpp에 분리하면 링커 오류가 발생합니다.',
    tags: ['template', '헤더파일'],
  },
  {
    id: 'prog-p14',
    type: 'multiple-choice',
    topic: '가상 함수',
    difficulty: 'hard',
    question: '다음 코드 출력은?\nclass A { public: virtual void f() { cout<<"A"; } void g() { f(); } };\nclass B : public A { public: void f() { cout<<"B"; } };\nB b; A* p = &b; p->g();',
    options: ['A', 'B', 'AB', '컴파일 오류'],
    answer: 1,
    explanation: 'p->g()는 non-virtual이므로 A::g()가 호출됩니다. A::g() 내부의 f()는 virtual이므로 실제 객체(B)의 f() = "B"가 호출됩니다.',
    tags: ['동적디스패치', '가상함수', '출력추적'],
  },
  {
    id: 'prog-p15',
    type: 'true-false',
    topic: '다형성',
    difficulty: 'medium',
    question: 'vector<Shape*>에서 각 원소를 clone()으로 삽입하면 깊은 복사가 이루어진다.',
    answer: 'true',
    explanation: 'clone()은 각 파생 클래스에서 new로 새 객체를 생성하여 반환합니다. 따라서 각 Shape*가 독립적인 힙 메모리를 가리켜 깊은 복사입니다.',
    tags: ['clone', '깊은복사', '다형성'],
  },
  {
    id: 'prog-p16',
    type: 'fill-blank',
    topic: '생성자·소멸자·Rule of Three',
    difficulty: 'medium',
    question: '복사 대입 연산자에서 자기 대입 방지 코드는: Student& operator=(const Student& other) { if (___) return *this; ... }',
    answer: 'this == &other',
    explanation: 'this는 현재 객체의 포인터, &other는 매개변수의 주소입니다. 자기 대입 s = s를 방지하여 기존 메모리를 먼저 해제하는 실수를 방지합니다.',
    tags: ['복사대입', '자기대입방지'],
  },
  {
    id: 'prog-p17',
    type: 'multiple-choice',
    topic: '메모리 관리 & 포인터',
    difficulty: 'medium',
    question: 'int arr[3] = {10,20,30}; int* p = arr+1; 에서 *(p+1)의 값은?',
    options: ['10', '20', '30', '컴파일 오류'],
    answer: 2,
    explanation: 'p = arr+1이므로 p는 arr[1](=20)을 가리킵니다. p+1은 arr[2](=30)을 가리키므로 *(p+1) = 30.',
    tags: ['포인터산술', '역참조'],
  },
  {
    id: 'prog-p18',
    type: 'true-false',
    topic: '연결 리스트 구현 (C++)',
    difficulty: 'easy',
    question: '단방향 연결 리스트에서 head = new Node(val, head)는 리스트 앞에 삽입(prepend)이다.',
    answer: 'true',
    explanation: '새 노드를 생성하고 그 next를 현재 head로 설정한 뒤, head를 새 노드로 업데이트합니다. 이는 앞에 삽입(prepend)으로 O(1) 연산입니다.',
    tags: ['연결리스트', 'prepend'],
  },
  {
    id: 'prog-p19',
    type: 'multiple-choice',
    topic: '가상 함수',
    difficulty: 'hard',
    question: '기반 클래스에서 non-virtual 함수, 파생 클래스에서 같은 이름 함수를 정의하면?',
    options: [
      '오버라이딩(Overriding)됨',
      '하이딩(Hiding)됨 — 포인터 타입에 따라 결정',
      '컴파일 오류',
      '런타임 오류',
    ],
    answer: 1,
    explanation: 'non-virtual 함수는 오버라이딩이 아닌 하이딩(Name Hiding)입니다. 기반 클래스 포인터 = 기반 클래스 버전, 파생 클래스 포인터 = 파생 클래스 버전. 동적 디스패치 없음.',
    tags: ['Name Hiding', 'non-virtual', '정적바인딩'],
  },
  {
    id: 'prog-p20',
    type: 'short-answer',
    topic: '다형성',
    difficulty: 'medium',
    question: 'Shape* ptr = new Circle(5.0); delete ptr; 에서 Circle의 소멸자가 호출되려면 Shape에 무엇이 필요한가?',
    answer: '가상 소멸자 (virtual ~Shape())',
    explanation: 'Shape에 virtual ~Shape()가 없으면 delete ptr은 Shape::~Shape()만 호출합니다. Circle의 소멸자가 호출되지 않아 메모리 누수가 발생합니다. virtual ~Shape() {}를 추가하면 올바른 소멸자 체인이 실행됩니다.',
    tags: ['가상소멸자', '소멸자체인'],
  },
  {
    id: 'prog-p21',
    type: 'true-false',
    topic: 'OOP 기초 — 클래스와 객체',
    difficulty: 'easy',
    question: 'class X { int n; public: X(int v) : n(v) {} }; 에서 X obj(5); 는 유효하다.',
    answer: 'true',
    explanation: '생성자 초기화 리스트 X(int v) : n(v) {}는 n을 v로 초기화합니다. X obj(5)는 n=5로 객체를 생성합니다.',
    tags: ['생성자', '초기화리스트'],
  },
  {
    id: 'prog-p22',
    type: 'multiple-choice',
    topic: '스택/큐 구현',
    difficulty: 'medium',
    question: 'MAX=5 배열 기반 Stack에 push(1),push(2),push(3),push(4),push(5),push(6) 후 pop()의 반환값은?',
    options: ['6', '5', '4', '-1'],
    answer: 1,
    explanation: 'MAX=5이므로 6번째 push(6)은 top=4(꽉 참)이므로 무시됩니다. pop()은 LIFO로 마지막으로 성공 삽입된 5를 반환합니다.',
    tags: ['Stack', 'overflow', 'push', 'pop'],
  },
  {
    id: 'prog-p23',
    type: 'fill-blank',
    topic: '가상 함수',
    difficulty: 'medium',
    question: '추상 클래스에서 순수 가상 함수를 선언하는 문법은: virtual void f() ___',
    answer: '= 0;',
    explanation: '순수 가상 함수는 virtual void f() = 0; 으로 선언합니다. = 0은 "구현이 없음"을 나타내며, 파생 클래스에서 반드시 override해야 합니다.',
    tags: ['순수가상함수', 'pure virtual'],
  },
  {
    id: 'prog-p24',
    type: 'true-false',
    topic: '템플릿 (Templates)',
    difficulty: 'easy',
    question: 'template<typename T> class Pair { T* first; ... }; 에서 Pair<int>와 Pair<double>은 서로 다른 클래스이다.',
    answer: 'true',
    explanation: '템플릿은 컴파일 타임에 각 타입 인수에 대해 별도의 클래스로 인스턴스화됩니다. Pair<int>와 Pair<double>은 완전히 다른 클래스입니다.',
    tags: ['template', '인스턴스화'],
  },
  {
    id: 'prog-p25',
    type: 'multiple-choice',
    topic: '메모리 관리 & 포인터',
    difficulty: 'hard',
    question: 'size_t n=5; for(size_t i=0; i<=n; i++) arr[i]=0; 에서 문제는?',
    options: [
      '문제 없음',
      'size_t는 unsigned이므로 i<=n에서 i=n+1일 때 오버플로우',
      'arr[n]은 유효하지 않은 접근 (off-by-one)',
      'i=0 초기화 오류',
    ],
    answer: 2,
    explanation: 'arr[n]은 크기 n 배열의 범위를 벗어난 접근입니다 (인덱스 0..n-1). 올바른 조건: i<n. size_t는 unsigned이지만 이 경우 오버플로우가 직접적인 문제가 아니라 out-of-bounds 접근이 문제입니다.',
    tags: ['off-by-one', 'Segfault', 'size_t'],
  },
];
