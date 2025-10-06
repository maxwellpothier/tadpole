import TodoList from "./components/TodoList";

const emojis = ["🐸", "🐋", "🐠", "🐡", "🦈", "🐙", "🦑", "🐚", "🦐", "🦞"];

function getRandomEmoji() {
  return emojis[Math.floor(Math.random() * emojis.length)];
}

export default function Home() {
  const emoji = getRandomEmoji();

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <header className="mb-12">
          <h1 className="text-3xl font-bold mb-1">
            <span className="text-4xl mr-3">{emoji}</span>
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Tadpole
            </span>
          </h1>
          <p className="text-sm text-gray-500">
            Start small. Grow bigger. Get stuff done.
          </p>
        </header>
        <TodoList />
      </div>
    </main>
  );
}
