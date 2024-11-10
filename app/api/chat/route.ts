import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { Reem_Kufi } from "next/font/google";
import { NextRequest } from "next/server";
export const maxDuration = 30;

export async function POST(req: Request){
    const { messages} = await req.json();

    const result = await streamText({
        model: openai("gpt-4o-mini"),   
        messages,
    });

    return result.toDataStreamResponse();
}
