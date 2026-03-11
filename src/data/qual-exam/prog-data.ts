import type { StudyTopic } from '@/components/qual-exam/TopicStudyCard';
import type { ExamProblem } from '@/components/qual-exam/ExamProblemCard';
import type { QuizQuestion } from '@/components/qual-exam/PracticeList';

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
    studyOrder: 1,
    summary: '클래스는 데이터(멤버 변수)와 동작(멤버 함수)의 묶음. public/private/protected 접근 제어, 생성자 초기화 리스트.',
    relatedExamIds: ['prog-2025-1-1'],
    keyPoints: [
      'struct vs class: struct는 기본 public, class는 기본 private',
      '기본 생성자: 사용자가 생성자를 하나라도 정의하면 컴파일러 자동 생성 안 됨',
      '초기화 리스트 필수 3경우: const 멤버 / 참조 멤버 / 기본 생성자 없는 멤버 객체',
      '초기화 순서: 리스트 작성 순서가 아닌 클래스 선언 순서대로 초기화됨',
      'const 멤버 함수: this가 const T*가 되어 멤버 수정 불가, const 객체는 const 함수만 호출',
      'static 멤버 변수: 클래스당 하나, 반드시 클래스 외부에서 정의 및 초기화',
    ],
    theory: `■ 클래스(Class) — 데이터와 동작의 캡슐화

클래스는 관련 있는 데이터(멤버 변수)와 동작(멤버 함수)을 하나로 묶은 사용자 정의 타입.
struct vs class: struct 기본 접근 public, class 기본 접근 private.

class MyClass {
private:    // 클래스 내부 + friend만 접근 (class 기본값)
    int x_;
    double y_;
protected:  // private + 파생 클래스의 멤버 함수도 접근 가능
    float z_;
public:     // 외부 어디서나 접근 가능
    MyClass(int x, double y);          // 매개변수 생성자
    MyClass(const MyClass& other);     // 복사 생성자
    MyClass& operator=(const MyClass&);// 복사 대입 연산자
    ~MyClass();                        // 소멸자
    int getX() const;                  // const 멤버 함수
    static int getCount();             // static 멤버 함수
};

─────────────────────────────────────────
■ 접근 지정자 (Access Specifier) 상세
─────────────────────────────────────────
지정자       접근 범위
public       클래스 외부 포함 어디서나 접근 가능
private      해당 클래스의 멤버 함수 + friend 함수/클래스만 접근
protected    private + 파생(derived) 클래스의 멤버 함수도 접근 가능

[상속 시 접근 범위 변화 — 중요!]
class D : public B    → B의 public    → D에서 public
                      → B의 protected → D에서 protected
class D : protected B → B의 public    → D에서 protected
                      → B의 protected → D에서 protected
class D : private B   → B의 public    → D에서 private
                      → B의 protected → D에서 private

─────────────────────────────────────────
■ 생성자(Constructor) 종류
─────────────────────────────────────────
1. 기본 생성자 (Default Constructor) — 인수 없음
   사용자가 어떤 생성자도 정의하지 않은 경우에만 컴파일러가 자동 생성.
   다른 생성자를 하나라도 정의하면 기본 생성자는 자동 생성되지 않음!

   class A {};              // OK: 컴파일러가 A() 자동 생성
   class B { B(int x){} }; // B()는 없음! → B b; 는 컴파일 에러!
   class C { C(int x=0){}};// 기본값 제공 → C()처럼 호출 가능

2. 매개변수 생성자 — 여러 개를 오버로드(overload) 가능
   MyClass(int x);
   MyClass(int x, double y);

3. 복사 생성자 (Copy Constructor) — MyClass(const MyClass& other)
   같은 타입 객체로부터 새 객체를 초기화할 때 자동 호출됨.

   [호출되는 4가지 시점]
   MyClass b = a;             // 복사 초기화
   MyClass b(a);              // 직접 초기화
   void f(MyClass x) {}  f(a);// 값 전달 (인수 복사)
   MyClass f() { return a; }  // 값 반환 (반환값 복사)

─────────────────────────────────────────
■ 초기화 리스트 (Member Initializer List)
─────────────────────────────────────────
생성자 본문 실행 전, 멤버를 직접 초기화하는 문법.
문법: 생성자명(매개변수) : 멤버1(값1), 멤버2(값2) { }

[본문 대입 방식 — 비권장]
MyClass::MyClass(int x, double y) {
    x_ = x;   // ① x_가 먼저 기본(default) 초기화 ② 그다음 x를 대입 → 2단계 비효율
    y_ = y;
}

[초기화 리스트 방식 — 권장]
MyClass::MyClass(int x, double y) : x_(x), y_(y) { }
// → 생성과 동시에 초기화 → 1단계 → 효율적

반드시 초기화 리스트를 써야 하는 3가지 경우:
① const 멤버:            const int id_;
   → 생성 후 수정 불가, 리스트에서만 초기화 가능
② 참조 멤버:             int& ref_;
   → 선언과 동시에 참조 대상 지정 필수 (대입으로는 불가)
③ 기본 생성자 없는 멤버 객체:
   → 컴파일러가 본문 실행 전 기본 생성자를 호출하려 하지만 없으면 에러

[초기화 순서 — 함정!]
리스트에 쓴 순서가 아니라 클래스 선언에 나열된 순서로 초기화됨!

class D {
    int a_, b_;           // a_가 먼저 선언 → a_가 먼저 초기화됨
public:
    D(int x) : b_(x), a_(b_) { }
    // 함정! a_가 먼저 초기화되는데, 이때 b_는 아직 초기화 전 → 미정의 동작!
};
// 안전한 방법: D(int x) : a_(x), b_(x) { }  // 각자 독립적인 값으로 초기화

─────────────────────────────────────────
■ const 멤버 함수
─────────────────────────────────────────
int getX() const { return x_; }

일반 멤버 함수의 this 타입: T* const this       (객체 내용 수정 가능)
const 멤버 함수의 this 타입: const T* const this (객체 내용 수정 불가)

→ const 함수 내에서 멤버 변수 수정 불가 (mutable 멤버 제외)
→ const 객체는 const 멤버 함수만 호출 가능!

const MyClass obj(1, 2.0);
obj.getX();     // OK (const 함수)
obj.setX(5);    // 컴파일 에러! (non-const 함수는 const 객체에서 호출 불가)

─────────────────────────────────────────
■ this 포인터
─────────────────────────────────────────
비정적(non-static) 멤버 함수의 암묵적 첫 번째 매개변수.
현재 호출된 객체의 주소를 담은 포인터.

주요 활용:
① 이름 충돌 해결 (멤버 변수 vs 매개변수)
   void setX(int x) { this->x_ = x; }  // this->x_: 멤버, x: 매개변수

② 자기 대입 검사 (복사 대입 연산자에서 필수)
   if (this == &other) return *this;

③ 메서드 체이닝 (*this 반환)
   MyClass& setX(int x) { x_ = x; return *this; }
   obj.setX(1).setY(2).setZ(3);  // 연쇄 호출 가능

static 함수에는 this가 없음 (특정 객체와 무관하게 호출되므로).

─────────────────────────────────────────
■ static 멤버
─────────────────────────────────────────
static 멤버 변수: 클래스당 하나의 공유 변수 (모든 객체가 공유)
static 멤버 함수: this 없음, 정적 멤버에만 접근 가능

class Counter {
    static int count_;          // 선언 (클래스 내)
public:
    Counter()  { ++count_; }    // 객체 생성 시 증가
    ~Counter() { --count_; }    // 객체 소멸 시 감소
    static int getCount() { return count_; }  // 정적 멤버 함수
};
int Counter::count_ = 0;        // 정의 + 초기화는 반드시 클래스 외부!

Counter a, b;
cout << Counter::getCount();    // 2 (클래스 이름으로 호출)
cout << a.getCount();           // 2 (객체를 통한 호출도 가능, 비권장)

─────────────────────────────────────────
■ friend 선언
─────────────────────────────────────────
friend 함수/클래스: private, protected 멤버에 접근 가능하도록 허용.
상속되지 않음 — friend 관계는 파생 클래스로 전파되지 않는다.

class MyClass {
    int secret_ = 42;
    friend void reveal(const MyClass& obj);  // friend 함수 선언
    friend class Inspector;                   // friend 클래스 선언
};
void reveal(const MyClass& obj) {
    cout << obj.secret_;  // private 멤버에 접근 가능
}

─────────────────────────────────────────
■ mutable 키워드
─────────────────────────────────────────
const 멤버 함수 내에서도 수정 가능한 멤버 변수로 선언할 때 사용.
"논리적으로 const"(외부에 보이는 상태는 불변)이지만 내부 캐시/카운터는 바꿔야 할 때.

class Cache {
    mutable int accessCount_ = 0;  // const 함수에서도 수정 가능
    int data_;
public:
    int getData() const {
        ++accessCount_;  // mutable이므로 OK
        return data_;
    }
};`,
    codeExample: `// ① 초기화 리스트 — const/참조 멤버 예시
class Config {
    const int maxSize_;  // const: 반드시 리스트에서 초기화
    int& ref_;           // 참조: 반드시 리스트에서 초기화
    int val_;
public:
    Config(int max, int& r, int v)
        : maxSize_(max), ref_(r), val_(v) { }  // OK
    // Config(int max, int& r, int v) { maxSize_ = max; }  // 컴파일 에러!
};

// ② static 멤버 + 생성자/소멸자 카운터
class Widget {
    static int count_;
    int id_;
public:
    Widget() : id_(++count_) {
        cout << "Widget #" << id_ << " created\n";
    }
    ~Widget() {
        cout << "Widget #" << id_ << " destroyed\n";
        --count_;
    }
    static int getCount() { return count_; }
};
int Widget::count_ = 0;  // 클래스 외부 정의

// ③ const 함수 / mutable 캐시 패턴
class Matrix {
    mutable bool cached_ = false;
    mutable double det_ = 0.0;
    double data_[4];
public:
    double determinant() const {
        if (!cached_) {
            det_ = data_[0]*data_[3] - data_[1]*data_[2];
            cached_ = true;  // mutable이므로 const 함수에서 수정 OK
        }
        return det_;
    }
};`,
    commonPitfalls: [
      '다른 생성자를 하나라도 정의하면 컴파일러가 기본 생성자를 자동 생성하지 않음',
      '초기화 리스트 순서는 선언 순서 기준 — 리스트 작성 순서가 아님! 멤버끼리 의존 관계 주의',
      'const 객체에서 non-const 멤버 함수 호출 시 컴파일 에러',
      'static 멤버 변수는 클래스 내부에서 선언, 반드시 클래스 외부에서 정의(int C::x_ = 0;)',
    ],
  },
  {
    id: 'constructors',
    title: '생성자·소멸자·Rule of Three',
    titleEn: 'Constructors, Destructors & Rule of Three',
    icon: '⚙️',
    difficulty: 'intermediate',
    examFrequency: 5,
    studyOrder: 2,
    summary: 'Rule of Three: 포인터 멤버 → 소멸자+복사생성자+복사대입 연산자를 직접 정의. 얕은 복사 → double-free 위험!',
    relatedExamIds: ['prog-2024-2-2', 'prog-2022-2-1'],
    keyPoints: [
      '소멸자: 스코프 종료/delete 시 자동 호출, 반환값·매개변수 없음, 오버로드 불가',
      '얕은 복사: 포인터 주소만 복사 → 두 객체가 같은 메모리 공유 → double-free crash!',
      '깊은 복사: 새 메모리 할당 + 내용 복사 → 독립된 메모리 보유',
      'Rule of Three: 소멸자/복사생성자/복사대입 중 하나라도 직접 정의하면 셋 다 정의',
      '복사 대입 연산자 순서: ①자기대입 검사 ②기존 해제 ③새 할당·복사 ④*this 반환',
      'delete vs delete[]: new[]로 할당한 배열은 반드시 delete[]로 해제',
    ],
    theory: `─────────────────────────────────────────
■ 소멸자 (Destructor)
─────────────────────────────────────────
~ClassName() { ... }

특징:
• 반환값 없음, 매개변수 없음, 오버로드 불가 (클래스당 하나)
• 객체 수명이 끝날 때 자동 호출 (명시적 delete / 스코프 종료)
• 포인터 멤버(동적 메모리), 파일 핸들, 뮤텍스 등 자원 해제 담당

[소멸자 호출 시점]
• 지역 객체:            스코프(중괄호) 종료 시
• new로 생성된 객체:    delete 호출 시
• 전역/static 객체:     프로그램 종료 시 (생성 역순)
• 배열 원소:            배열 소멸 시 마지막 인덱스부터 역순

{
    MyClass a;    // a 생성자
    {
        MyClass b;  // b 생성자
    }             // b 소멸자 ← 먼저
}                 // a 소멸자

─────────────────────────────────────────
■ 객체 생성과 소멸 전체 순서
─────────────────────────────────────────
[생성 순서]
① 부모(base) 클래스 생성자 먼저 호출
② 멤버 변수 초기화 (선언 순서대로, 초기화 리스트 사용)
③ 생성자 본문 실행

[소멸 순서 — 생성의 역순]
① 소멸자 본문 실행
② 멤버 변수 소멸 (선언 역순)
③ 부모 클래스 소멸자 호출

─────────────────────────────────────────
■ 얕은 복사(Shallow Copy) vs 깊은 복사(Deep Copy)
─────────────────────────────────────────
컴파일러가 자동 생성하는 복사 생성자/복사 대입 연산자는 멤버를 비트 단위로 복사.
→ 포인터 멤버는 "주소값"만 복사 → 두 객체가 같은 메모리를 가리킴!

[얕은 복사가 일으키는 double-free 문제]

class Bad {
    char* name_;
public:
    Bad(const char* n) {
        name_ = new char[strlen(n)+1];
        strcpy(name_, n);
    }
    ~Bad() { delete[] name_; }
    // 복사 생성자/대입 연산자 없음 → 컴파일러가 얕은 복사 자동 생성
};

Bad a("hello");
Bad b = a;       // b.name_ == a.name_ (같은 주소!)
// 함수 종료 시: ~b() → delete[] name_ ← 해제 완료
//             ~a() → delete[] 이미 해제된 메모리 → double-free crash!

[깊은 복사 — 올바른 구현]
Bad(const Bad& other) {
    name_ = new char[strlen(other.name_)+1];  // 새 메모리 할당
    strcpy(name_, other.name_);               // 내용 복사
}

─────────────────────────────────────────
■ Rule of Three
─────────────────────────────────────────
"소멸자, 복사 생성자, 복사 대입 연산자 중 하나를 직접 정의한다면
 나머지 둘도 반드시 직접 정의하라."

이유: 포인터 멤버가 있어 소멸자에서 delete 한다면,
     컴파일러 자동 생성 복사 연산들도 얕은 복사를 수행하므로
     double-free 또는 메모리 누수 위험!

class Student {
    int   id_;
    char* name_;    // 포인터 멤버 → Rule of Three 필요!
public:
    // 생성자
    Student(int id, const char* name) : id_(id) {
        name_ = new char[strlen(name)+1];
        strcpy(name_, name);
    }

    // 1. 소멸자
    ~Student() {
        delete[] name_;    // 동적 할당 메모리 반환
    }

    // 2. 복사 생성자 (깊은 복사)
    Student(const Student& other) : id_(other.id_) {
        name_ = new char[strlen(other.name_)+1];
        strcpy(name_, other.name_);
    }

    // 3. 복사 대입 연산자 — 4단계 순서 중요!
    Student& operator=(const Student& other) {
        if (this == &other) return *this;       // ① 자기 대입 검사 (필수!)
        delete[] name_;                          // ② 기존 메모리 해제 (누수 방지)
        name_ = new char[strlen(other.name_)+1]; // ③ 새 메모리 할당 + 복사
        strcpy(name_, other.name_);
        id_ = other.id_;                         // ④ 나머지 멤버 복사
        return *this;                            // ⑤ *this 반환 (a=b=c 지원)
    }
};

─────────────────────────────────────────
■ 복사 대입 연산자 — 각 단계의 이유
─────────────────────────────────────────
① 자기 대입 검사 (if this == &other):
   s = s;  호출 시, ②를 먼저 실행하면 자신의 메모리를 해제하고 복사하는 사태 발생!

② 기존 메모리 해제 (delete[] name_):
   생략 시 기존 name_이 가리키던 메모리를 잃음 → 메모리 누수(memory leak)!

③ 새 메모리 할당 후 복사:
   기존 메모리 해제 후에만 안전하게 새 주소로 갱신 가능.

④ *this 반환:
   a = b = c;  처럼 연쇄 대입이 가능하려면 반환 타입이 T& 이어야 함.

─────────────────────────────────────────
■ delete vs delete[]
─────────────────────────────────────────
int*  p   = new int;       delete  p;   // 단일 객체
int*  arr = new int[10];   delete[] arr; // 배열 → 반드시 delete[]!

new[]로 할당한 것을 delete([] 없이)로 해제하면 → 미정의 동작(Undefined Behavior)
(배열 원소의 소멸자 호출 생략, 힙 메타데이터 오염 가능)

─────────────────────────────────────────
■ Rule of Five (C++11 — 참고)
─────────────────────────────────────────
C++11에서 이동 의미론(Move Semantics) 추가:
Rule of Three + 이동 생성자 + 이동 대입 연산자 = Rule of Five

Student(Student&& other) noexcept       // 이동 생성자
    : id_(other.id_), name_(other.name_) {
    other.name_ = nullptr;  // 원본은 nullptr로 → 소멸 시 double-free 방지
}

이동: 자원의 소유권을 "전달" → 불필요한 메모리 복사 없음 → 성능 향상.
복사: 완전히 새로운 독립 복제본 생성.

─────────────────────────────────────────
■ RAII (Resource Acquisition Is Initialization)
─────────────────────────────────────────
자원 획득 시점 = 객체 초기화 시점 (생성자)
자원 해제 시점 = 객체 소멸 시점 (소멸자)

→ 예외(exception)가 발생해도 스택 언와인딩으로 소멸자가 반드시 호출됨
→ 자원 누수 없이 안전한 자원 관리 가능
→ C++ 핵심 패턴: unique_ptr, shared_ptr, lock_guard 모두 이 원리로 동작`,
    codeExample: `// 얕은 복사 문제 vs 깊은 복사 해결 비교

// ▼ 위험: 컴파일러 자동 생성 복사 (얕은 복사)
class Bad {
    char* name_;
public:
    Bad(const char* n) { name_ = new char[strlen(n)+1]; strcpy(name_,n); }
    ~Bad() { delete[] name_; }
    // 복사 생성자/대입 없음 → 얕은 복사 → double-free!
};

// ▼ 안전: Rule of Three 완전 구현
class Good {
    int   id_;
    char* name_;
public:
    Good(int id, const char* n) : id_(id) {
        name_ = new char[strlen(n)+1];
        strcpy(name_, n);
    }
    ~Good() { delete[] name_; }

    Good(const Good& o) : id_(o.id_) {          // 복사 생성자
        name_ = new char[strlen(o.name_)+1];
        strcpy(name_, o.name_);
    }

    Good& operator=(const Good& o) {             // 복사 대입 연산자
        if (this == &o) return *this;            // ① 자기 대입 검사
        delete[] name_;                          // ② 기존 해제
        name_ = new char[strlen(o.name_)+1];     // ③ 새 할당
        strcpy(name_, o.name_);
        id_ = o.id_;
        return *this;                            // ④ *this 반환
    }
};

// ▼ C++11 이동 생성자 (Rule of Five)
Good(Good&& o) noexcept : id_(o.id_), name_(o.name_) {
    o.name_ = nullptr;  // 원본 무효화 → 소멸 시 delete nullptr는 안전
}`,
    commonPitfalls: [
      'Rule of Three 위반: 포인터 멤버가 있는데 소멸자만 정의하고 복사 생성자/대입 연산자를 빠뜨리면 얕은 복사로 double-free 발생',
      '복사 대입 연산자에서 자기 대입 검사(if this==&other)를 빠뜨리면 자신의 메모리를 해제 후 복사 시도 → crash',
      '복사 대입 연산자에서 기존 메모리 해제(delete[] 이전 값)를 빠뜨리면 메모리 누수',
      'new[]로 할당한 배열을 delete(대괄호 없이)로 해제하면 미정의 동작',
      '이동 생성자에서 원본 포인터를 nullptr로 초기화하지 않으면 원본 소멸 시 double-free',
    ],
  },
  {
    id: 'virtual-functions',
    title: '가상 함수와 다형성',
    titleEn: 'Virtual Functions & Polymorphism',
    icon: '🔄',
    difficulty: 'advanced',
    examFrequency: 5,
    studyOrder: 4,
    summary: 'virtual → 런타임 디스패치(vtable). non-virtual → 포인터 타입 기준 정적 바인딩. 가상 소멸자는 필수!',
    relatedExamIds: ['prog-2024-2-1', 'prog-2020-2-1', 'prog-2021-2-1'],
    keyPoints: [
      'virtual 키워드: 런타임 다형성 지원 (동적 디스패치)',
      '순수 가상 함수: virtual void f() = 0; → 추상 클래스',
      '가상 소멸자: 기반 클래스 포인터로 삭제 시 반드시 필요',
      'vtable: 가상 함수 포인터 테이블, 런타임에 호출 결정',
      '비가상 함수는 정적 바인딩 (컴파일 타임에 결정)',
    ],
    theory: `■ 정적 바인딩 vs 동적 바인딩
정적 바인딩 (Static Binding, 컴파일 타임):
  → non-virtual 함수, 포인터/참조 타입에 따라 호출 결정
  → 오버라이드해도 포인터 타입 기준으로 부모 함수 호출

동적 바인딩 (Dynamic Binding, 런타임):
  → virtual 함수, 실제 객체 타입에 따라 호출 결정
  → vtable(가상 함수 포인터 테이블)로 구현

■ vtable 메커니즘
각 클래스마다 vtable이 하나 존재:
  Student vtable:     → { &Student::m1, &Student::m2 }
  GradStudent vtable: → { &GradStudent::m1, &GradStudent::m2 }
  PhD vtable:         → { &PhD::m1, &GradStudent::m2 }  // m2는 GradStudent 버전

각 객체에는 vptr(vtable 포인터)이 있어 해당 클래스의 vtable을 가리킴
런타임에 obj->vptr->vtable[slot]을 통해 가상 함수 호출

■ 핵심 디스패치 규칙 요약
1. virtual 함수 → 실제 객체의 vtable에서 함수 포인터 조회 (동적)
2. non-virtual 함수 → 선언된 포인터 타입의 함수 직접 호출 (정적)
3. 가상 함수 내부에서 다른 가상 함수 호출 → 여전히 동적 (this->vptr 사용)

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

■ 2024년 2학기 기출 전체 출력 추적 (위 코드 기준)
PhD *mina = new PhD();  // Student() → GradStudent() → PhD() 순서 생성자 호출
  → "[++] ss", "[++] gs", "[++] phd"

ss->m1():
  m1은 virtual → PhD 객체의 vptr → PhD::m1() → "phd::m1"

ss->m3():
  m3은 non-virtual → Student::m3() 호출 (포인터 타입 Student* 기준)
  Student::m3() 내부: m2() 호출 → m2는 virtual → PhD 객체의 vtable → GradStudent::m2()
  → "gs::m2", 이후 "ss::m3"

gs->m1():
  m1은 virtual → PhD::m1() → "phd::m1"

gs->m3():
  m3은 non-virtual, gs는 GradStudent* → GradStudent::m3()
  내부 m1() → virtual → PhD::m1() → "phd::m1"
  이후 "gs::m3"

mina->m3():
  m3은 virtual (PhD에서 새로 virtual 선언) → PhD::m3()
  PhD::m3() 내: m4() 호출 → m4는 non-virtual → Student::m4() (this는 여전히 PhD 객체!)
  Student::m4() 내: m3() 호출 → m3는 virtual → PhD::m3() → 무한 재귀! → Stack Overflow

■ 순수 가상 함수 (Pure Virtual Function)
virtual void area() const = 0;  // = 0으로 선언
→ 추상 클래스(Abstract Class): 직접 인스턴스화 불가
→ 파생 클래스에서 반드시 override해야 함

■ 가상 소멸자 (Virtual Destructor) — 반드시 선언!
// Base* ptr = new Derived(); delete ptr;
// Base에 virtual ~Base()가 없으면 Derived::~Derived()가 호출 안 됨 → 메모리 누수
// 기반 클래스 포인터로 파생 클래스 객체를 삭제할 가능성이 있으면 항상 virtual 소멸자 선언

■ override와 final (C++11)
void m1() override { ... }  // 부모의 virtual 함수를 오버라이드함을 명시 (컴파일러 체크)
void m1() final { ... }     // 이 함수는 더 이상 override 불가
class Derived final { };    // 이 클래스는 상속 불가

■ 시험 함정 정리
• non-virtual 함수 내에서 virtual 함수를 호출하면 → 여전히 동적 바인딩!
  (this 포인터가 실제 객체를 가리키므로 vptr을 통해 가상 함수 조회)
• Student* ss = new PhD(); ss->m3() → m3이 non-virtual이므로 Student::m3() 호출
  하지만 m3 내부의 m2()는 virtual → GradStudent::m2() 호출 (동적!)
• 생성자 호출 순서: 부모→자식 순서 (상속 깊이 순)
• 소멸자 호출 순서: 자식→부모 순서 (역순)`,
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
    studyOrder: 3,
    summary: 'new/delete[], 포인터 역참조(*), 포인터 산술. Off-by-one 오류, 포인터 swap 함정에 주의.',
    relatedExamIds: ['prog-2025-2-2', 'prog-2024-1-1', 'prog-2022-1-1', 'prog-2021-1-1', 'prog-2020-1-1'],
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
    studyOrder: 8,
    summary: 'template<typename T>로 타입 일반화. 컴파일 타임 인스턴스화. T가 필요한 연산(+=, <<)을 지원해야 함.',
    relatedExamIds: ['prog-2025-1-2'],
    keyPoints: [
      'template<typename T>: 타입 파라미터화',
      '클래스 템플릿: 임의의 타입으로 동작하는 컨테이너',
      '템플릿 인스턴스화: 컴파일 타임에 구체 타입으로 생성',
      'Pair<LinkedList>가 컴파일 안 되는 이유: LinkedList가 필요한 연산을 지원하지 않을 때',
    ],
    theory: `■ 함수 템플릿 (Function Template)
template<typename T>
T max(T a, T b) { return (a > b) ? a : b; }

// 호출 시 T를 명시하거나 추론:
max<int>(3, 5);      // T=int로 명시
max(3.0, 5.0);       // T=double로 자동 추론

■ 클래스 템플릿 (Class Template)
template<typename T>
class Pair {
private:
    T* first;
    T* second;
public:
    Pair(T* a, T* b) : first(a), second(b) {}

    void add(const Pair<T>& other) {
        *first  += *(other.first);   // T에 += 연산자 필요!
        *second += *(other.second);
    }

    void print() const {
        cout << "(" << *first << "," << *second << ")" << endl;
    }
};

■ 인스턴스화 (Template Instantiation) — 컴파일 타임
Pair<int>는 컴파일 타임에 int용 코드를 생성
Pair<double>은 별도로 double용 코드를 생성
→ 실행 파일 크기가 커질 수 있음 (코드 팽창, code bloat)
→ 템플릿 정의는 헤더 파일에 있어야 함 (분리 컴파일 불가)

■ 2025년 1학기 기출: Pair<int> 추적
int data[4] = {1, 2, 3, 4};
// Pair 생성 (T=int 자동 추론 — C++17 CTAD)
Pair a(data,   data+2);  // first=&data[0] (값=1), second=&data[2] (값=3)
Pair b(data+1, data+3);  // first=&data[1] (값=2), second=&data[3] (값=4)

a.add(b);
// *a.first  += *b.first  → data[0] += data[1] → 1+2=3 → data[0]=3
// *a.second += *b.second → data[2] += data[3] → 3+4=7 → data[2]=7

a.print();  // (*a.first, *a.second) = (data[0], data[2]) = (3, 7)

■ Pair<LinkedList> 컴파일 실패 이유
Pair<LinkedList>를 인스턴스화하면 컴파일러가 add()를 확인:
  *first += *(other.first)  →  LinkedList에 operator+= 없음!

해결: LinkedList에 operator+= 헤더 선언 추가
class LinkedList {
public:
    LinkedList& operator+=(const LinkedList& other);  // 이 선언만 추가하면 컴파일 가능
    // (시험에서는 함수 헤더만 선언하면 됨, 구현 불필요)
};

■ 템플릿 특수화 (Template Specialization)
// 특정 타입에 대해 별도 구현 제공
template<>
class Pair<char*> {
    // char* 포인터를 위한 특별 처리
};

■ typename vs class (in template parameter)
template<typename T>  // 와 동일
template<class T>     // 둘 다 사용 가능, typename이 더 명확
typename을 쓰는 추가 경우: 의존 타입을 나타낼 때
  typename T::iterator it;  // T의 중첩 타입 명시적 지시

■ 시험 함정
• Pair<T>에서 T가 필요한 모든 연산(+=, <<, 복사 생성자 등)을 지원해야 함
• 함수 헤더만 선언해도 해당 함수 호출이 없으면 링크 오류 안 남 (Pair<LinkedList>::print()만 쓴다면 OK)
• 컴파일 타임 인스턴스화: T를 실제로 사용하는 코드에서만 오류 발생`,
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
    studyOrder: 6,
    summary: '소멸자에서 모든 노드 delete. append()는 앞에 추가(prepend). reverseHelper()는 재귀로 링크 방향 뒤집기.',
    relatedExamIds: ['prog-2025-1-1', 'prog-2020-2-1'],
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
    studyOrder: 7,
    summary: 'Stack: top=-1, push→arr[++top], pop→arr[top--]. Queue: front/rear, enqueue→arr[rear++], dequeue→arr[front++].',
    relatedExamIds: ['prog-2025-2-3'],
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
    studyOrder: 5,
    summary: 'clone() 패턴으로 다형적 깊은 복사. vector<Shape*>에서 add()는 s.clone() 사용. 소멸자에서 delete v[i].',
    relatedExamIds: ['prog-2025-2-1', 'prog-2021-2-1', 'prog-2022-2-1', 'prog-2023-1-1'],
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

  /* ── 2020 2학기 ─────────────────────────────── */
  {
    id: 'prog-2020-2-1',
    year: '2020',
    semester: '2',
    subject: 'prog',
    problemNumber: 1,
    totalPoints: 50,
    category: '가상 함수 & 포인터',
    title: '가상 함수 출력 추적 + 연결 리스트 포인터',
    codeBlock: `// Part A: 가상 함수 추적
class A {
public:
    virtual void foo() { cout << "A::foo" << endl; }
    void bar() { foo(); cout << "A::bar" << endl; }
};
class B : public A {
public:
    void foo() { cout << "B::foo" << endl; }
};

// Part B: 포인터와 연결 리스트
struct Node { int data; Node* next; };

Node* create(int v) {
    Node* n = new Node();
    n->data = v; n->next = nullptr;
    return n;
}`,
    description: '가상 함수 동적 디스패치와 연결 리스트 포인터를 분석합니다.',
    subQuestions: [
      {
        label: 'A', points: 25,
        text: `[25pts] 다음 코드의 출력을 쓰시오.
B b;
A* p = &b;
p->foo();
p->bar();`,
        answer: `출력:
B::foo
B::foo
A::bar

분석:
■ p->foo():
  foo()는 virtual → 실제 객체 B의 foo() → "B::foo"

■ p->bar():
  bar()는 non-virtual → A::bar() 실행
  A::bar() 내부: foo() 호출 → foo()는 virtual
  실제 객체가 B이므로 B::foo() → "B::foo"
  그 다음: "A::bar"`,
      },
      {
        label: 'B', points: 25,
        text: `[25pts] 연결 리스트 1→2→3을 만들고 역순(3→2→1)으로 출력하는 코드를 작성하시오. (재귀 사용)`,
        answer: `// 재귀적 역순 출력
void printReverse(Node* head) {
    if (head == nullptr) return;
    printReverse(head->next);  // 나머지를 먼저 출력
    cout << head->data << " ";
}

int main() {
    Node* head = create(1);
    head->next = create(2);
    head->next->next = create(3);
    printReverse(head);  // 출력: 3 2 1
    return 0;
}

동작 원리:
printReverse(1→2→3):
  printReverse(2→3):
    printReverse(3→null):
      printReverse(null): return
      출력: 3
    출력: 2
  출력: 1
→ 출력 순서: 3 2 1`,
      },
    ],
    tags: ['가상함수', '동적디스패치', '연결리스트', '재귀', '역순출력'],
  },

  /* ── 2021 1학기 ─────────────────────────────── */
  {
    id: 'prog-2021-1-1',
    year: '2021',
    semester: '1',
    subject: 'prog',
    problemNumber: 1,
    totalPoints: 50,
    category: '재귀 & 동적 메모리',
    title: '파스칼 삼각형 재귀 + 동적 2D 메모리',
    codeBlock: `// Part A: 파스칼 삼각형
int pascal(int row, int col) {
    if (col == 0 || col == row) return 1;
    return pascal(row-1, col-1) + pascal(row-1, col);
}

// Part B: 2D 동적 메모리
int** allocate2D(int rows, int cols) {
    int** arr = new int*[rows];
    for (int i = 0; i < rows; i++)
        arr[i] = new int[cols];
    return arr;
}

void deallocate2D(int** arr, int rows) {
    for (int i = 0; i < rows; i++)
        delete[] arr[i];
    delete[] arr;
}`,
    description: '파스칼 삼각형 재귀 구현과 2D 동적 메모리 할당/해제 분석.',
    subQuestions: [
      {
        label: '1', points: 20,
        text: '(1) pascal(4, 2)의 재귀 호출 트리를 그리고 최종 결과를 구하시오.',
        answer: `pascal(4, 2) = pascal(3, 1) + pascal(3, 2)

pascal(3, 1) = pascal(2, 0) + pascal(2, 1)
  pascal(2, 0) = 1  (base case)
  pascal(2, 1) = pascal(1, 0) + pascal(1, 1)
    pascal(1, 0) = 1
    pascal(1, 1) = 1
    → pascal(2, 1) = 2
  → pascal(3, 1) = 1 + 2 = 3

pascal(3, 2) = pascal(2, 1) + pascal(2, 2)
  pascal(2, 1) = 2  (위에서 계산)
  pascal(2, 2) = 1  (base case)
  → pascal(3, 2) = 2 + 1 = 3

pascal(4, 2) = 3 + 3 = 6

파스칼 삼각형 4행 2열:
      1
     1 1
    1 2 1
   1 3 3 1
  1 4 6 4 1  ← 4행 2열 = 6 ✓`,
      },
      {
        label: '2', points: 30,
        text: '(2) 3×4 2D 동적 배열을 할당하고 값을 채운 뒤, 올바르게 해제하는 전체 코드를 작성하시오. 각 단계에서 발생할 수 있는 메모리 오류를 설명하시오.',
        answer: `int main() {
    int rows = 3, cols = 4;

    // 1. 할당
    int** arr = new int*[rows];    // 포인터 배열
    for (int i = 0; i < rows; i++)
        arr[i] = new int[cols];    // 각 행 배열

    // 2. 초기화
    for (int i = 0; i < rows; i++)
        for (int j = 0; j < cols; j++)
            arr[i][j] = i * cols + j;

    // 3. 출력
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++)
            cout << arr[i][j] << " ";
        cout << endl;
    }

    // 4. 해제 (역순: 행 배열 먼저, 포인터 배열 마지막)
    for (int i = 0; i < rows; i++)
        delete[] arr[i];   // 각 행 해제
    delete[] arr;          // 포인터 배열 해제

    return 0;
}

주의사항:
• delete[] arr[i] 하지 않으면 각 행의 메모리 누수
• delete arr 대신 delete[] arr 사용해야 함
• 해제 순서 중요: 행 먼저, arr 나중에 (역순 할당)
• arr[i] 해제 후 arr 접근 금지 (dangling pointer)`,
      },
    ],
    tags: ['재귀', '파스칼삼각형', '동적메모리', '2D배열', 'delete[]'],
  },

  /* ── 2021 2학기 ─────────────────────────────── */
  {
    id: 'prog-2021-2-1',
    year: '2021',
    semester: '2',
    subject: 'prog',
    problemNumber: 1,
    totalPoints: 50,
    category: '가상 함수 & 타입캐스팅',
    title: '타입 캐스팅 출력 + Figure/Circle 가상 함수',
    codeBlock: `// Part A: 타입 캐스팅
int a = 5, b = 2;
double result = (double)a / b;

// Part B: Figure/Circle
class Figure {
public:
    virtual void draw() { cout << "Figure::draw" << endl; }
    void show() { draw(); cout << "Figure::show" << endl; }
};
class Circle : public Figure {
public:
    double radius;
    Circle(double r) : radius(r) {}
    void draw() { cout << "Circle::draw r=" << radius << endl; }
};`,
    description: '정수/실수 나눗셈의 타입 캐스팅 결과와 가상 함수 동적 디스패치를 분석합니다.',
    subQuestions: [
      {
        label: 'A', points: 20,
        text: `[20pts] 다음 코드의 출력을 쓰시오.
int a = 7, b = 2;
cout << a / b << endl;          // (1)
cout << (double)a / b << endl;  // (2)
cout << (double)(a / b) << endl; // (3)`,
        answer: `(1) 3
정수 나눗셈: 7 / 2 = 3 (소수점 버림)

(2) 3.5
(double)a = 7.0, 7.0 / 2 = 3.5 (부동소수점 나눗셈)

(3) 3
먼저 a/b = 3 (정수 나눗셈), 그 다음 (double)3 = 3.0
cout은 소수점 없이 3으로 출력 (기본 cout은 trailing zero 생략)
※ 실제로는 3.0을 출력하지만 기본 포맷에서 3으로 보임`,
      },
      {
        label: 'B', points: 30,
        text: `[30pts] 다음 코드의 출력을 분석하시오.
Circle c(5.0);
Figure* p = &c;
p->draw();
p->show();
c.show();`,
        answer: `출력:
Circle::draw r=5
Circle::draw r=5
Figure::show
Circle::draw r=5
Figure::show

분석:
■ p->draw():
  draw()는 virtual → 실제 객체 Circle::draw() → "Circle::draw r=5"

■ p->show():
  show()는 non-virtual → Figure::show() 실행
  내부 draw() 호출 → draw()는 virtual → Circle::draw() → "Circle::draw r=5"
  → "Figure::show"

■ c.show():
  Circle* 객체 c에서 show() → non-virtual → Figure::show()
  내부 draw() → virtual → Circle::draw() → "Circle::draw r=5"
  → "Figure::show"`,
      },
    ],
    tags: ['타입캐스팅', '정수나눗셈', '가상함수', '동적디스패치', 'non-virtual'],
  },

  /* ── 2022 1학기 ─────────────────────────────── */
  {
    id: 'prog-2022-1-1',
    year: '2022',
    semester: '1',
    subject: 'prog',
    problemNumber: 1,
    totalPoints: 40,
    category: '메모리 관리',
    title: 'unsigned char 오버플로우 + malloc/free 오류 분석',
    codeBlock: `#include <stdio.h>
#include <stdlib.h>

int sum_array(unsigned char* arr, int n) {
    int total = 0;
    for (int i = 0; i < n; i++)
        total += arr[i];
    return total;
}

int main() {
    int N = 300;
    unsigned char* data = (unsigned char*)malloc(N * sizeof(unsigned char));

    for (int i = 0; i < N; i++)
        data[i] = (unsigned char)(i % 256);

    printf("Sum = %d\\n", sum_array(data, N));

    free(data);
    free(data);  // 의도적 오류
    return 0;
}`,
    description: 'unsigned char 값 범위와 이중 해제(double-free) 오류를 분석합니다.',
    subQuestions: [
      {
        label: '1', points: 20,
        text: '[20pts] N=300일 때 sum_array()의 출력값을 계산하고, unsigned char의 값 범위로 인한 문제를 설명하시오.',
        answer: `unsigned char 범위: 0 ~ 255

data[i] = i % 256이므로:
i=0: 0, i=1: 1, ..., i=255: 255,
i=256: 256%256=0, i=257: 1, ..., i=299: 299%256=43

N=300일 때:
구간 [0..255]: 값 0~255, 합 = 255×256/2 = 32640
구간 [256..299] (44개): 값 0~43, 합 = 43×44/2 = 946

총 합 = 32640 + 946 = 33586

하지만 N=100으로 변경하면 data[100]에서 정상 작동:
합 = 0+1+...+99 = 99×100/2 = 4950

주요 문제:
• unsigned char의 최대값은 255
• data[i] = (unsigned char)i → i가 256 이상이면 wrapping (0부터 재시작)
• malloc에서 N=300이면 300바이트만 할당 → 정상 범위 내
• 하지만 값이 0~255 사이로 제한됨

N=1000으로 늘리면:
• malloc(1000) 자체는 가능
• 값: 0~255가 반복 (1000 % 256 = 232개의 패턴)`,
      },
      {
        label: '2', points: 20,
        text: '[20pts] 코드의 두 가지 버그를 찾고 수정하시오.',
        answer: `버그 1: free(data)를 두 번 호출 (Double-Free)
위치: main()의 마지막 두 줄
문제: 이미 해제된 메모리를 다시 해제 → Undefined Behavior, 프로그램 크래시
수정: 두 번째 free(data) 줄 삭제
또는: free 후 data = NULL 로 안전하게 처리

free(data);
data = NULL;  // 이중 해제 방지

버그 2: N=1000 시 잠재적 문제
N이 매우 크면 malloc 실패 가능 (NULL 반환)
수정: malloc 반환값 확인

unsigned char* data = (unsigned char*)malloc(N * sizeof(unsigned char));
if (data == NULL) {
    fprintf(stderr, "malloc failed\\n");
    return 1;
}`,
      },
    ],
    tags: ['unsigned char', 'overflow', 'malloc', 'free', 'double-free', '메모리관리'],
  },

  /* ── 2022 2학기 ─────────────────────────────── */
  {
    id: 'prog-2022-2-1',
    year: '2022',
    semester: '2',
    subject: 'prog',
    problemNumber: 1,
    totalPoints: 50,
    category: '상속 & 소멸자',
    title: 'Cars/ImportedCars/DomesticCars 상속 + CarList 소멸자',
    codeBlock: `class Cars {
protected:
    char* model_;
    int year_;
public:
    Cars(const char* m, int y);
    virtual ~Cars();
    virtual void print() const;
};

class ImportedCars : public Cars {
    char* country_;
public:
    ImportedCars(const char* m, int y, const char* c);
    virtual ~ImportedCars();
    void print() const override;
};

class DomesticCars : public Cars {
public:
    DomesticCars(const char* m, int y);
    void print() const override;
};

class CarList {
    Cars** list_;
    int size_;
    int capacity_;
public:
    CarList(int cap);
    ~CarList();
    void add(Cars* c);
    void printAll() const;
};`,
    description: '자동차 상속 계층구조와 포인터 배열을 이용한 CarList 소멸자를 구현합니다.',
    subQuestions: [
      {
        label: 'A', points: 25,
        text: '[25pts] Cars, ImportedCars, DomesticCars의 생성자와 소멸자를 올바르게 구현하시오. (깊은 복사, 메모리 해제 포함)',
        answer: `// Cars 생성자/소멸자
Cars::Cars(const char* m, int y) : year_(y) {
    model_ = new char[strlen(m) + 1];
    strcpy(model_, m);
}
virtual Cars::~Cars() {
    delete[] model_;
}
void Cars::print() const {
    cout << "Model: " << model_ << ", Year: " << year_ << endl;
}

// ImportedCars
ImportedCars::ImportedCars(const char* m, int y, const char* c) : Cars(m, y) {
    country_ = new char[strlen(c) + 1];
    strcpy(country_, c);
}
ImportedCars::~ImportedCars() {
    delete[] country_;
    // model_은 ~Cars()가 자동으로 해제
}
void ImportedCars::print() const {
    Cars::print();
    cout << "Country: " << country_ << endl;
}

// DomesticCars
DomesticCars::DomesticCars(const char* m, int y) : Cars(m, y) {}
// 소멸자: ~Cars()에서 model_ 해제하므로 추가 불필요
void DomesticCars::print() const {
    Cars::print();
    cout << "(국산)" << endl;
}`,
      },
      {
        label: 'B', points: 25,
        text: '[25pts] CarList 소멸자를 구현하고, add()와 printAll()을 완성하시오.',
        answer: `CarList::CarList(int cap) : size_(0), capacity_(cap) {
    list_ = new Cars*[cap];
}

// 소멸자: 각 Car 객체 delete
CarList::~CarList() {
    for (int i = 0; i < size_; i++)
        delete list_[i];   // 가상 소멸자로 올바른 파생 소멸자 호출
    delete[] list_;        // 포인터 배열 해제
}

void CarList::add(Cars* c) {
    if (size_ < capacity_)
        list_[size_++] = c;
}

void CarList::printAll() const {
    for (int i = 0; i < size_; i++) {
        list_[i]->print();  // 가상 함수 → 동적 디스패치
        cout << "---" << endl;
    }
}

// 사용 예:
int main() {
    CarList cl(10);
    cl.add(new DomesticCars("Sonata", 2022));
    cl.add(new ImportedCars("BMW 3", 2021, "Germany"));
    cl.printAll();
    return 0;
}  // cl 소멸자 → 각 Cars* delete → 메모리 정상 해제`,
      },
    ],
    tags: ['상속', '소멸자체인', '포인터배열', '가상소멸자', 'delete', 'Rule of Three'],
  },

  /* ── 2023 1학기 ─────────────────────────────── */
  {
    id: 'prog-2023-1-1',
    year: '2023',
    semester: '1',
    subject: 'prog',
    problemNumber: 1,
    totalPoints: 40,
    category: '재귀 & 포인터',
    title: '소수 체(Prime Sieve) 출력 + 재귀 분석',
    codeBlock: `#include <iostream>
using namespace std;

void sieve(bool* arr, int n) {
    for (int i = 2; i <= n; i++)
        arr[i] = true;
    for (int i = 2; i * i <= n; i++) {
        if (arr[i]) {
            for (int j = i * i; j <= n; j += i)
                arr[j] = false;
        }
    }
}

int countPrimes(bool* arr, int n) {
    int d = 0;
    for (int i = 2; i <= n; i++)
        if (arr[i]) d++;
    return d;
}

int main() {
    const int N = 20;
    bool arr[N + 1] = {};
    sieve(arr, N);
    int d = countPrimes(arr, N);
    cout << "d = " << d << endl;

    for (int i = 2; i <= N; i++)
        if (arr[i]) cout << i << " ";
    cout << endl;
    return 0;
}`,
    description: '에라토스테네스의 체(소수 구하기) 알고리즘의 출력을 분석합니다.',
    subQuestions: [
      {
        label: '1', points: 25,
        text: '[25pts] N=20일 때 코드의 출력을 쓰시오. sieve() 이후 arr[2..20]의 상태를 표로 나타내시오.',
        answer: `sieve(arr, 20) 실행:

초기화: arr[2..20] = true

i=2: 2²=4부터 짝수 제거
  arr[4]=false, arr[6]=false, arr[8]=false, arr[10]=false,
  arr[12]=false, arr[14]=false, arr[16]=false, arr[18]=false, arr[20]=false

i=3: 3²=9부터 3의 배수 제거
  arr[9]=false, arr[15]=false (arr[12] 이미 false)

i=4: arr[4]=false → 스킵

i=5: 5²=25>20 → 루프 종료

최종 상태:
index:  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20
arr[]:  T  T  F  T  F  T  F  F  F  T  F  T  F  F  F  T  F  T  F

소수: 2, 3, 5, 7, 11, 13, 17, 19

d = 8 (20 이하의 소수 개수)

출력:
d = 8
2 3 5 7 11 13 17 19`,
      },
      {
        label: '2', points: 15,
        text: '[15pts] sieve() 알고리즘의 시간 복잡도를 O-notation으로 쓰고 이유를 설명하시오.',
        answer: `시간 복잡도: O(n log log n)

분석:
외부 루프: i = 2 ~ √n
내부 루프: i², i²+i, i²+2i, ... ≤ n → n/i번 실행

총 연산 수:
Σᵢ (소수) n/i  (i=2,3,5,7,...)

소수 역수의 합: Σ (1/p for prime p ≤ n) = O(log log n)

따라서 전체: n × O(log log n) = O(n log log n)

실용적 의미:
• n=1,000,000: log log n ≈ log(20) ≈ 4.3
• 실제로 매우 빠른 알고리즘
• 이중 루프처럼 보이지만 O(n²)가 아님에 주의!`,
      },
    ],
    tags: ['소수', '에라토스테네스체', 'Sieve', 'O(n log log n)', '이중루프분석'],
  },
  /* ── 2020년 1학기 ── */
  {
    id: 'prog-2020-1-1',
    year: '2020',
    semester: '1',
    subject: 'prog',
    problemNumber: 1,
    totalPoints: 100,
    category: 'C 프로그래밍 기초',
    title: 'while 루프, 포인터, 배열, 형변환 종합',
    description: `C 프로그래밍 기초 종합 문제: while 루프 의미 비교, 함수 포인터 호출 결과, 배열 고유 원소 출력, 정수/실수 나눗셈.`,
    subQuestions: [
      {
        label: '1', points: 25,
        text: `(1) 다음 문장과 같은 의미를 가지는 것을 모두 고르시오.

while ( --counter >= 1 )
    printf( "%s\\n", counter % 2 ? "even" : "odd" );

(a) while ( --counter >= 1 )
        if ( counter % 2 ) printf( "even" ); else printf( "odd" );

(b) while ( counter >= 1 )
        if (counter % 2) printf( "even" ); else printf( "odd" );
        --counter;

(c) while ( counter >= 1 ) {
        if ( counter % 2 ) printf( "even" ); else printf( "odd" );
        --counter;
    }

(d) do {
        printf( "%s\\n", counter % 2 ? "odd" : "even" );
        --counter;
    } while ( counter >= 2 );`,
        answer: `정답: (a), (c)

(a): --counter로 먼저 감소 후 >=1 비교, counter%2로 홀짝 판별. 원본과 동일. ✓
(b): while 블록에 중괄호 없어 --counter는 루프 밖. 무한루프. ✗
(c): 중괄호 있지만 counter 감소가 printf 뒤. 그러나 조건이 counter>=1이고 먼저 감소하지 않으므로...
     원본은 --counter(전위감소) 후 비교이고, (c)는 비교 후 감소. 순서 다름.
     실제로는 (a)만 정확히 동일. (c)는 첫 반복에서 counter 감소 없이 시작하므로 다름.
     정답: (a)만 동일.

(d): odd/even 순서가 반대이고, do-while은 먼저 실행 후 조건 확인. 다른 동작. ✗`,
      },
      {
        label: '2', points: 25,
        text: `(2) 다음 코드의 출력은?

#include <stdio.h>
void Func(int k, int m, int e, int *s, double *a) {
    *s = k + m + e;
    *a = *s/3.0;
}
int main(void) {
    int k = 80, m = 80, e = 95, s = 0;
    double a = 0;
    Func(k, m, e, &s, &a);
    printf("s=%d, a=%lf", s, a);
    return 0;
}`,
        answer: `출력: s=255, a=85.000000

Func에서:
- *s = 80 + 80 + 95 = 255
- *a = 255 / 3.0 = 85.0
k, m, e는 값 전달(call by value), s와 a는 포인터로 전달(call by reference).
printf의 %lf는 double의 기본 소수점 6자리 출력.`,
      },
      {
        label: '3', points: 30,
        text: `(3) 배열 A의 고유(unique) 원소만 출력하는 C 프로그램을 작성하시오.

int A = {4,2,1,5,3,4,1,1,8,6};

스켈레톤 코드 사용, 필요 시 함수 추가 가능.`,
        answer: `#include <stdio.h>

int isUnique(int A[], int size, int idx) {
    for (int i = 0; i < size; i++) {
        if (i != idx && A[i] == A[idx]) return 0;
    }
    return 1;
}

int main(void) {
    int A[] = {4,2,1,5,3,4,1,1,8,6};
    int size = sizeof(A)/sizeof(A[0]);
    for (int i = 0; i < size; i++) {
        if (isUnique(A, size, i))
            printf("%d ", A[i]);
    }
    return 0;
}

출력: 2 5 3 8 6
(4는 2번, 1은 3번 등장하므로 제외)`,
      },
      {
        label: '4', points: 20,
        text: `(4) double 타입 변수 A에 대해 각 줄의 값과 이유를 쓰시오.

(a) (10p) A=7/2.0/2;
(b) (10p) A=7/2/2.0;`,
        answer: `(a) A = 7/2.0/2 = 3.5/2 = 1.75
- 7/2.0: int÷double → double 변환, 3.5
- 3.5/2: double÷int → double 변환, 1.75

(b) A = 7/2/2.0 = 3/2.0 = 1.5
- 7/2: int÷int → 정수 나눗셈, 3 (소수점 버림)
- 3/2.0: int÷double → double 변환, 1.5

핵심: 연산 순서(왼→오)와 형변환 규칙. int÷int=int, int÷double=double.`,
      },
    ],
    tags: ['while', '포인터', 'call by reference', '배열', '정수나눗셈', '형변환'],
  },
  /* ── 2023년 2학기 ── */
  {
    id: 'prog-2023-2-1',
    year: '2023',
    semester: '2',
    subject: 'prog',
    problemNumber: 1,
    totalPoints: 60,
    category: 'C 프로그래밍 기초',
    title: '재귀/반복 함수 분석 — 배열 원소 부분합',
    description: `배열 원소의 절반을 더하는 프로그램을 분석하시오.`,
    codeBlock: `#include <iostream>
#define N 10 // (b)
int check_modulo(int num)
{
    int modulo_three = num % 3;
    int flag = 0;
    if(modulo_three == 1) {
        flag = 1;
    }
    return flag;
}

int recursive_foo(int num)
{
    if(num == 0) {
        return 0;
    } else {
        int count = check_modulo(num);
        return count + recursive_foo(num-2);
    }
}

int iterative_foo(int num)
{
    int count = 0;
    for(int i=num;i>=0;i-=2) {
        // (c)
    }
    return count;
}

int main()
{
    int total = recursive_foo(N);
    //int total = iterative_foo(N);
    std::cout<<"total is "<<total<<std::endl; // (a)
    return 0;
}`,
    subQuestions: [
      {
        label: '1', points: 20,
        text: '(1) 프로그램 (a)에서 출력되는 결과는?',
        answer: `출력: total is 2

recursive_foo(10):
  check_modulo(10): 10%3=1, flag=1 → 1 + recursive_foo(8)
  check_modulo(8):  8%3=2,  flag=0 → 0 + recursive_foo(6)
  check_modulo(6):  6%3=0,  flag=0 → 0 + recursive_foo(4)
  check_modulo(4):  4%3=1,  flag=1 → 1 + recursive_foo(2)
  check_modulo(2):  2%3=2,  flag=0 → 0 + recursive_foo(0)
  recursive_foo(0) = 0

합: 1 + 0 + 0 + 1 + 0 + 0 = 2

check_modulo는 num%3==1일 때 1을 반환. N=10에서 2씩 감소하며 10,8,6,4,2,0 중 10과 4가 %3==1.`,
      },
      {
        label: '2', points: 20,
        text: '(2) #define N 11로 변경하면 어떻게 되나? recursive_foo()를 수정하시오.',
        answer: `N=11이면 recursive_foo(11) → recursive_foo(9) → ... → recursive_foo(1) → recursive_foo(-1) → recursive_foo(-3) → ...
num이 0이 되지 않아 무한 재귀 → 스택 오버플로우 발생!

수정:
int recursive_foo(int num) {
    if(num <= 0) {      // num == 0 → num <= 0
        return 0;
    } else {
        int count = check_modulo(num);
        return count + recursive_foo(num-2);
    }
}

핵심: 홀수 N에서는 2씩 빼면 0을 건너뛰므로 base case를 <= 0으로 변경.`,
      },
      {
        label: '3', points: 20,
        text: '(3) iterative_foo()가 수정된 recursive_foo()와 동일하도록 빈칸 (c)를 채우시오.',
        answer: `빈칸 (c):
count += check_modulo(i);

또는:
if(check_modulo(i)) count++;

iterative_foo는 for루프로 num부터 0 이상까지 2씩 감소하며
각 i에 대해 check_modulo를 호출하고 결과를 누적합니다.`,
      },
    ],
    tags: ['재귀', '반복', '#define', '스택오버플로우', 'base case', 'modulo'],
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
