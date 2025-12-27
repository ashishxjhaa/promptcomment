import { MessageCircle } from "lucide-react";
import Link from "next/link";

interface PromptCardProps {
    id: string;
    title: string;
    commentCount: number;
}

export default function PromptCard({ id, title, commentCount }: PromptCardProps) {
    return (
        <Link href={`/comment/${id}`}>
            <div className="bg-white p-6 rounded-lg hover:shadow-sm hover:shadow-[#D97756] transition-shadow cursor-pointer border border-[#D97756]">
                <h3 className="text-lg font-medium mb-4">{title}</h3>
                <div className="flex items-center justify-end text-gray-600">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    <span className="text-sm">{commentCount}</span>
                </div>
            </div>
        </Link>
    );
}
