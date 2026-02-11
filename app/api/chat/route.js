export async function POST(req) {
  try {
    const { message } = await req.json();

    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-coder:6.7b",
        prompt: message,
        stream: true,
      }),
    });

    if (!ollamaRes.ok) {
      return new Response(JSON.stringify({ error: `Ollama API Error: ${ollamaRes.statusText}` }), {
        status: ollamaRes.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = ollamaRes.body.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter(Boolean);

            for (const line of lines) {
              try {
                const json = JSON.parse(line);
                if (json.response) {
                  controller.enqueue(encoder.encode(json.response));
                }
              } catch (e) {
                console.error("Error parsing JSON chunk", e);
              }
            }
          }
        } catch (err) {
          console.error("Stream reading error", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("API Route Error:", error);
    return new Response(JSON.stringify({ error: "Failed to connect to Ollama. Is it running?" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
