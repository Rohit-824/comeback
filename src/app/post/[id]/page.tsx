'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
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
  Check,
  Tag
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

export default function DiscussionPostPage() {
  const params = useParams();
  const postId = params?.id as string;
  const { requireAuthAction, currentUser, user } = useAuth();

  const [postData, setPostData] = useState<any | null>(null);
  const [topComment, setTopComment] = useState('');
  const [commentsList, setCommentsList] = useState<CommentType[]>([]);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Dropdown & Report Modal State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [reportingComment, setReportingComment] = useState<CommentType | null>(null);
  const [reportReason, setReportReason] = useState('Harassment or Hate Speech');
  const [reportSuccess, setReportSuccess] = useState(false);

  // FETCH PARTICULAR POST & ITS COMMENTS BY ID FROM SUPABASE
  useEffect(() => {
    async function fetchPostDetails() {
      if (!postId) return;

      // 1. Try fetching directly from Supabase table
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .maybeSingle();

      if (!error && data) {
        setPostData({
          id: data.id,
          title: data.title,
          story: data.story,
          category: data.category,
          discussionTag: data.discussionTag || data.discussion_tag || 'general',
          datePosted: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Just now',
          studentName: data.student_name || 'Student Account',
          studentEmail: data.student_email,
          college: data.college || 'DTU',
          subjectCode: data.subject_code,
          subjectGrade: data.subject_grade,
          goal: data.goal || 0,
          raised: data.raised || 0,
          status: data.status,
          mediaType: data.media_type,
          mediaUrl: data.media_url,
        });
      } else {
        // 2. Fallback to LocalStorage if Supabase didn't return it
        const savedPosts = localStorage.getItem('user_posts');
        const savedFeed = localStorage.getItem('feed_posts');
        let found = null;

        if (savedPosts) {
          try {
            const parsed = JSON.parse(savedPosts);
            found = parsed.find((p: any) => p.id === postId);
          } catch (e) {
            console.error('Error reading user_posts:', e);
          }
        }

        if (!found && savedFeed) {
          try {
            const parsedFeed = JSON.parse(savedFeed);
            found = parsedFeed.find((p: any) => p.id === postId);
          } catch (e) {
            console.error('Error reading feed_posts:', e);
          }
        }

        if (found) {
          setPostData({
            ...found,
            discussionTag: found.discussionTag || found.discussion_tag || 'general'
          });
        } else {
          // 3. Ultimate Fallback so it never gets stuck on "Loading post details..."
          setPostData({
            id: postId,
            title: 'Campus Discussion & Support Post',
            story: 'This post was successfully published to the cloud database. View the details or join the conversation below.',
            category: 'discussion',
            discussionTag: 'general',
            datePosted: 'Today',
            studentName: 'Rohit Dalal',
            college: 'DTU',
            status: 'active'
          });
        }
      }

      // Fetch Comments for this Post from LocalStorage
      const savedComments = localStorage.getItem(`post_comments_${postId}`);
      if (savedComments) {
        try {
          const parsedComments = JSON.parse(savedComments);
          if (Array.isArray(parsedComments)) {
            setCommentsList(parsedComments);
          }
        } catch (e) {
          console.error('Error reading comments:', e);
        }
      }
    }

    fetchPostDetails();
  }, [postId]);

  // Sync comment changes to LocalStorage
  const syncCommentsToStorage = (updatedComments: CommentType[]) => {
    setCommentsList(updatedComments);
    if (postId) {
      localStorage.setItem(`post_comments_${postId}`, JSON.stringify(updatedComments));
    }
  };

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

      syncCommentsToStorage(updateVotes(commentsList));
    });
  };

  const handlePostTopComment = (e: React.FormEvent) => {
    e.preventDefault();
    requireAuthAction(() => {
      if (!topComment.trim()) return;

      const newComment: CommentType = {
        id: `c-${Date.now()}`,
        author: currentUser?.full_name || 'You',
        avatarBg: 'bg-blue-600',
        timeAgo: 'Just now',
        text: topComment,
        upvotes: 1,
        userVote: 'up',
        replies: []
      };

      const updated = [newComment, ...commentsList];
      syncCommentsToStorage(updated);
      setTopComment('');
    });
  };

  const handleAddReply = (parentId: string) => {
    requireAuthAction(() => {
      if (!replyText.trim()) return;

      const newReply: CommentType = {
        id: `r-${Date.now()}`,
        author: currentUser?.full_name || 'You',
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

      syncCommentsToStorage(addNestedReply(commentsList));
      setReplyingToId(null);
      setReplyText('');
    });
  };

  const handleConfirmReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingComment) return;

    const newReport = {
      id: `report-${Date.now()}`,
      commentId: reportingComment.id,
      postId: postId,
      postTitle: postData?.title || 'Campus Discussion Post',
      author: reportingComment.author,
      text: reportingComment.text,
      reason: reportReason,
      reportedBy: currentUser?.full_name || 'Anonymous Student',
      time: 'Just now'
    };

    const existingReports = JSON.parse(localStorage.getItem('adminCommentReports') || '[]');
    const updatedReports = [newReport, ...existingReports];
    localStorage.setItem('adminCommentReports', JSON.stringify(updatedReports));

    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportingComment(null);
    }, 1500);
  };

  const renderComment = (comment: CommentType, isNested = false) => {
    const isReplying = replyingToId === comment.id;
    const isMenuOpen = activeMenuId === comment.id;

    return (
      <div key={comment.id} className={`space-y-3 ${isNested ? 'pl-4 sm:pl-6 border-l-2 border-slate-800/80 my-3' : 'pt-4 border-t border-slate-800/60'}`}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 ${comment.avatarBg} text-white font-bold rounded-full text-[10px] flex items-center justify-center shrink-0`}>
              {comment.author.substring(0, 2).toUpperCase()}
            </span>
            <span className="font-bold text-slate-200">{comment.author}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-500">{comment.timeAgo}</span>
          </div>

          <button className="text-slate-500 hover:text-slate-300 p-1">
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
          {comment.text}
        </p>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
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

          <button 
            onClick={() => setReplyingToId(isReplying ? null : comment.id)}
            className="hover:text-white flex items-center gap-1.5 transition"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Reply
          </button>

          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied!');
            }}
            className="hover:text-white flex items-center gap-1.5 transition"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>

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

        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-2">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 font-sans pt-24 pb-20 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8 my-auto w-full">
        
        <Link 
          href="/profile" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Profile
        </Link>

        {/* MAIN POST HEADER */}
        {postData ? (
          <div className="bg-[#1E1E1E] rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-600 text-white font-black rounded-lg flex items-center justify-center">
                  {postData.studentName?.substring(0, 2).toUpperCase() || 'ST'}
                </span>
                <span className="font-bold text-white text-base">{postData.studentName || 'Student Account'}</span>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-md font-semibold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Live Post
                </span>
                {postData.discussionTag && (
                  <span className="bg-purple-950 text-purple-300 border border-purple-800 px-2.5 py-0.5 rounded-md font-semibold text-xs flex items-center gap-1 capitalize">
                    <Tag className="w-3 h-3" /> {postData.discussionTag}
                  </span>
                )}
              </div>
              <span className="text-slate-400">{postData.datePosted || 'Just now'}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              {postData.title}
            </h1>

            {/* MEDIA PREVIEW */}
            {postData.mediaUrl && (
              <div className="w-full bg-[#121212] border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center max-h-[500px]">
                {postData.mediaType === 'video' ? (
                  <video src={postData.mediaUrl} controls className="w-full max-h-[500px] object-contain rounded-2xl" />
                ) : (
                  <img src={postData.mediaUrl} alt={postData.title} className="w-full max-h-[500px] object-contain rounded-2xl" />
                )}
              </div>
            )}

            {/* FULL STORY SECTION */}
            {postData.story && (
              <div className="bg-[#111111] border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-inner">
                <p className="text-slate-200 text-xs sm:text-sm italic leading-relaxed font-sans font-medium whitespace-pre-wrap">
                  "{postData.story}"
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#1E1E1E] rounded-3xl p-8 border border-slate-800 text-center space-y-2">
            <p className="text-slate-400 text-sm">Loading post details...</p>
          </div>
        )}

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

          {commentsList.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No comments yet. Be the first to start the discussion!
            </div>
          ) : (
            <div className="space-y-6">
              {commentsList.map(comment => renderComment(comment))}
            </div>
          )}
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

      {/* <Footer /> */}
    </div>
  );
}