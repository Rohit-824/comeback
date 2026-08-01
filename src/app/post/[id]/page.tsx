'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowUp, 
  ArrowDown, 
  MessageSquare, 
  Share2, 
  MoreHorizontal, 
  Minus, 
  ArrowLeft,
  CheckCircle2,
  Flag,
  X,
  AlertTriangle,
  Check
} from 'lucide-react';

interface CommentType {
  id: string;
  author: string;
  avatarBg: string;
  timeAgo: string;
  text: string;
  upvotes: number;
  userVote?: 'up' | 'down' | null;
  replies?: CommentType[];
}

const SAMPLE_COMMENTS: CommentType[] = [
  {
    id: 'c1',
    author: '2Sovereign4You',
    avatarBg: 'bg-emerald-600',
    timeAgo: '20h ago',
    text: 'Eventually she will clear it. Let us see if we can close the remaining ₹50 right now!',
    upvotes: 119,
    userVote: null,
    replies: [
      {
        id: 'c1-1',
        author: 'mattenthehat',
        avatarBg: 'bg-purple-600',
        timeAgo: '19h ago',
        text: '"I may have been early, but I\'m not wrong." Just sent ₹50 via UPI to close the goal!',
        upvotes: 105,
        userVote: null,
        replies: [
          {
            id: 'c1-1-1',
            author: 'Karan_DTU',
            avatarBg: 'bg-blue-600',
            timeAgo: '12h ago',
            text: 'You absolute legend! Proud of this community.',
            upvotes: 42,
            userVote: null
          }
        ]
      }
    ]
  },
  {
    id: 'c2',
    author: 'Senior_Alumni_04',
    avatarBg: 'bg-amber-600',
    timeAgo: '1 day ago',
    text: 'Stay strong Divya. Anxiety during engineering exams is far more common than people realize. If you need study notes for DE, reply here and I will drive link them.',
    upvotes: 84,
    userVote: null
  }
];

