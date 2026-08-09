// Vercel serverless function: /api/chat
// Connects the LowisPrice "Lowi" owl to Anthropic's cloud (Messages API) and
// gives it live web search so it can look up real current prices.
//
// Required environment variable (Vercel → Project → Settings → Environment Variables):
//   ANTHROPIC_API_KEY   your key from https://console.anthropic.com
// Optional:
//   ANTHROPIC_MODEL     defaults to "claude-3-5-sonnet-latest"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "The site isn't connected to Anthropic yet — ANTHROPIC_API_KEY is not set on the server.",
    });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const context = typeof body.context === "string" ? body.context : "";

    const system =
      `You are Lowi, the price-savvy owl mascot of LowisPrice.com — a deal-hunting ` +
      `assistant who helps shoppers decide whether to buy now, wait, or make a guaranteed ` +
      `offer. Be warm, brief, and confident.\n\n` +
      `You have a live web_search tool. Use it whenever the shopper asks about a specific ` +
      `product, a real current price, availability, or "where is X cheapest right now" — ` +
      `search major retailers (Amazon, Best Buy, Walmart, Target, etc.), then give a ` +
      `specific answer with the price, the retailer, and a short buy/wait recommendation. ` +
      `If you searched, briefly say where the price came from. If the shopper only asks ` +
      `about the categories already shown on the page, you can answer from the data below ` +
      `without searching.\n\n` +
      `On-page demo prices right now:\n${context}\n\n` +
      `Key features to mention when relevant:\n` +
      `- Buyers can "Make an offer" below list price — the card is held (not charged) ` +
      `until the seller accepts within 3 days.\n` +
      `- If the seller doesn't respond in 3 days the hold auto-releases, no charge.\n` +
      `- "Buy now" verdict = historically low price.`;

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
        max_tokens: 1024,
        system,
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }],
        messages: messages
          .filter((m) => m && m.content)
          .map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: String(m.content),
          })),
      }),
    });

    const data = await anthropicRes.json();
    if (!anthropicRes.ok) {
      return res
        .status(anthropicRes.status)
        .json({ error: data?.error?.message || "Anthropic API error" });
    }

    const text = Array.isArray(data?.content)
      ? data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim()
      : "";

    return res.status(200).json({ text: text || "Hmm, I couldn't find that one — try rephrasing?" });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
