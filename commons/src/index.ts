import z from "zod";

// Existing schemas
export const signupInput = z.object({
    username: z.string().email(),
    password: z.string().min(8),
    name: z.string().optional()
});

export const signinInput = z.object({
    username: z.string().email(),
    password: z.string().min(8),
});

export const createblogInput = z.object({
    title: z.string().min(5),
    content: z.string().min(10)
});

export const updateblogInput = z.object({
    title: z.string().min(5),
    content: z.string().min(10),
    id: z.string()
});

// New schemas for social features
export const followUserInput = z.object({
    followingId: z.string()
});

export const unfollowUserInput = z.object({
    followingId: z.string()
});

export const likeBlogInput = z.object({
    blogId: z.string()
});

export const unlikeBlogInput = z.object({
    blogId: z.string()
});

export const createCommentInput = z.object({
    blogId: z.string(),
    content: z.string().min(1).max(500)
});

export const updateCommentInput = z.object({
    commentId: z.string(),
    content: z.string().min(1).max(500)
});

export const deleteCommentInput = z.object({
    commentId: z.string()
});

// Query schemas for filtering/pagination
export const getBlogsInput = z.object({
    page: z.number().min(1).optional().default(1),
    limit: z.number().min(1).max(50).optional().default(10),
    authorId: z.string().optional(),
    following: z.boolean().optional() // Get blogs from followed users
});

export const getCommentsInput = z.object({
    blogId: z.string(),
    page: z.number().min(1).optional().default(1),
    limit: z.number().min(1).max(50).optional().default(10)
});

export const getUsersInput = z.object({
    page: z.number().min(1).optional().default(1),
    limit: z.number().min(1).max(50).optional().default(10),
    search: z.string().optional()
});

// Type exports
export type SignupInput = z.infer<typeof signupInput>;
export type SigninInput = z.infer<typeof signinInput>;
export type CreateblogInput = z.infer<typeof createblogInput>;
export type UpdateblogInput = z.infer<typeof updateblogInput>;
export type FollowUserInput = z.infer<typeof followUserInput>;
export type UnfollowUserInput = z.infer<typeof unfollowUserInput>;
export type LikeBlogInput = z.infer<typeof likeBlogInput>;
export type UnlikeBlogInput = z.infer<typeof unlikeBlogInput>;
export type CreateCommentInput = z.infer<typeof createCommentInput>;
export type UpdateCommentInput = z.infer<typeof updateCommentInput>;
export type DeleteCommentInput = z.infer<typeof deleteCommentInput>;
export type GetBlogsInput = z.infer<typeof getBlogsInput>;
export type GetCommentsInput = z.infer<typeof getCommentsInput>;
export type GetUsersInput = z.infer<typeof getUsersInput>;