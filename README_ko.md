<div align="center">
  <img width="180" src="./media/icon.svg" alt="TypeScript Remove (tsr) logo" />
</div>
<div align="center">
  <a href="https://badge.fury.io/js/tsr"><img alt="npm version" src="https://badge.fury.io/js/tsr.svg" /></a>
  <a href="https://packagephobia.com/result?p=tsr"><img alt="install size" src="https://packagephobia.com/badge?p=tsr" /></a>
  <a href="https://github.com/tsrorg/tsr/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/tsrorg/tsr/actions/workflows/ci.yml/badge.svg?branch=main" /></a>
</div>

# tsr

TypeScript Remove (tsr)은 TypeScript 프로젝트에서 사용되지 않는 코드를 제거하는 유틸리티입니다. 이는 소스 파일에 대한 트리 쉐이킹과 유사합니다.

[English](./README.md) | 한국어

[Migrating from v0.x (ts-remove-unused)](./doc/migration.md)

## 기능

### 🕵️ 사용되지 않는 코드 찾기

tsr는 번들러에서 트리 쉐이킹이 구현되는 방식처럼 TypeScript 프로젝트를 정적으로 분석합니다. tsr를 실행하면 TypeScript 프로젝트에서 사용되지 않는 export와 파일(모듈)의 목록을 얻을 수 있습니다. CI 파이프라인에서 tsr를 사용하여 추가되는 사용되지 않는 코드를 감지할 수 있습니다.

### 🧹 사용되지 않는 코드 자동 제거

