import { Component, lazy, Suspense } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

// Keep the app entry point lightweight. The Member 3 workspace contains the
// feature UI and its charting code, so load it as a separate bundle.
const Member3Workspace = lazy(() => import('./features/member3/Member3Workspace'))

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep this visible during development; connect to error monitoring later.
    console.error('Member 3 workspace failed to render.', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center bg-slate-50 px-6 py-12">
          <section
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
            aria-labelledby="workspace-error-title"
          >
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-rose-50 text-xl text-rose-600">
              !
            </div>
            <h1 id="workspace-error-title" className="mt-4 text-lg font-bold text-slate-900">
              Workspace couldn't load
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Something went wrong while opening the Member 3 workspace. Reload the page to try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            >
              Reload workspace
            </button>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

function AppLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <span
          aria-hidden="true"
          className="h-9 w-9 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600"
        />
        <p className="text-sm font-medium text-slate-600">Preparing your workspace...</p>
      </div>
    </main>
  )
}

function App() {
  return (
    <AppErrorBoundary>
      <Suspense fallback={<AppLoading />}>
        <Member3Workspace />
      </Suspense>
    </AppErrorBoundary>
  )
}

export default App
