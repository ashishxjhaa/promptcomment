import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const prompt = await prisma.prompt.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { comments: true }
                }
            }
        })

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(prompt);
    } catch (error) {
        console.error("Error fetching prompt:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