export default function DiscussionPostPage({ params }: { params: { id: string } }) {
  const { requireAuthAction } = useAuth();

  const [topComment, setTopComment] = useState('');
  const [commentsList, setCommentsList] = useState<CommentType[]>(SAMPLE_COMMENTS);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Dropdown & Report Modal State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [reportingComment, setReportingComment] = useState<CommentType | null>(null);
  const [reportReason, setReportReason] = useState('Harassment or Hate Speech');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Single-Vote Logic
  const handleVote = (commentId: string, direction: 'up' | 'down') => {
    requireAuthAction(() => {
      const updateVotes = (list: CommentType[]): CommentType[] => {
        return list.map(item => {
          if (item.id === commentId) {
            const currentVote = item.userVote || null;
            let voteDelta = 0;
            let newVoteState: 'up' | 'down' | null = direction;

            if (currentVote === direction) {
              newVoteState = null;
              voteDelta = direction === 'up' ? -1 : 1;
            } else if (currentVote === null) {
              voteDelta = direction === 'up' ? 1 : -1;
            } else {
              voteDelta = direction === 'up' ? 2 : -2;
            }

            return { ...item, upvotes: item.upvotes + voteDelta, userVote: newVoteState };
          }

          if (item.replies && item.replies.length > 0) {
            return { ...item, replies: updateVotes(item.replies) };
          }

          return item;
        });
      };

      setCommentsList(updateVotes(commentsList));
    });
  };

  const handlePostTopComment = (e: React.FormEvent) => {
    e.preventDefault();
    requireAuthAction(() => {
      if (!topComment.trim()) return;

      const newComment: CommentType = {
        id: `c-${Date.now()}`,
        author: 'You',
        avatarBg: 'bg-blue-600',
        timeAgo: 'Just now',
        text: topComment,
        upvotes: 1,
        userVote: 'up',
        replies: []
      };

      setCommentsList([newComment, ...commentsList]);
      setTopComment('');
    });
  };

  const handleAddReply = (parentId: string) => {
    requireAuthAction(() => {
      if (!replyText.trim()) return;

      const newReply: CommentType = {
        id: `r-${Date.now()}`,
        author: 'You',
        avatarBg: 'bg-blue-600',
        timeAgo: 'Just now',
        text: replyText,
        upvotes: 1,
        userVote: 'up'
      };

      const addNestedReply = (list: CommentType[]): CommentType[] => {
        return list.map(item => {
          if (item.id === parentId) {
            return { ...item, replies: [...(item.replies || []), newReply] };
          }
          if (item.replies && item.replies.length > 0) {
            return { ...item, replies: addNestedReply(item.replies) };
          }
          return item;
        });
      };

      setCommentsList(addNestedReply(commentsList));
      setReplyingToId(null);
      setReplyText('');
    });
  };

  // Submit Report to Admin Queue
  const handleConfirmReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingComment) return;

    // Save report in LocalStorage so Admin portal can fetch it
    const existingReports = JSON.parse(localStorage.getItem('adminCommentReports') || '[]');
    existingReports.push({
      id: `rep-${Date.now()}`,
      commentId: reportingComment.id,
      author: reportingComment.author,
      text: reportingComment.text,
      reason: reportReason,
      time: 'Just now',
      postTitle: 'Just ₹50 away from my goal — anxiety disorder during exams'
    });
    localStorage.setItem('adminCommentReports', JSON.stringify(existingReports));

    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportingComment(null);
    }, 1500);
  };

  // Recursive Comment Render Item
  const RenderCommentItem = ({ comment, isNested = false }: { comment: CommentType; isNested?: boolean }) => {
    const isReplying = replyingToId === comment.id;
    const isMenuOpen = activeMenuId === comment.id;

    return (
      <div className={`space-y-3 ${isNested ? 'pl-4 sm:pl-6 border-l-2 border-slate-800/80 my-3' : 'pt-4 border-t border-slate-800/60'}`}>
        
        {/* AUTHOR HEADER */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 ${comment.avatarBg} text-white font-bold rounded-full text-[10px] flex items-center justify-center shrink-0`}>
              {comment.author.substring(0, 2).toUpperCase()}
            </span>
            <span className="font-bold text-slate-200 hover:underline cursor-pointer">{comment.author}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-500">{comment.timeAgo}</span>
          </div>

          <button className="text-slate-500 hover:text-slate-300 p-1">
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* COMMENT TEXT */}
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
          {comment.text}
        </p>

        {/* REDDIT ACTION BAR WITH 3 DOTS MENU */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
          
          {/* UPVOTE / DOWNVOTE */}
          <div className="flex items-center gap-1.5 bg-[#121212] px-2.5 py-1 rounded-full border border-slate-800">
            <button 
              onClick={() => handleVote(comment.id, 'up')} 
              className={`transition-colors ${comment.userVote === 'up' ? 'text-amber-500' : 'hover:text-amber-400'}`}
            >
              <ArrowUp className={`w-3.5 h-3.5 ${comment.userVote === 'up' ? 'stroke-[3]' : ''}`} />
            </button>

            <span className={`font-bold text-xs ${
              comment.userVote === 'up' 
                ? 'text-amber-500' 
                : comment.userVote === 'down' 
                  ? 'text-blue-500' 
                  : 'text-slate-200'
            }`}>
              {comment.upvotes}
            </span>

            <button 
              onClick={() => handleVote(comment.id, 'down')} 
              className={`transition-colors ${comment.userVote === 'down' ? 'text-blue-500' : 'hover:text-blue-400'}`}
            >
              <ArrowDown className={`w-3.5 h-3.5 ${comment.userVote === 'down' ? 'stroke-[3]' : ''}`} />
            </button>
          </div>

          {/* REPLY BUTTON */}
          <button 
            onClick={() => setReplyingToId(isReplying ? null : comment.id)}
            className="hover:text-white flex items-center gap-1.5 transition"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Reply
          </button>

          {/* SHARE BUTTON */}
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Comment link copied to clipboard!');
            }}
            className="hover:text-white flex items-center gap-1.5 transition"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>

          {/* 3 DOTS REPORT DROPDOWN MENU */}
          <div className="relative">
            <button 
              onClick={() => setActiveMenuId(isMenuOpen ? null : comment.id)}
              className="hover:text-white p-1 rounded transition"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-6 z-30 bg-[#1A1A1A] border border-slate-700/80 rounded-xl shadow-2xl py-1 w-36 text-xs">
                <button
                  onClick={() => {
                    setActiveMenuId(null);
                    requireAuthAction(() => setReportingComment(comment));
                  }}
                  className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 font-bold"
                >
                  <Flag className="w-3.5 h-3.5" /> Report Comment
                </button>
              </div>
            )}
          </div>

        </div>

        {/* INLINE REPLY FORM */}
        {isReplying && (
          <div className="pt-2 pl-2 space-y-2">
            <textarea 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${comment.author}...`}
              className="w-full bg-[#121212] border border-slate-800 focus:border-blue-500 text-white rounded-xl p-3 text-xs focus:outline-none resize-none min-h-[70px]"
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setReplyingToId(null)}
                className="px-3 py-1.5 bg-[#121212] hover:bg-slate-800 text-slate-400 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleAddReply(comment.id)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-600/20"
              >
                Reply
              </button>
            </div>
          </div>
        )}

        {/* RECURSIVE REPLIES */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-2">
            {comment.replies.map(reply => (
              <RenderCommentItem key={reply.id} comment={reply} isNested={true} />
            ))}
          </div>
        )}

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 font-sans pt-24 pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        <Link 
          href="/feed" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Discussions
        </Link>

        {/* MAIN POST HEADER */}
        <div className="bg-[#1E1E1E] rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-5 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 bg-amber-600/30 text-amber-400 font-bold rounded-lg flex items-center justify-center">
                DS
              </span>
              <span className="font-bold text-white text-base">Divya Singh</span>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-md font-semibold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
              <span className="bg-blue-950 text-blue-400 border border-blue-800 px-2.5 py-0.5 rounded-md font-semibold text-xs">
                NSUT
              </span>
            </div>
            <span className="text-amber-400 font-bold">Goal Closed!</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
            Just ₹50 away from my goal — anxiety disorder during exams, exam in 3 days
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#121212] p-4 rounded-2xl border border-slate-800/80">
            "Thank you to the 61 people who already donated. I have medically documented anxiety disorder. Just one small push and I can sit for my back paper."
          </p>
        </div>

        {/* JOIN DISCUSSION BOX */}
        <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white">Join the Discussion</h2>
          <form onSubmit={handlePostTopComment} className="space-y-3">
            <textarea 
              value={topComment}
              onChange={(e) => setTopComment(e.target.value)}
              placeholder="What are your thoughts? Give advice, support, or share relevant experience..."
              className="w-full bg-[#121212] border border-slate-800 focus:border-blue-500 text-white text-xs sm:text-sm rounded-2xl p-4 focus:outline-none resize-none min-h-[100px]"
            />
            <div className="flex justify-end">
              <button 
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-2xl transition shadow-lg shadow-blue-600/20 active:scale-95"
              >
                Post Comment
              </button>
            </div>
          </form>
        </div>

        {/* DISCUSSION THREAD SECTION */}
        <div className="bg-[#1E1E1E] rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-4">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-extrabold text-white">
              Discussion Thread ({commentsList.length} comments)
            </h2>
          </div>

          <div className="space-y-6">
            {commentsList.map(comment => (
              <RenderCommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        </div>

      </main>

      {/* REPORT COMMENT MODAL */}
      {reportingComment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E1E1E] border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
            <button 
              onClick={() => setReportingComment(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {reportSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-950 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-800">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Report Submitted to Admin</h3>
                <p className="text-xs text-slate-400">Our administrative team will review this comment shortly.</p>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500" /> Report Comment
                  </h3>
                  <p className="text-xs text-slate-400">
                    Flagging comment by <strong>{reportingComment.author}</strong> for moderation.
                  </p>
                </div>

                <div className="bg-[#121212] p-3 rounded-xl border border-slate-800 text-xs italic text-slate-300">
                  "{reportingComment.text}"
                </div>

                <form onSubmit={handleConfirmReport} className="space-y-4">
                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-slate-300">Select Violation Reason *</label>
                    <select 
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full bg-[#121212] border border-slate-800 text-white rounded-xl p-3 focus:outline-none"
                    >
                      <option value="Harassment or Hate Speech">Harassment or Hate Speech</option>
                      <option value="Spam or Unsolicited Promotion">Spam or Unsolicited Promotion</option>
                      <option value="False Information / Misleading">False Information / Misleading</option>
                      <option value="Inappropriate Content">Inappropriate Content</option>
                    </select>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setReportingComment(null)}
                      className="w-full py-3 bg-[#121212] hover:bg-slate-800 text-slate-400 font-bold rounded-xl border border-slate-800 text-xs"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/20"
                    >
                      Submit Report
                    </button>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}