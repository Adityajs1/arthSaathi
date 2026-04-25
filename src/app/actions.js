"use server";

import { extractText, getDocumentProxy } from "unpdf";

export async function generateChatResponse({
  systemPrompt,
  loanContext,
  userQuery,
  conversationHistory,
  adaptationInstruction,
  calculationContext,
  lang = "en"
}) {
  const mistralKey = process.env.MISTRAL_API_KEY;
  const mistralModel = process.env.MISTRAL_MODEL || "mistral-small-latest";

  if (!mistralKey) {
    return "Mistral API Key missing. Please check your environment variables.";
  }

  let languageInstruction = "Respond in English.";
  if (lang === "hi") {
    languageInstruction = "Respond in Hindi (using Hindi script).";
  } else if (lang === "hinglish") {
    languageInstruction = "Respond in Hinglish (Hindi language using Roman script/Latin characters).";
  }

  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mistralKey}`
      },
      body: JSON.stringify({
        model: mistralModel,
        messages: [
          { role: "system", content: `${systemPrompt} ${languageInstruction}` },
          { role: "user", content: `Context: ${loanContext}\nNotes: ${calculationContext}\nQuery: ${userQuery}` }
        ],
        temperature: 0.7
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content;
    } else {
      const errorData = await response.json();
      console.error("Mistral API Error:", errorData);
      return `Mistral API Error: ${errorData.message || response.statusText}`;
    }
  } catch (e) {
    console.error("Mistral Request Failed:", e);
    return "Technical issue: Failed to connect to Mistral. Please check your connection and API key.";
  }
}

export async function analyzeAgreement({ inputText, lang = "en" }) {
  const mistralKey = process.env.MISTRAL_API_KEY;
  const mistralModel = process.env.MISTRAL_MODEL || "mistral-small-latest";

  if (!mistralKey) {
    return "Mistral API Key missing. Please check your environment variables.";
  }

  let languageInstruction = "Respond in English.";
  if (lang === "hi") {
    languageInstruction = "Respond in Hindi (using Hindi script). Keep the technical terms in English if necessary but explain them in Hindi.";
  } else if (lang === "hinglish") {
    languageInstruction = "Respond in Hinglish (Hindi language using Roman script/Latin characters). This is for an Indian audience, so use a mix of Hindi and English as naturally spoken.";
  }

  const prompt = `
You are an expert legal and financial document analyst.

Your task is to analyze the following agreement text and extract critical information in a clear, structured, and easy-to-understand way for a non-expert user.

${languageInstruction}

Text:
${inputText}

Instructions:

1. Provide a Simple Summary (in the requested language, 3–5 sentences).

2. Extract Important Clauses:
   - Payment terms
   - Interest rates (fixed/variable)
   - Late payment penalties
   - Cancellation/termination terms
   - Renewal conditions
   - Obligations of the customer

3. Identify Hidden Charges or Fees:
   - Processing fees
   - Prepayment penalties
   - Late fees
   - Any charges not obvious at first glance

4. Highlight Risky or Unfavorable Terms:
   - High penalties
   - One-sided clauses
   - Automatic renewals
   - Clauses limiting user rights
   - Any vague or ambiguous language

5. Key Financial Details:
   - EMI amount
   - Interest rate
   - Loan tenure
   - Total repayment amount (if available)

6. Red Flags (VERY IMPORTANT):
   - List anything that could potentially harm the customer financially or legally.

7. Confidence Note:
   - Mention if any part of the document is unclear or missing context.

Return output in this exact Markdown format (Headers should be in English for consistency, but content must be in ${lang === "hi" ? "Hindi" : lang === "hinglish" ? "Hinglish" : "English"}):

**Simple Summary:**
[A concise summary in 3-5 sentences]

---

**Important Clauses:**
- [Point 1]
- [Point 2]
...

---

**Hidden Charges or Fees:**
- [Point 1]
- [Point 2]
...

---

**Risky or Unfavorable Terms:**
- [Point 1]
- [Point 2]
...

---

**Key Financial Details:**
- [Point 1]
- [Point 2]
...

---

**Red Flags:**
- [Point 1]
- [Point 2]
...

---

**Confidence Note:**
- [Context or clarity notes]
`;

  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mistralKey}`
      },
      body: JSON.stringify({
        model: mistralModel,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content;
    } else {
      const errorData = await response.json();
      console.error("Mistral API Error (Agreement):", errorData);
      return `Could not analyze the document: ${errorData.message || response.statusText}`;
    }
  } catch (e) {
    console.error("Mistral Request Failed (Agreement):", e);
    return "Could not analyze the document due to a network error. Please check your Mistral API key.";
  }
}

export async function extractTextFromPdf(formData) {
  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) return null;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Using unpdf (Modern, serverless-friendly approach)
    const pdf = await getDocumentProxy(uint8Array);
    const { text } = await extractText(pdf, { mergePages: true });
    
    if (!text || text.trim().length < 5) {
      throw new Error("No readable text found in PDF.");
    }
    
    return text;
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    // Throwing so the client catches it
    throw new Error(error.message || "Failed to read PDF.");
  }
}
