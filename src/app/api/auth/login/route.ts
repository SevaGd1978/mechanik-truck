import { json, loginUser, optionsOk } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return optionsOk();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { login?: string; password?: string };
    const login = body.login?.trim() || "";
    const password = body.password || "";
    if (!login || !password) {
      return json({ error: "Укажите логин и пароль" }, 400);
    }
    const result = await loginUser(login, password);
    if (!result) {
      return json({ error: "Неверный логин или пароль" }, 401);
    }
    return json(result);
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Ошибка входа" },
      500,
    );
  }
}
