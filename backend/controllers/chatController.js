import productModel from "../models/productModel.js";

const chatWithBot = async (req, resp) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return resp.json({ success: false, message: "Message is required" });
    }

    const products = await productModel
      .find({})
      .select("name price category subCategory sizes bestseller");
    const productSummary = products
      .slice(0, 60)
      .map(
        (p) =>
          `${p.name} | ${p.category}/${p.subCategory} | $${p.price} | sizes: ${p.sizes.join(", ")}${p.bestseller ? " | bestseller" : ""}`,
      )
      .join("\n");

    const systemPrompt = `You are the customer support assistant for Vastra, an online clothing store.
Be friendly, concise, and helpful.

You can help with:
- Product questions and recommendations, using the product list below.
- General store questions (shipping, returns, sizing).
- Order status: you do NOT have access to live order data, so if asked, politely direct the user to their "Orders" page (available after logging in) to check status.

Current product catalog (name | category/subcategory | price | sizes):
${productSummary}

Keep replies short and conversational, a few sentences at most unless the user asks for detail.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((h) => ({
        role: h.role === "bot" ? "assistant" : "user",
        content: h.text,
      })),
      { role: "user", content: message },
    ];

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages,
          temperature: 0.7,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.log(data);
      return resp.json({
        success: false,
        message: data.error?.message || "Chat service error",
      });
    }

    const reply =
      data.choices?.[0]?.message?.content ||
      "Sorry, I couldn't come up with a response.";

    resp.json({ success: true, reply });
  } catch (error) {
    console.log(error);
    resp.json({ success: false, message: error.message });
  }
};

export { chatWithBot };
