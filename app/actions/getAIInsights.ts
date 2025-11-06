'use server';

import { checkUser } from '@/lib/checkUser';
import { db } from '@/lib/db';
import { generateExpenseInsights, generateAIAnswer, AIInsight, ExpenseRecord } from '@/lib/ai';

export interface InsightWithAnswer extends AIInsight {
  aiAnswer?: string;
}

export async function getAIInsights(): Promise<InsightWithAnswer[]> {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user's recent expenses (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expenses = await db.record.findMany({
      where: {
        userId: user.clerkUserId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to recent 50 expenses for analysis
    });

    // Convert to format expected by AI
    const expenseData: ExpenseRecord[] = expenses.map((expense) => ({
      id: expense.id,
      amount: expense.amount,
      category: expense.category || 'Other',
      description: expense.text,
      date: expense.date.toISOString(),
    }));

    if (expenses.length === 0) {
      // Return default insights for new users
      return [
        {
          id: 'welcome-1',
          type: 'info',
          title: 'Welcome to ExpenseTracker AI!',
          message:
            'Start adding your expenses to get personalized AI insights about your spending patterns.',
          action: 'Add your first expense',
          confidence: 1.0,
        },
        {
          id: 'welcome-2',
          type: 'tip',
          title: 'Track Regularly',
          message:
            'For best results, try to log expenses daily. This helps our AI provide more accurate insights.',
          action: 'Set daily reminders',
          confidence: 1.0,
        },
      ];
    }

    // Generate AI insights
    const insights = await generateExpenseInsights(expenseData);
    
    // Generate AI answers for each insight
    const insightsWithAnswers = await Promise.all(
      insights.map(async (insight) => {
        try {
          const question = `${insight.title}: ${insight.message} ${insight.action ? insight.action : ''}`;
          const aiAnswer = await generateAIAnswer(question, expenseData);
          return {
            ...insight,
            aiAnswer,
          };
        } catch (error) {
          console.error(`Error generating answer for insight ${insight.id}:`, error);
          return insight;
        }
      })
    );

    return insightsWithAnswers;
  } catch (error) {
    console.error('Error getting AI insights:', error);

    // Return fallback insights
    return [
      {
        id: 'error-1',
        type: 'warning',
        title: 'Insights Temporarily Unavailable',
        message:
          "We're having trouble analyzing your expenses right now. Please try again in a few minutes.",
        action: 'Retry analysis',
        confidence: 0.5,
      },
    ];
  }
}