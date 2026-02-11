
import Chat from "./Chat";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between pb-4 bg-gray-800">
      <div className="z-10 w-full items-center justify-between text-sm lg:flex bg-gray-900 border-b border-gray-700 p-4 sticky top-0">
        <h1 className="text-xl font-bold text-white">OllamaGPT</h1>
      </div>
      <div className="flex-1 w-full max-w-4xl p-4">
        <Chat />
      </div>
    </main>
  );
}
