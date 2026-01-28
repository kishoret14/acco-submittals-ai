import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OverallStatus } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockUsers } from '@/lib/mockData';

// Types
export interface ItemComment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  timestamp: Date;
  statusAtTime?: OverallStatus;
  isSystemComment?: boolean;
  parentId?: string; // For threading
  mentions?: string[]; // User IDs mentioned
}

interface CommentsPanelProps {
  comments: ItemComment[];
  onAddComment: (text: string, parentId?: string, mentions?: string[]) => void;
  currentUserId: string;
  currentUserName: string;
  currentStatus?: OverallStatus;
  className?: string;
}

export function CommentsPanel({
  comments,
  onAddComment,
  currentUserId,
  currentUserName,
  currentStatus,
  className,
}: CommentsPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to newest comment
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  // Get root comments and their replies
  const rootComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  // Format date & time
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Handle @mention detection
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart || 0;
    setNewComment(value);
    setCursorPosition(position);

    // Check for @mention trigger
    const textBeforeCursor = value.slice(0, position);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setShowMentions(true);
      setMentionQuery(mentionMatch[1].toLowerCase());
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  };

  // Filter users for mention suggestions
  const filteredUsers = mockUsers
    .filter((u) => u.status === 'Active')
    .filter((u) =>
      mentionQuery
        ? u.firstName.toLowerCase().includes(mentionQuery) ||
          u.lastName.toLowerCase().includes(mentionQuery)
        : true
    )
    .slice(0, 5);

  // Insert mention
  const insertMention = (user: typeof mockUsers[0]) => {
    const textBeforeCursor = newComment.slice(0, cursorPosition);
    const textAfterCursor = newComment.slice(cursorPosition);
    const mentionStart = textBeforeCursor.lastIndexOf('@');
    const newText =
      textBeforeCursor.slice(0, mentionStart) +
      `@${user.firstName} ${user.lastName} ` +
      textAfterCursor;

    setNewComment(newText);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  // Extract mentions from text
  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+\s\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const fullName = match[1];
      const user = mockUsers.find(
        (u) => `${u.firstName} ${u.lastName}` === fullName
      );
      if (user) {
        mentions.push(user.id);
      }
    }

    return mentions;
  };

  // Handle submit
  const handleSubmit = () => {
    if (!newComment.trim()) return;

    const mentions = extractMentions(newComment);
    onAddComment(newComment.trim(), replyingTo || undefined, mentions);
    setNewComment('');
    setReplyingTo(null);
  };

  // Handle key press
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Render a single comment
  const CommentItem = ({
    comment,
    isReply = false,
  }: {
    comment: ItemComment;
    isReply?: boolean;
  }) => {
    const replies = getReplies(comment.id);

    // Highlight mentions in text
    const renderText = (text: string) => {
      const parts = text.split(/(@\w+\s\w+)/g);
      return parts.map((part, i) => {
        if (part.startsWith('@')) {
          return (
            <span key={i} className="text-primary-600 font-medium">
              {part}
            </span>
          );
        }
        return part;
      });
    };

    if (comment.isSystemComment) {
      return (
        <div className="flex items-center gap-2 py-1.5 px-2 bg-neutral-50 rounded text-xs text-neutral-500 italic">
          <span className="flex-1">{comment.text}</span>
          <span className="text-neutral-400">{formatDateTime(comment.timestamp)}</span>
        </div>
      );
    }

    return (
      <div className={cn('group', isReply && 'ml-6 mt-2')}>
        <div className="flex gap-2">
          {/* Avatar */}
          <Avatar className={cn('flex-shrink-0', isReply ? 'h-6 w-6' : 'h-7 w-7')}>
            <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
              {getInitials(comment.authorName)}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className={cn('font-medium text-neutral-900', isReply ? 'text-xs' : 'text-sm')}>
                {comment.authorName}
              </span>
              <span className="text-xs text-neutral-400">
                {formatDateTime(comment.timestamp)}
              </span>
            </div>

            <p className={cn('text-neutral-600 whitespace-pre-wrap', isReply ? 'text-xs' : 'text-sm')}>
              {renderText(comment.text)}
            </p>

            {/* Reply button */}
            {!isReply && (
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="mt-1 text-xs text-neutral-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Reply
              </button>
            )}
          </div>
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="mt-2 ml-9 border-l border-neutral-200 pl-3 space-y-2">
            {replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 bg-neutral-50">
        <h3 className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">Comments</h3>
        {comments.length > 0 && (
          <span className="text-xs text-neutral-400">{comments.length}</span>
        )}
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400 py-8">
            <p className="text-sm">No comments yet</p>
          </div>
        ) : (
          <>
            {rootComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
            <div ref={commentsEndRef} />
          </>
        )}
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-3 py-1.5 bg-primary-50 border-t border-primary-100 flex items-center justify-between">
          <span className="text-xs text-primary-700">
            Replying to <span className="font-medium">{comments.find((c) => c.id === replyingTo)?.authorName}</span>
          </span>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-xs text-primary-600 hover:text-primary-800 font-medium"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Comment Input */}
      <div className="border-t border-neutral-200 p-3 bg-neutral-50">
        {/* Mention suggestions */}
        {showMentions && filteredUsers.length > 0 && (
          <div className="mb-2 bg-white rounded-md border border-neutral-200 shadow-sm overflow-hidden">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => insertMention(user)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 text-left text-sm"
              >
                <span className="font-medium text-neutral-900">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-neutral-400">·</span>
                <span className="text-neutral-500">{user.role}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Write a comment..."
            rows={1}
            className={cn(
              'flex-1 px-3 py-2 text-sm rounded-md border border-neutral-300 bg-white',
              'focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500',
              'placeholder:text-neutral-400 resize-none'
            )}
            style={{
              height: '36px',
              minHeight: '36px',
              maxHeight: '100px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = '36px';
              target.style.height = Math.min(target.scrollHeight, 100) + 'px';
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className={cn(
              'flex-shrink-0 p-2 rounded-md transition-colors',
              newComment.trim()
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            )}
            title="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
