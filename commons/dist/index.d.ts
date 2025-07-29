import z from "zod";
export declare const signupInput: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
    name?: string | undefined;
}, {
    username: string;
    password: string;
    name?: string | undefined;
}>;
export declare const signinInput: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
export declare const createblogInput: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    content: string;
}, {
    title: string;
    content: string;
}>;
export declare const updateblogInput: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    content: string;
    id: string;
}, {
    title: string;
    content: string;
    id: string;
}>;
export declare const followUserInput: z.ZodObject<{
    followingId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    followingId: string;
}, {
    followingId: string;
}>;
export declare const unfollowUserInput: z.ZodObject<{
    followingId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    followingId: string;
}, {
    followingId: string;
}>;
export declare const likeBlogInput: z.ZodObject<{
    blogId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    blogId: string;
}, {
    blogId: string;
}>;
export declare const unlikeBlogInput: z.ZodObject<{
    blogId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    blogId: string;
}, {
    blogId: string;
}>;
export declare const createCommentInput: z.ZodObject<{
    blogId: z.ZodString;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
    blogId: string;
}, {
    content: string;
    blogId: string;
}>;
export declare const updateCommentInput: z.ZodObject<{
    commentId: z.ZodString;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
    commentId: string;
}, {
    content: string;
    commentId: string;
}>;
export declare const deleteCommentInput: z.ZodObject<{
    commentId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    commentId: string;
}, {
    commentId: string;
}>;
export declare const getBlogsInput: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    authorId: z.ZodOptional<z.ZodString>;
    following: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    authorId?: string | undefined;
    following?: boolean | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    authorId?: string | undefined;
    following?: boolean | undefined;
}>;
export declare const getCommentsInput: z.ZodObject<{
    blogId: z.ZodString;
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    blogId: string;
    page: number;
    limit: number;
}, {
    blogId: string;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const getUsersInput: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    search?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
}>;
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
