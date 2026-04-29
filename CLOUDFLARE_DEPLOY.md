# Cloudflare Workers 배포

이 프로젝트는 Next.js App Router를 사용하므로 Cloudflare에서는 Pages 정적 배포가 아니라 Workers + OpenNext adapter로 배포한다.

## GitHub 자동 배포 설정

Cloudflare Dashboard에서 `Workers & Pages`로 이동한 뒤 `Create application`에서 GitHub 저장소를 연결한다.

- Repository: `Jay931203/Research`
- Production branch: `main`
- Build command: `npm run cf:build`
- Deploy command: `npx wrangler deploy`
- Non-production branch deploy command: `npx wrangler versions upload`
- Root directory: 비워 둠

Cloudflare Workers Builds는 `main`에 push될 때마다 build command를 실행하고, 이어서 deploy command로 `.open-next/worker.js`를 배포한다.

## 환경변수

Cloudflare 프로젝트의 `Settings > Variables & Secrets`에 아래 값을 추가한다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Next public 환경변수는 build 시점에도 필요하므로, Workers Builds의 build variables에도 같은 값을 넣는다.

## 로컬 명령

일반 개발은 기존처럼 실행한다.

```bash
npm run dev
```

Cloudflare 런타임용 산출물을 확인하려면 Linux/macOS 또는 Cloudflare 빌드 환경에서 실행한다.

```bash
npm run cf:build
npm run cf:preview
```

현재 로컬 Windows ARM 환경에서는 Wrangler의 `workerd` 바이너리 지원 문제로 preview/deploy가 실패할 수 있다. Cloudflare의 Linux 빌드 환경에서는 설치와 배포가 진행되도록 lockfile을 구성했다.
