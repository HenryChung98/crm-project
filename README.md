- [nextjs](https://nextjs.org/docs/app/getting-started/installation)
- [react-icons](https://react-icons.github.io/react-icons/)
- npm install zustand
- npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr
- npm install typed-countries

(supabase)[https://supabase.com/]

### env file template

##### supabase

NEXT_PUBLIC_SUPABASE_URL= Connect -> App Frameworks

NEXT_PUBLIC_SUPABASE_ANON_KEY= Connect -> App Frameworks

NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY= Project Settings -> API Keys -> Legacy API Keys

##### Google OAuth Provider

[google console](https://console.cloud.google.com/)

api 및 서비스 -> OAuth 동의 화면 -> 시작하기 -> OAuth 클라이언트 만들기 -> 승인된 JavaScript 원본: http://localhost:3000 -> 승인된 리디렉션 URI: supabase callback url -> 만들기

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=
