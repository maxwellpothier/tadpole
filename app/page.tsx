import TodoList from "./components/TodoList";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <header className="mb-12">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1">
            Tadpole
          </h1>
          <p className="text-sm text-gray-500">Minimal task management</p>
        </header>
        <TodoList />
      </div>
    </main>
  );
}
