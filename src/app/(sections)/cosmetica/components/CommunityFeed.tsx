"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  Share2,
  TrendingUp,
  Clock
} from "lucide-react";

interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar?: string;
    skinType?: string;
  };
  title: string;
  content: string;
  category: "routine" | "progress" | "question" | "review";
  images?: string[];
  likes: number;
  comments: number;
  views: number;
  createdAt: string;
  isPinned?: boolean;
}

const samplePosts: CommunityPost[] = [
  {
    id: "1",
    author: {
      name: "Giulia R.",
      skinType: "Mista",
    },
    title: "La mia routine K-Beauty dopo 3 mesi! 🌟",
    content: "Finalmente vedo risultati incredibili con la doppia detersione e l'essence. La mia pelle non è mai stata così luminosa!",
    category: "progress",
    likes: 234,
    comments: 45,
    views: 1200,
    createdAt: "2 ore fa",
    isPinned: true,
  },
  {
    id: "2",
    author: {
      name: "Marco T.",
      skinType: "Grassa",
    },
    title: "Help! Quale crema per pelle grassa?",
    content: "Sto cercando una crema idratante leggera per pelle grassa che non ostruisca i pori. Qualche consiglio?",
    category: "question",
    likes: 56,
    comments: 23,
    views: 340,
    createdAt: "5 ore fa",
  },
  {
    id: "3",
    author: {
      name: "Sofia L.",
      skinType: "Sensibile",
    },
    title: "Recensione COSRX Snail Mucin 💫",
    content: "Dopo 2 settimane di utilizzo, posso dire che questo prodotto è fantastico per pelli sensibili. Zero irritazioni e pelle morbida!",
    category: "review",
    likes: 189,
    comments: 34,
    views: 890,
    createdAt: "1 giorno fa",
  },
  {
    id: "4",
    author: {
      name: "Elena M.",
      skinType: "Secca",
    },
    title: "La mia routine invernale completa",
    content: "Condivido la mia routine per pelle secca durante i mesi invernali. Focus su idratazione profonda e barriera cutanea.",
    category: "routine",
    likes: 312,
    comments: 67,
    views: 1560,
    createdAt: "2 giorni fa",
  },
];

const categoryLabels: Record<string, { label: string; color: string }> = {
  routine: { label: "Routine", color: "bg-[#E3F2FD] text-[#1565C0]" },
  progress: { label: "Progressi", color: "bg-[#E8F5E9] text-[#2E7D32]" },
  question: { label: "Domanda", color: "bg-[#FFF3E0] text-[#E65100]" },
  review: { label: "Recensione", color: "bg-[#F3E5F5] text-[#7B1FA2]" },
};

export default function CommunityFeed() {
  return (
    <div className="space-y-4">
      {samplePosts.map((post, index) => (
        <Card
          key={post.id}
          className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white overflow-hidden"
        >
          {post.isPinned && (
            <div className="bg-[#4CAF50] text-white text-xs px-4 py-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Post in evidenza
            </div>
          )}
          <CardContent className="p-5">
            {/* Author */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10 border-2 border-[#E8F5E9]">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback className="bg-[#E8F5E9] text-[#4CAF50]">
                  {post.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{post.author.name}</span>
                  {post.author.skinType && (
                    <Badge variant="outline" className="text-xs border-gray-200">
                      Pelle {post.author.skinType}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {post.createdAt}
                </div>
              </div>
              <Badge className={categoryLabels[post.category].color}>
                {categoryLabels[post.category].label}
              </Badge>
            </div>

            {/* Content */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-2 hover:text-[#4CAF50] cursor-pointer">
                {post.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">{post.likes}</span>
                </button>
                <button className="flex items-center gap-1.5 text-gray-500 hover:text-[#4CAF50] transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{post.comments}</span>
                </button>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">{post.views}</span>
                </span>
              </div>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#4CAF50]">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Load More */}
      <div className="text-center pt-4">
        <Button variant="outline" className="border-[#4CAF50] text-[#4CAF50] hover:bg-[#E8F5E9]">
          Carica altri post
        </Button>
      </div>
    </div>
  );
}
