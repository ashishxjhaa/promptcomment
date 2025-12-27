import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const sort = searchParams.get('sort') || 'newest';

        const skip = (page - 1) * limit;

        const [comments, totalCount] = await Promise.all([
            prisma.comment.findMany({
                where: { promptId: id },
                include: {
                    user: {
                        select: { username: true }
                    }
                },
                orderBy: {
                    createdAt: sort === 'oldest' ? 'asc' : 'desc'
                },
                skip,
                take: limit
            }),
            prisma.comment.count({
                where: { promptId: id }
            })
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            comments,
            totalPages,
            currentPage: page,
            totalCount
        });
    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { content, username } = await req.json();

        if (!content || typeof content !== 'string') {
            return NextResponse.json(
                { error: "Content is required" },
                { status: 400 }
            );
        }

        if (content.trim().length < 10 || content.trim().length > 2000) {
            return NextResponse.json(
                { error: "Content must be between 10 and 2000 characters" },
                { status: 400 }
            );
        }

        if (!username) {
            return NextResponse.json(
                { error: "Username is required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const prompt = await prisma.prompt.findUnique({
            where: { id }
        });

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt not found" },
                { status: 404 }
            );
        }

        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                userId: user.id,
                promptId: id
            },
            include: {
                user: {
                    select: { username: true }
                }
            }
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error("Error creating comment:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
