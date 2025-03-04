import { NotificationButton } from "../components/NotificationButton";
import { page } from "pager";

// Server action for sending notifications from the server
async function sendServerNotification() {
  "use server";

  await page("Server-side notification sent!", {
    apiKey: process.env.PAGER_API_KEY,
    backendUrl: process.env.PAGER_BACKEND_URL,
  });

  return { success: true };
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Pager Example</h1>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {/* Client component that uses the usePager hook */}
        <NotificationButton />

        {/* Server action form */}
        <form action={sendServerNotification}>
          <button
            type="submit"
            className="w-full p-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Send Server Notification
          </button>
        </form>
      </div>
    </main>
  );
}
