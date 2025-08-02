#!/usr/bin/env node

/**
 * Child-Safe AI Configuration for FlashFusion
 * Adds content filtering and safety measures
 */

export const childSafeConfig = {
  // OpenAI Configuration
  openai: {
    model: 'gpt-4',
    temperature: 0.3, // Lower temperature for more predictable responses
    max_tokens: 500,  // Limit response length
    content_filter: true,
    moderation: true, // Enable content moderation
    safety_settings: {
      hate: 'block',
      harassment: 'block',
      violence: 'block',
      sexual: 'block',
      dangerous: 'block'
    }
  },

  // Anthropic Claude Configuration  
  anthropic: {
    model: 'claude-3-sonnet-20240229',
    max_tokens: 500,
    temperature: 0.2,
    safety_mode: 'strict',
    constitutional_ai: true
  },

  // Content Filtering Rules
  contentFilters: {
    blockedKeywords: [
      'inappropriate', 'violence', 'adult', 'gambling', 
      'drugs', 'alcohol', 'weapons', 'profanity'
    ],
    allowedTopics: [
      'education', 'creativity', 'learning', 'coding',
      'art', 'music', 'science', 'math', 'stories'
    ],
    ageRating: 'G', // G, PG, PG-13 ratings
    parentalControls: true
  },

  // Usage Limits (Child Protection)
  limits: {
    daily_requests: 100,
    monthly_budget: 25, // USD
    session_duration: 30, // minutes
    concurrent_users: 5
  },

  // Monitoring & Logging
  monitoring: {
    log_all_requests: true,
    notify_parents: true,
    content_review: true,
    audit_trail: true
  }
};

// Content Moderation Function
export async function moderateContent(text, apiKey) {
  const response = await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ input: text })
  });

  const result = await response.json();
  return {
    safe: !result.results[0].flagged,
    categories: result.results[0].categories,
    scores: result.results[0].category_scores
  };
}

// Safe AI Request Wrapper
export async function safeChatRequest(prompt, config = childSafeConfig) {
  // Pre-filter content
  const moderation = await moderateContent(prompt, process.env.OPENAI_API_KEY);
  
  if (!moderation.safe) {
    return {
      error: 'Content not appropriate for child-safe environment',
      blocked_categories: Object.keys(moderation.categories).filter(
        key => moderation.categories[key]
      )
    };
  }

  // Add safety instructions to prompt
  const safePrompt = `[CHILD-SAFE MODE] Please provide an educational, appropriate response suitable for all ages. Avoid any content that could be harmful, inappropriate, or unsuitable for children.\n\nUser question: ${prompt}`;

  // Make API request with safety settings
  // ... (actual API call implementation)
  
  return {
    response: 'Safe AI response here',
    safety_check: 'passed',
    content_rating: 'G'
  };
}