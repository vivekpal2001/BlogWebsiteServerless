import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'
import { signupInput, signinInput } from "@vkpal2001/medium-blog";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables: {
        userId: string;
    }
}>();

// Auth middleware function
const authMiddleware = async (c: any, next: any) => {
    const authHeader = c.req.header("authorization") || "";
    try {
        const user = await verify(authHeader, c.env.JWT_SECRET);
        if (user) {
            c.set("userId", String(user.id));
            await next();
        } else {
            c.status(403);
            return c.json({
                message: "You are not logged in"
            });
        }
    } catch(error: unknown) {
        console.error('Auth error:', error instanceof Error ? error.message : error);
        c.status(403);
        return c.json({
            message: "You are not logged in"
        });
    }
};

// Public routes
userRouter.post('/signup', async (c) => {
    const body = await c.req.json();
    const { success } = signupInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  
    try {
      const user = await prisma.user.create({
        data: {
          username: body.username,
          password: body.password,
          name: body.name
        }
      })
      const jwt = await sign({
        id: user.id
      }, c.env.JWT_SECRET);
  
      return c.text(jwt)
    } catch(e) {
      console.log(e);
      c.status(411);
      return c.text('Invalid')
    }
  })
  
  
  userRouter.post('/signin', async (c) => {
    const body = await c.req.json();
    const { success } = signinInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  
    try {
      const user = await prisma.user.findFirst({
        where: {
          username: body.username,
          password: body.password,
        }
      })
      if (!user) {
        c.status(403);
        return c.json({
          message: "Incorrect creds"
        })
      }
      const jwt = await sign({
        id: user.id
      }, c.env.JWT_SECRET);
  
      return c.text(jwt)
    } catch(e) {
      console.log(e);
      c.status(411);
      return c.text('Invalid')
    }
  })

  // Protected routes
// Auth Middleware - Fixed to handle Bearer token properly


// GET user profile
userRouter.get('/me', authMiddleware, async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  
  try {
    const userId = c.get('userId');
    
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        name: true,
        username: true,
        _count: {
          select: {
            blogs: true
          }
        }
      }
    });
    
    if (!user) {
      return c.json({ message: 'User not found' }, 404);
    }
    
    return c.json({
      ...user,
      blogCount: user._count.blogs
    });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ message: 'Internal server error' }, 500);
  } finally {
    await prisma.$disconnect();
  }
});

// UPDATE user profile
userRouter.put('/update', authMiddleware, async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  
  try {
    const body = await c.req.json();
    const userId = c.get('userId');
    
    // Validate input
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return c.json({ message: "Name is required and must be a non-empty string" }, 400);
    }
    
    if (!body.username || typeof body.username !== 'string' || body.username.trim() === '') {
      return c.json({ message: "Username is required and must be a non-empty string" }, 400);
    }
    
    // Check if username is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        username: body.username.trim(),
        NOT: {
          id: Number(userId)
        }
      }
    });
    
    if (existingUser) {
      return c.json({ message: "Username is already taken" }, 400);
    }
    
    // Update user data
    const updateData = {
      name: body.name.trim(),
      username: body.username.trim()
    };
    
    // Only update password if provided
    if (body.password && body.password.trim() !== '') {
      // Hash password before storing (add your password hashing logic)
      // updateData.password = await hashPassword(body.password);
    }
    
    const user = await prisma.user.update({
      where: { id: Number(userId) },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,

      }
    });
    
    return c.json({
      message: "Profile updated successfully",
      user
    });
  } catch (error: unknown) {
    console.error('Database error:', error);
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return c.json({ message: "Username is already taken" }, 400);
    }
    
    return c.json({ message: 'Internal server error' }, 500);
  } finally {
    await prisma.$disconnect();
  }
});