import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { content } = await req.json();

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

        const comment = await prisma.comment.findUnique({
            where: { id }
        });

        if (!comment) {
            return NextResponse.json(
                { error: "Comment not found" },
                { status: 404 }
            );
        }

        const now = new Date();
        const createdAt = new Date(comment.createdAt);
        const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / 60000);

        if (diffInMinutes >= 15) {
            return NextResponse.json(
                { error: "Edit time limit exceeded (15 minutes)" },
                { status: 403 }
            );
        }

        const updatedComment = await prisma.comment.update({
            where: { id },
            data: {
                content: content.trim(),
                isEdited: true
            },
            include: {
                user: {
                    select: { username: true }
                }
            }
        });

        return NextResponse.json(updatedComment);
    } catch (error) {
        console.error("Error updating comment:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const comment = await prisma.comment.findUnique({
            where: { id }
        });

        if (!comment) {
            return NextResponse.json(
                { error: "Comment not found" },
                { status: 404 }
            );
        }

        await prisma.comment.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Error deleting comment:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}