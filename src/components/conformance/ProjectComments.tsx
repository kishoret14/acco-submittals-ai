import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export interface ProjectComment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  timestamp: Date;
}

interface ProjectCommentsProps {
  comments: ProjectComment[];
  onAddComment: (text: string) => void;
  currentUserName: string;
  className?: string;
}

export function ProjectComments({
  comments,
  onAddComment,
  currentUserName,
  className,
}: ProjectCommentsProps) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 bg-white">
        <MessageSquare className="h-4 w-4 text-neutral-500" />
        <h3 className="text-sm font-medium text-neutral-900">Project Comments</h3>
        {comments.length > 0 && (
          <span className="text-xs text-neutral-500">({comments.length})</span>
        )}
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50">
        {comments.length === 0 ? (
          <div className="text-center py-6 text-neutral-400">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs mt-1">Be the first to add a comment</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-7 w-7 flex-shrink-0">
                <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
                  {getInitials(comment.authorName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm font-medium text-neutral-900">
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {formatTimestamp(comment.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mt-0.5 break-words">
                  {comment.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-neutral-200 bg-white">
        <div className="flex gap-2">
          <Avatar className="h-7 w-7 flex-shrink-0">
            <AvatarFallback className="text-xs bg-accent-100 text-accent-700">
              {getInitials(currentUserName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[36px] h-9 py-2 resize-none text-sm"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newComment.trim()}
              className="h-9 px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
