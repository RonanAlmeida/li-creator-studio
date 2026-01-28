'use client';

import { useState } from 'react';
import { ThumbsUp, MessageSquare, ArrowRight } from 'lucide-react';

interface Post {
  id: string;
  author: string;
  role: string;
  timeAgo: string;
  content: string;
  likes: number;
  comments: number;
  image?: string;
}

const YOUR_POSTS: Post[] = [
  {
    id: 'thor-1',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '3h',
    content: 'Three years at GSOBA and I finally understand what people mean when they say company culture matters.\n\nUnlimited PTO that we actually use. No meetings for the sake of meetings. Remote-first from day one. A team that genuinely cares about the work and each other.\n\nIf you told me in 2021 that I\'d find a place like this, I wouldn\'t have believed you.',
    likes: 1892,
    comments: 167,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-2',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '1d',
    content: 'POV: You open Slack for "just a second" and there are 347 unread messages waiting for you.\n\nSolution: Pretend you never saw them and go back to deep work.\n\nAnyone else at GSOBA master this technique?',
    likes: 1243,
    comments: 89,
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-3',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '2d',
    content: 'Client at 4:55 PM on Friday: "Can we hop on a quick call?"\n\nMe: Already mentally checked out and halfway through my weekend plans.\n\nUpdate: We did not hop on that call. Monday works just fine.',
    likes: 2156,
    comments: 124,
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop',
  },
];

const SAVED_POSTS: Post[] = [
  {
    id: '1',
    author: 'Sarah Johnson',
    role: 'CEO at StartupHub',
    timeAgo: '2h',
    content: 'Just hit a major milestone! After 6 months of consistent effort, we\'ve grown our team by 300%. Here\'s what we learned along the way: 1) Trust your process 2) Invest in people 3) Stay adaptable',
    likes: 342,
    comments: 28,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
  },
  {
    id: '2',
    author: 'Michael Chen',
    role: 'Software Engineer at Microsoft',
    timeAgo: '5h',
    content: '5 strategies that helped us scale from $0 to $1M ARR:\n\n1) Focus on customer success\n2) Build in public\n3) Iterate quickly\n4) Listen to feedback\n5) Stay consistent',
    likes: 521,
    comments: 64,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
  },
  {
    id: '3',
    author: 'Emma Rodriguez',
    role: 'Data Scientist at Google',
    timeAgo: '1d',
    content: 'The future of work is here. Remote teams are outperforming traditional offices by 25%. Here\'s why flexibility is the key to productivity...',
    likes: 198,
    comments: 15,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
  },
  {
    id: '4',
    author: 'David Kim',
    role: 'UX Designer at Adobe',
    timeAgo: '2d',
    content: 'Your network is your net worth. Start building meaningful connections today. Quality over quantity always wins. 🚀',
    likes: 876,
    comments: 42,
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop',
  },
  {
    id: '5',
    author: 'Jennifer Martinez',
    role: 'Product Manager at Salesforce',
    timeAgo: '3d',
    content: 'Excited to share our latest product launch! After months of development, we\'re finally ready to help businesses transform their digital presence.',
    likes: 234,
    comments: 19,
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop',
  },
];

interface PostLibraryProps {
  onImportPost: (content: string) => void;
}

export default function PostLibrary({ onImportPost }: PostLibraryProps) {
  const [selectedSection, setSelectedSection] = useState<'your' | 'saved'>('your');

  const postsToShow = selectedSection === 'your' ? YOUR_POSTS : SAVED_POSTS;

  return (
    <div className="space-y-3 min-w-0">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-linkedin overflow-hidden">
        <div className="px-4 py-3 border-b border-linkedin-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-linkedin-gray-900">Posts</h3>
          <span className="text-xs text-linkedin-gray-600">{postsToShow.length}</span>
        </div>

        {/* Section Toggle */}
        <div className="px-2 py-2 border-b border-linkedin-gray-200">
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedSection('your')}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                selectedSection === 'your'
                  ? 'bg-linkedin-blue text-white'
                  : 'text-linkedin-gray-600 hover:bg-linkedin-gray-100'
              }`}
            >
              Your Posts
            </button>
            <button
              onClick={() => setSelectedSection('saved')}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                selectedSection === 'saved'
                  ? 'bg-linkedin-blue text-white'
                  : 'text-linkedin-gray-600 hover:bg-linkedin-gray-100'
              }`}
            >
              Saved
            </button>
          </div>
        </div>

        {/* Posts List */}
        <div className="max-h-[500px] overflow-y-auto overflow-x-hidden p-3 space-y-3">
          {postsToShow.map((post) => (
            <LinkedInPost key={post.id} post={post} onImport={onImportPost} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface LinkedInPostProps {
  post: Post;
  onImport: (content: string) => void;
}

function LinkedInPost({ post, onImport }: LinkedInPostProps) {
  const getProfileImage = (authorId: string) => {
    const imageMap: Record<string, string> = {
      'thor-1': 'https://i.pravatar.cc/150?img=12',
      'thor-2': 'https://i.pravatar.cc/150?img=12',
      'thor-3': 'https://i.pravatar.cc/150?img=12',
      '1': 'https://i.pravatar.cc/150?img=47',
      '2': 'https://i.pravatar.cc/150?img=13',
      '3': 'https://i.pravatar.cc/150?img=32',
      '4': 'https://i.pravatar.cc/150?img=15',
      '5': 'https://i.pravatar.cc/150?img=45',
    };
    return imageMap[authorId] || 'https://i.pravatar.cc/150?img=1';
  };

  return (
    <div className="bg-white rounded-xl border border-linkedin-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden">
      <div className="p-3">
      {/* Post Header */}
      <div className="flex items-start gap-2.5 mb-2">
        <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden bg-linkedin-gray-200 ring-2 ring-white shadow-sm">
          <img
            src={getProfileImage(post.id)}
            alt={post.author}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-linkedin-gray-900 group-hover:text-linkedin-blue transition-colors">
            {post.author}
          </h4>
          <p className="text-[10px] text-linkedin-gray-600 truncate">{post.role}</p>
          <p className="text-[10px] text-linkedin-gray-500">{post.timeAgo} ago</p>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-2.5">
        <p className="text-xs text-linkedin-gray-900 leading-relaxed line-clamp-3">
          {post.content}
        </p>
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="mb-2.5 -mx-3 overflow-hidden">
          <img
            src={post.image}
            alt="Post content"
            className="w-full h-28 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>
      )}

      {/* Engagement Stats */}
      <div className="flex items-center justify-between py-1.5 mb-2">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            <div className="w-4 h-4 rounded-full bg-linkedin-blue flex items-center justify-center border border-white">
              <ThumbsUp className="w-2 h-2 fill-white text-white" />
            </div>
            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center border border-white">
              <span className="text-[9px]">❤️</span>
            </div>
            <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center border border-white">
              <span className="text-[9px]">👏</span>
            </div>
          </div>
          <span className="text-[10px] text-linkedin-gray-600">{post.likes.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-linkedin-gray-600">
          <MessageSquare className="w-3 h-3" />
          <span>{post.comments}</span>
        </div>
      </div>

      {/* Use Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onImport(post.content);
        }}
        className="w-full flex items-center justify-center gap-1.5 py-2 bg-linkedin-blue hover:bg-linkedin-blue-dark text-white text-xs font-semibold rounded-lg transition-all duration-200"
      >
        <span>Use Post</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
      </div>
    </div>
  );
}
