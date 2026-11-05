export const ASSISTANT_TITLE = "RealityNG AI";
export const ASSISTANT_SUBTITLE = "Your RealityNG property assistant";
export const ASSISTANT_PLACEHOLDER = "Ask me about RealityNG...";
export const ASSISTANT_WELCOME =
  "Hi! Welcome to RealityNG. 👋\n\nI'm here to help you understand how RealityNG works, find your way around the platform, and guide you through property searches, viewings, rentals and account verification.\n\nWhat would you like help with?";

const legacyUnsupported =
  "I am currently a guided demo assistant. I can help with property search guidance, viewing requests, rental applications, verification, support, and approved app navigation. I cannot answer unsupported questions or fabricate private, legal, pricing, or listing details.";
export const ASSISTANT_UNSUPPORTED =
  "I can help with questions about RealityNG, navigating the platform, property searches, viewing requests, rentals and account verification. I can't help with that question, but you could ask how to browse properties or request a viewing. For other help, use Contact RealityNG. I can't provide private account details, legal advice or unapproved pricing.";
const legacySearch =
  "Use Browse Properties to search approved listings by city, property type, listing type, price range, and keywords. In demo mode I will not invent properties, prices, or availability.";
const legacyGreeting = "Hello, I am the RealityNG Demo Assistant.";
const legacyNavigation = "I can only suggest approved app destinations in demo mode.";

// Presentation-only compatibility for existing server replies and saved history.
// Do not classify questions, alter response objects, or rewrite user messages here.
export function assistantDisplayText(content: string): string {
  if (content === legacyUnsupported) return ASSISTANT_UNSUPPORTED;
  if (content === legacySearch)
    return "Use Browse Properties to search approved listings by city, property type, listing type, price range, and keywords. Check each listing for details, and confirm current prices and availability with its owner or agent.";
  if (content.startsWith(legacyGreeting))
    return content.replace(legacyGreeting, "Hi! I'm your RealityNG property assistant.");
  if (content.startsWith("You can continue in RealityNG at ") && content.endsWith(legacyNavigation))
    return content.slice(0, -legacyNavigation.length) + "Use the link below to continue.";
  return content;
}
