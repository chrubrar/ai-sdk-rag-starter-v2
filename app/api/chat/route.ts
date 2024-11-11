import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { createResource } from "@/lib/actions/resources";
import { findRelevantContent } from "@/lib/ai/embedding";

export const maxDuration = 30;

export async function POST(req: Request){
    const { messages} = await req.json();

    const result = await streamText({
        model: openai("gpt-4o"),   
        system: `You are a helpful assistant. Check your knowledge base before answering. 
        Only respond to questions using information from tool calls
        If no relevant information is found in the tools calls, respond "Sorry, I don't know.`,
        messages,
        tools:{
            addResource: tool({
                description: `add a resource to your knowledge base.
                if the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
                parameters: z.object({
                    content: z
                    .string()
                    .describe(`the content of the resource to add to your knowledge base`),
                    
                }),
                execute: async ({content}) => {
                    await createResource({content});
                }
            }),
            getInformation: tool({
                description: `get information from your knowledge base to answer questions.`,
                parameters: z.object({
                    question: z.string().describe(`the user's question`),
                }),
                execute: async ({question}) => {
                    return await findRelevantContent(question);
                    
                }
            }),
        }
    });

    return result.toDataStreamResponse();
}
