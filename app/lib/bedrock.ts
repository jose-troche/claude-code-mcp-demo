import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

type MessageContent = {
  type: string;
  text?: string;
  source?: {
    type: string;
    media_type: string;
    data: string;
  };
};

type Message = {
  role: string;
  content: string | MessageContent[];
};

interface BedrockResponseParams {
  model: string;
  messages: Message[];
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

// Initialize the Bedrock client
export const bedrockClient = new BedrockRuntimeClient({
  region: "us-east-1", // Update this to your preferred AWS region
});

// Create a function to generate responses using Claude on Bedrock
export async function generateBedrockResponse({
  model,
  messages,
  systemPrompt,
  temperature = 0.3,
  maxTokens = 1000,
}: BedrockResponseParams) {
  // Map model IDs to Bedrock model IDs
  const modelMap: Record<string, string> = {
    "claude-3-5-haiku-20241022": "anthropic.claude-3-5-haiku-20240620-v1:0",
    "claude-3-5-sonnet-20240620": "anthropic.claude-3-5-sonnet-20240620-v1:0",
    "claude-sonnet-4-20250514": "us.anthropic.claude-sonnet-4-20250514-v1:0", // Updated to correct Claude 4 ID with US region prefix
  };

  // Get the Bedrock model ID or fallback to Claude 3 Sonnet
  const bedrockModelId = modelMap[model] || "anthropic.claude-3-5-sonnet-20240620-v1:0";

  // Format messages for Bedrock
  const bedrockMessages = messages.map((msg: Message) => ({
    role: msg.role,
    content: Array.isArray(msg.content)
      ? msg.content
      : [{ type: "text", text: msg.content }],
  }));

  // Create the request payload
  const requestBody = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: maxTokens,
    messages: bedrockMessages,
    system: systemPrompt,
    temperature: temperature,
  };

  // Create the command
  const command = new InvokeModelCommand({
    modelId: bedrockModelId,
    body: JSON.stringify(requestBody),
    contentType: "application/json",
  });

  try {
    // Send the request to Bedrock
    const response = await bedrockClient.send(command);
    
    // Parse the response
    const responseBody = JSON.parse(
      new TextDecoder().decode(response.body)
    );
    
    return responseBody;
  } catch (error) {
    console.error("Error calling Bedrock:", error);
    throw error;
  }
}