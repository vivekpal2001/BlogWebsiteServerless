import z from "zod";

export const signupInput = z.object({
    username:z.string().email(),
    password:z.string().min(8),
    name:z.string().optional()
})


export const signinInput = z.object({
    username:z.string().email(),
    password:z.string().min(8 ),
})


export const createblogInput = z.object({
    title:z.string().min(5),
    content:z.string().min(10)
})


export const updateblogInput = z.object({
    title:z.string().min(5),
    content:z.string().min(10),
    id:z.string()
})

export type SignupInput = z.infer<typeof signupInput>;
export type SigninInput = z.infer<typeof signinInput>;
export type CreateblogInput = z.infer<typeof createblogInput>;
export type UpdateblogInput = z.infer<typeof updateblogInput>;