tsr는 자동 코드 제거를 위해 만들어졌습니다. tsr은 사용되지 않는 선언에서 export 키워드를 제거할 뿐만 아니라, 파일 내에서 사용되지 않는 선언은 전체 선언을 제거합니다. tsr은 또한 선언을 제거한 후 필요 없어지는 임포트와 다른 로컬 선언도 제거합니다. [tsr이 파일을 어떻게 편집하는지에 대한 예제를 확인해보세요.](#examples)

### 📦 즉시 사용 가능

tsr은 TypeScript 컴파일러를 사용하여 프로젝트의 파일을 감지하고 임포트를 해결합니다. 유일한 요구 사항은 유효한 `tsconfig.json`입니다. tsr을 실행하기 위해 다른 설정 파일을 설정할 필요가 없습니다. 진입점 파일을 지정하고 몇 초 안에 tsr을 사용하기 시작하세요.

## 설치

```bash
npm i tsr
```

TypeScript는 피어 종속성(peer dependency)입니다.

## 빠른 시작

1. **🔍 `tsconfig.json` 확인** – `include` 및 `exclude`가 철저하게 구성되어 tsr이 사용하지 않는 코드를 올바르게 감지할 수 있도록 하세요.

2. **🔍 진입점 파일 확인** – 진입점 파일이 없으면 모든 파일이 불필요합니다. 일반적으로 `src/main.ts`와 같은 파일이나 `src/pages/*`와 같은 파일 그룹이 될 수 있습니다.

3. **🚀 실행** – 진입점과 일치하는 정규 표현식 패턴을 전달하세요. `--write`를 사용하여 파일을 제자리에서 변경합니다.

```bash
npx tsr 'src/main\.ts$'
```

## 사용법

### CLI

<!-- prettier-ignore-start -->

```

사용법:
  tsr [options] [...entrypoints]

옵션:
  -p, --project <file>    tsconfig.json 파일의 경로
  -w, --write             변경 사항을 즉시 반영
  -r, --recursive         프로젝트가 정리될 때까지 파일을 재귀적으로 검사
  --include-d-ts          .d.ts 파일에서 사용되지 않는 코드 확인
  -h, --help              이 메시지 표시
  -v, --version           버전 번호 표시

예시:
  # 프로젝트의 진입점이 src/main.ts인 경우 사용하지 않는 코드를 검사
  tsr 'src/main\.ts$'

  # 변경 사항을 즉시 적용
  tsr --write 'src/main\.ts$'

  # 커스텀 tsconfig.json을 사용하는 프로젝트의 경우 사용하지 않는 코드를 검사
  tsr --project tsconfig.app.json 'src/main\.ts$'

  # src/pages에 여러 개의 진입점이 있는 프로젝트의 경우 사용하지 않는 코드를 검사
  tsr 'src/pages/.*\.ts$'

```
<!-- prettier-ignore-end -->

#### `-p`, `--project`

코드베이스를 분석하는 데 사용되는 `tsconfig.json`을 지정합니다. 기본값은 프로젝트 루트에 있는 `tsconfig.json`입니다.

```bash
npx tsr --project tsconfig.client.json 'src/main\.ts$'
```

#### `-w`, `--write`

수정 가능한 변경사항을 해당 위치에 바로 적용합니다.

> [!경고]
> 이 작업은 코드를 삭제할 수 있습니다. Git으로 관리되는 환경에서 사용하는 것을 강력히 권장합니다.

#### `-r`, `--recursive`

기본적으로 CLI는 모든 파일을 한 번만 처리합니다.
프로젝트 내 다른 파일의 수정으로 인해 사용되지 않게 된 코드는 이 방식으로는 감지되지 않을 수 있습니다.
이 옵션을 활성화하면, tsr은 한 파일의 변경으로 영향을 받을 수 있는 다른 파일들도 재귀적으로 탐색합니다.

이 방식은 시간이 더 오래 걸리지만, 한 번의 실행으로 전체 프로젝트를 수정하고자 할 때 유용합니다.

#### `--include-d-ts`

기본적으로 `.d.ts`파일에서 export된 타입은 감지되지 않습니다.
`.d.ts`파일의 타입도 포함하고 싶다면 `--include-d-ts`옵션을 사용하세요.

### JavaScript API

또는 JavaScript API를 사용하여 tsr을 실행할 수도 있습니다.

```typescript
import { tsr } from 'tsr';

await tsr({
  entrypoints: [/main\.ts/],
  mode: 'check',
}).catch(() => {
  process.exitCode = 1;
});
```

프로젝트 경로 및 커스텀 `tsconfig.json`파일을 수동으로 지정할 수 있습니다.

```typescript
await tsr({
  entrypoints: [/main\.ts/],
  mode: 'check',
  configFile: 'tsconfig.sample.json',
  projectRoot: '/path/to/project',
});
```

사용 가능한 모든 옵션을 확인하려면 `import('tsr').Config` 타입을 참고하세요.

## 제외하기

`export` 선언에 `// tsr-skip` 주석을 추가하면, 해당 항목은 제거 대상에서 제외됩니다.

```ts
// tsr-skip
export const hello = 'world';
```

## 테스트 파일

테스트를 위한 별도의 `tsconfig`를 [Project References(프로젝트 참조)](https://www.typescriptlang.org/docs/handbook/project-references.html) 방식으로 분리해두셨다면 아주 좋습니다!
tsr은 테스트 목적만으로 존재하는 export나 파일을 제거합니다.

만약 구현 코드와 테스트 파일을 모두 포함하는 `tsconfig.json`을 CLI에 전달하면,
기본적으로 진입점(entry point) 파일에서 참조되지 않는 테스트 파일은 제거될 수 있습니다.

임시 방편으로는 테스트 파일과 일치하는 패턴을 인자로 전달하여 삭제를 피할 수 있지만,
가장 권장되는 방법은 Project References를 사용하여 TypeScript 설정 자체를 더 엄격하고 견고하게 만드는 것입니다
(이 라이브러리뿐만 아니라 전체 개발환경을 위해서도요.)

```bash
npx tsr -w 'src/main\.ts$' ## tsconfig에 따라 테스트 파일이 삭제될 수 있습니다.
npx tsr -w 'src/main\.ts$' '.*\.test\.ts$' ## 테스트 파일을 진입점으로 지정하면 삭제를 피할 수 있습니다.
```

## 비교

### TypeScript

`compilerOptions.noUnusedLocals` 옵션을 활성화하면, **읽히지 않는 선언(declaration)** 에 대해 경고가 표시됩니다.

```typescript
// 'a'는 선언되었지만, 값이 읽히지 않았습니다.
const a = 'a';
```

하지만 이 값을 `export`할 경우, 프로젝트 내에서 실제로 사용되지 않더라도 에러가 발생하지 않습니다.
tsr의 목적은 프로젝트 전역에서의 사용 여부를 고려하여, 사용되지 않는 코드를 감지하고 수정하는 것입니다.

### ESLint

ESLint는 사용되지 않는 import를 감지할 수 있으며, `eslint-plugin-unused-imports` 같은 플러그인을 통해 자동 수정도 가능합니다.

```typescript
// 'foo'는 정의되었지만 사용되지 않았습니다.
import { foo } from './foo';
```

하지만, 사용되지 않는 export는 감지할 수 없습니다.
ESLint는 기본적으로 파일 단위로 동작하도록 설계되어 있어, 프로젝트 전체 범위의 사용 여부를 기반으로 분석하는 기능은 제공되지 않습니다.

```typescript
// 이 export가 프로젝트 내에서 실제로 사용되는지를 감지하는 규칙은 도입되기 어렵습니다.
export const a = 'a';
```

tsr의 주요 목표는 사용되지 않는 export를 제거하거, 관련 모듈 자체를 삭제하는 것입니다.
또한 export 제거의 결과로 발생하는 불필요한 import도 함께 제거합니다.

### Knip

Knip은 저장소 내의 사용되지 않는 코드(심지어 의존성까지)를 감지하는 것을 목표로 하는 포괄적인 라이브러리입니다.
물론 Knip과 tsr 간에는 몇 가지 뚜렷한 차이가 존재하며, 예를 들어 tsr은 TypeScript 프로젝트 전용이라는 점이 대표적입니다.

아래는 두 라이브러리 간의 주요 차이점입니다.

#### 자동 수정을 위한 설계

tsr은 처음부터 자동 코드 수정을 위해 설계된 라이브러리입니다.
Knip도 현재 자동 수정 기능을 제공하지만, 그 기능에는 일부 제약이 있습니다.
예를 들어 다음 코드를 고려해봅시다.

```typescript
export const a = 'a';

export const f = () => a2;

const a2 = 'a2';
```

위 코드에서 `f()`가 프로젝트 내에서 사용되지 않는 경우,

- Knip은 `export` 키워드만 제거합니다.
- tsr은 `f()`선언 자체를 제거하며, `a2`도 함께 삭제합니다.

#### 설정 없이 바로 사용 가능 (Zero Configuration)

Knip은 사용자가 별도의 설정 파일을 제공해야 합니다. 이는 유연성을 제공하지만, 자신의 프로젝트에 맞게 Knip을 정확히 설정하는 것이 다소 복잡할 수 있습니다.
반면, tsr은 `tsconfig.json` 만 있으면 추가 설정 없이 바로 동작합니다. 즉, 저장소에 TypeScript 설정이 이미 되어 있다면 tsr을 곧바로 사용할 수 있습니다.

#### 더 명확한 동작 방식

Knip은 프로젝트 구조에 대해 몇 가지 가정을 하며, 자체 모듈 해석 방식(custom module resolution)을 사용합니다.
이런 설계는 특정 상황에서는 유용할 수 있고 TypeScript가 지원하지 않는 파일 타입도 처리 가능하게 하지만, 때로는 예측하기 어려운 결과를 초래할 수 있습니다.

반면, tsr은 TypeScript 기반의 모듈 해석만을 사용하며, `tsconfig.json` 을 통해 모든 동작을 명확히 제어할 수 있도록 설계되어 있습니다.
즉, 당신의 프로젝트가 TypeScript의 타입 검사를 통과하면 tsr도 잘 작동하며, 타입 검사(tsc)가 실패하면 tsr도 정확한 결과를 낼 수 없습니다.

#### 최소한의 설계

tsr은 단일 목적을 위한 최소한의 설계(minimal design)를 추구합니다.
설치 용량도 현저히 작고, 실행 시 `@types/node` 에 의존하지 않는 런타임 기반으로 작동합니다.

| tsr  | Knip   |
| ---- | ------ |
| 98kB | 5.86MB |

#### 더 나은 성능

벤치마크 결과에 따르면, tsr은 Knip보다 약 2.14배 더 빠릅니다🚀
(자세한 내용은 `benchmark/vue_core.sh` 파일 참고)

<img width="400" src="./media/comparison.png" alt="benchmark of tsr and Knip" />

#### 재귀 편집 기능

tsr은 `--recursive` 옵션을 통해,
한 번의 실행으로 사용되지 않는 코드를 모두 제거할 때까지 파일을 반복적으로 편집합니다.

#### 주요 차이점

| 기능 항목            | tsr                            | Knip                                   |
| -------------------- | ------------------------------ | -------------------------------------- |
| **자동 코드 수정**   | ✅ 포괄적인 자동 편집 지원     | 제한적                                 |
| **설정 필요 없음**   | ✅ `tsconfig.json` 만으로 작동 | 정확한 결과를 위해 별도 설정 파일 필요 |
| **예측 가능한 동작** | ✅ TypeScript 기반의 로직      | 프로젝트 구조에 대한 가정이 존재       |
| **설치 용량**        | ✅ 98kB, 최소한의 의존성       | 5.86MB, `@types/node` 필요             |
| **성능**             | ✅ 2.14배 더 빠름              |                                        |
| **재귀 편집 기능**   | ✅ `--recursive` 옵션 지원     |                                        |

## 예시

tsr이 사용되지 않는 코드를 발견했을 때, 파일을 어떻게 수정하는지에 대한 예시입니다.

<!-- prettier-ignore-start -->

프로젝트 내에서 `a2`가 사용되지 않을 경우:

```diff
--- src/a.ts
+++ src/a.ts
@@ -1,3 +1 @@
 export const a = 'a';
-
-export const a2 = 'a2';
```

프로젝트 내에서 `b`는 사용되지 않지만 `f()`는 사용될 경우:

```diff
--- src/b.ts
+++ src/b.ts
@@ -1,5 +1,5 @@
-export const b = 'b';
+const b = 'b';
 
 export function f() {
     return b;
 }
```

프로젝트 내에서 `f()`가 사용되지 않고, 이를 삭제하면 해당 `import`문도 불필요해지는 경우:

```diff
--- src/c.ts
+++ src/c.ts
@@ -1,7 +1 @@
-import { cwd } from "node:process";
-
 export const c = 'c';
-
-export function f() {
-    return cwd();
-}
```

프로젝트 내에서 `f()`와 `exported`가 사용되지 않고, `f()`를 삭제함으로써 `exported`와 `local`또한 불필요해지는 경우:

```diff
--- src/d.ts
+++ src/d.ts
@@ -1,8 +1 @@
-export const exported = "exported";
-const local = "local";
-
 export const d = "d";
-
-export function f() {
-  return { exported, local };
-}

```

<!-- prettier-ignore-end -->

## 기여하기

기여는 언제나 환영입니다!

## 작성자

Kazushi Konosu (https://github.com/kazushisan)

## License

```
Copyright (C) 2023 LINE Corp.

이 파일은 Apache License, Version 2.0(이하 "License") 하에 License가 부여됩니다.
License에 따라 사용하지 않으면 안 됩니다.
License 사본은 다음에서 확인하실 수 있습니다:

http://www.apache.org/licenses/LICENSE-2.0

적용 법률 또는 서면 동의에 따라 요구되지 않는 한,
이 소프트웨어는 License에 따라 "(AS IS)" 제공되며,
명시적이든 묵시적이든 어떠한 보증이나 조건도 포함하지 않습니다.
License에 따른 권한 및 제한 사항에 대한 자세한 내용은 해당 License를 참조하십시오.
```
