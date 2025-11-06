import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export interface ExpenseRecord {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface AIInsight {
  id: string;
  type: "warning" | "info" | "success" | "tip";
  title: string;
  message: string;
  action?: string;
  confidence: number;
}

interface AIInsightResponse {
  type?: "warning" | "info" | "success" | "tip";
  title?: string;
  message?: string;
  action?: string;
  confidence?: number;
}

export async function generateExpenseInsights(
  expenses: ExpenseRecord[]
): Promise<AIInsight[]> {
  try {
    // Calculate summary statistics
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const categoryTotals: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    
    expenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      categoryCounts[expense.category] = (categoryCounts[expense.category] || 0) + 1;
    });

    // Group by date to find spending patterns
    const dateGroups: Record<string, number> = {};
    expenses.forEach((expense) => {
      const date = expense.date.split('T')[0];
      dateGroups[date] = (dateGroups[date] || 0) + expense.amount;
    });

    const summary = {
      totalAmount,
      categoryTotals,
      categoryCounts,
      totalExpenses: expenses.length,
      dateGroups,
      expenses: expenses.map(({ amount, category, description, date }) => ({
        amount,
        category,
        description,
        date: date.split('T')[0],
      })),
    };

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are a financial AI analyst. Analyze expense data and return ONLY a valid JSON array of 3-4 insights. Each insight must have:
- type: "warning" (for high spending alerts), "success" (for positive patterns), "tip" (for savings opportunities), or "info" (for general information)
- title: A concise, actionable title (e.g., "High Transportation Costs", "Potential Savings on Food")
- message: A detailed summary with specific amounts, timeframes, and categories (e.g., "You spent $183 on Transportation in the last 4 days, with $133 on gas alone.")
- action: A specific, actionable suggestion (e.g., "Consider carpooling, public transport, or fuel-efficient routes to reduce gas expenses.")
- confidence: A number between 0.5 and 1.0

Return ONLY the JSON array, no markdown, no code blocks, no explanation.`,
        },
        {
          role: "user",
          content: `Analyze this expense data and generate financial insights:\n${JSON.stringify(summary, null, 2)}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 1200,
    });

    const content = completion.choices[0].message.content?.trim() || '[]';
    // Remove markdown code blocks if present
    const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const json = JSON.parse(cleanedContent) as AIInsightResponse[];

    return json.map((item: AIInsightResponse, i: number) => ({
      id: `ai-${Date.now()}-${i}`,
      type: item.type ?? "info",
      title: item.title ?? "Insight",
      message: item.message ?? "",
      action: item.action ?? "",
      confidence: item.confidence ?? 0.8,
    }));
  } catch (err) {
    console.error("AI Insight Error:", err);
    return [
      {
        id: "fallback",
        type: "info",
        title: "AI Unavailable",
        message: "Try again later.",
        confidence: 0.5,
      },
    ];
  }
}

export async function categorizeExpense(description: string): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "Return only one category: Food, Transportation, Entertainment, Shopping, Bills, Healthcare, Other.",
        },
        { role: "user", content: description },
      ],
      temperature: 0,
      max_tokens: 8,
    });

    const category = completion.choices[0].message.content?.trim();
    const valid = [
      "Food",
      "Transportation",
      "Entertainment",
      "Shopping",
      "Bills",
      "Healthcare",
      "Other",
    ];

    return valid.includes(category ?? "") ? category! : "Other";
  } catch (err) {
    console.error("Categorize Error:", err);
    return "Other";
  }
}

export async function generateAIAnswer(
  question: string,
  context: ExpenseRecord[]
): Promise<string> {
  try {
    // Calculate summary statistics for better context
    const totalAmount = context.reduce((sum, e) => sum + e.amount, 0);
    const categoryTotals: Record<string, number> = {};
    
    context.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const summary = {
      totalAmount,
      categoryTotals,
      totalExpenses: context.length,
      expenses: context.map(({ amount, category, description, date }) => ({
        amount,
        category,
        description,
        date: date.split('T')[0],
      })),
    };

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { 
          role: "system", 
          content: "You are a financial advisor. Write a concise paragraph (maximum 6-7 lines) with actionable advice. Use paragraph format only - NO numbered lists, NO bullet points, NO markdown formatting, NO bold text, NO headings. Write in flowing sentences. Include specific amounts and timeframes when relevant. Be direct and practical." 
        },
        {
          role: "user",
          content: `Expense Data: ${JSON.stringify(summary, null, 2)}\n\nQuestion/Insight: ${question}\n\nProvide a concise paragraph analysis (6-7 lines maximum) with specific recommendations and potential savings. Write in paragraph format only - no lists, no bullets, no formatting.`,
        },
      ],
      temperature: 0.6,
      max_tokens: 150,
    });

    let answer = completion.choices[0].message.content?.trim() ?? "No answer available.";
    
    // Clean up any markdown formatting that might have been added
    answer = answer
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/^\d+\.\s/gm, '') // Remove numbered list markers at start of lines
      .replace(/^[-*+]\s/gm, '') // Remove bullet points
      .replace(/\n{2,}/g, '\n') // Replace multiple newlines with single
      .trim();
    
    // Limit to approximately 6-7 lines (roughly 500 characters)
    const lines = answer.split('\n');
    if (lines.length > 7) {
      answer = lines.slice(0, 7).join(' ').trim();
    }

    return answer;
  } catch (err) {
    console.error("Q&A Error:", err);
    return "Unable to process right now.";
  }
}
