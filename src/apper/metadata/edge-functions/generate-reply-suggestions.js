import apper from "https://cdn.apper.io/actions/apper-actions.js";

apper.serve(async (req) => {
  try {
    // Parse request body
    const { conversationHistory, currentInput, taskContext } = await req.json();
    
    // Validate required fields
    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return new Response(JSON.stringify({
        success: false,
        error: "Conversation history is required and must be an array"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get OpenAI API key from secrets
    const openaiApiKey = await apper.getSecret('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: "OpenAI API key not configured"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Format conversation context for AI
    const contextMessages = conversationHistory.slice(-5).map(comment => 
      `${comment.authorName}: ${comment.content}`
    ).join('\n');
    
    const taskInfo = taskContext ? `Task: ${taskContext.title || 'Untitled Task'}` : '';
    const inputContext = currentInput ? `Current input: "${currentInput}"` : '';

    const systemPrompt = `You are an AI assistant helping with professional CRM communication. Generate 3 contextual reply suggestions based on the conversation history. The suggestions should be:

1. Professional and appropriate for business communication
2. Contextually relevant to the conversation
3. Concise but helpful
4. Varied in tone (supportive, informative, action-oriented)
5. Ready to use without editing

Format your response as a JSON array of suggestion objects with 'text' and 'type' fields. Types should be: 'supportive', 'informative', or 'action'.

Context:
${taskInfo}
${inputContext}

Conversation:
${contextMessages}`;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      return new Response(JSON.stringify({
        success: false,
        error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}`
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const openaiData = await openaiResponse.json();
    const aiContent = openaiData.choices[0]?.message?.content;

    if (!aiContent) {
      return new Response(JSON.stringify({
        success: false,
        error: "No response generated from AI"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Parse AI response
    let suggestions;
    try {
      const parsed = JSON.parse(aiContent);
      suggestions = parsed.suggestions || parsed;
      
      if (!Array.isArray(suggestions)) {
        suggestions = [suggestions];
      }
    } catch (parseError) {
      // Fallback if JSON parsing fails
      suggestions = [
        {
          text: "Thanks for the update. I'll review this and get back to you shortly.",
          type: "supportive"
        },
        {
          text: "Could you provide more details about this? That would help me understand the situation better.",
          type: "informative"
        },
        {
          text: "Let's schedule a quick call to discuss this further. When would be a good time for you?",
          type: "action"
        }
      ];
    }

    // Ensure we have valid suggestions
    const validSuggestions = suggestions
      .filter(s => s && typeof s.text === 'string' && s.text.trim().length > 0)
      .slice(0, 3)
      .map((s, index) => ({
        text: s.text.trim(),
        type: s.type || ['supportive', 'informative', 'action'][index]
      }));

    if (validSuggestions.length === 0) {
      // Provide fallback suggestions
      validSuggestions.push(
        {
          text: "Thanks for bringing this to my attention. I'll look into it right away.",
          type: "supportive"
        },
        {
          text: "Can you share more context about this issue? Additional details would be helpful.",
          type: "informative"
        },
        {
          text: "I'll take care of this today and update you on the progress.",
          type: "action"
        }
      );
    }

    return new Response(JSON.stringify({
      success: true,
      suggestions: validSuggestions
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});