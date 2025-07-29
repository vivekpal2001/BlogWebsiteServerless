"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersInput = exports.getCommentsInput = exports.getBlogsInput = exports.deleteCommentInput = exports.updateCommentInput = exports.createCommentInput = exports.unlikeBlogInput = exports.likeBlogInput = exports.unfollowUserInput = exports.followUserInput = exports.updateblogInput = exports.createblogInput = exports.signinInput = exports.signupInput = void 0;
const zod_1 = __importDefault(require("zod"));
// Existing schemas
exports.signupInput = zod_1.default.object({
    username: zod_1.default.string().email(),
    password: zod_1.default.string().min(8),
    name: zod_1.default.string().optional()
});
exports.signinInput = zod_1.default.object({
    username: zod_1.default.string().email(),
    password: zod_1.default.string().min(8),
});
exports.createblogInput = zod_1.default.object({
    title: zod_1.default.string().min(5),
    content: zod_1.default.string().min(10)
});
exports.updateblogInput = zod_1.default.object({
    title: zod_1.default.string().min(5),
    content: zod_1.default.string().min(10),
    id: zod_1.default.string()
});
// New schemas for social features
exports.followUserInput = zod_1.default.object({
    followingId: zod_1.default.string()
});
exports.unfollowUserInput = zod_1.default.object({
    followingId: zod_1.default.string()
});
exports.likeBlogInput = zod_1.default.object({
    blogId: zod_1.default.string()
});
exports.unlikeBlogInput = zod_1.default.object({
    blogId: zod_1.default.string()
});
exports.createCommentInput = zod_1.default.object({
    blogId: zod_1.default.string(),
    content: zod_1.default.string().min(1).max(500)
});
exports.updateCommentInput = zod_1.default.object({
    commentId: zod_1.default.string(),
    content: zod_1.default.string().min(1).max(500)
});
exports.deleteCommentInput = zod_1.default.object({
    commentId: zod_1.default.string()
});
// Query schemas for filtering/pagination
exports.getBlogsInput = zod_1.default.object({
    page: zod_1.default.number().min(1).optional().default(1),
    limit: zod_1.default.number().min(1).max(50).optional().default(10),
    authorId: zod_1.default.string().optional(),
    following: zod_1.default.boolean().optional() // Get blogs from followed users
});
exports.getCommentsInput = zod_1.default.object({
    blogId: zod_1.default.string(),
    page: zod_1.default.number().min(1).optional().default(1),
    limit: zod_1.default.number().min(1).max(50).optional().default(10)
});
exports.getUsersInput = zod_1.default.object({
    page: zod_1.default.number().min(1).optional().default(1),
    limit: zod_1.default.number().min(1).max(50).optional().default(10),
    search: zod_1.default.string().optional()
});
