import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'
import { signupInput, signinInput, followUserInput, unfollowUserInput } from "@vkpal2001/medium-blog";
import { hashPassword, verifyPassword } from "../utils/hashing";

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
  try {
    const { success , data} = signupInput.safeParse(body);
    if (!success) {
        c.status(400);
        return c.json({
            message: "Inputs not correct"
        })
    }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    
    const { username, password, name } = data;


    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

  if (existingUser) {
      c.status(409);
      return c.json({ error: 'User already exists' });
  }
  // Replace bcrypt.hash with:
  const hashedPassword = await hashPassword(password);
  // console.log(hashedPassword);
    
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          name
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
  
  //sign in routes
  userRouter.post('/signin', async (c) => {
    const body = await c.req.json();
    const { success , data} = signinInput.safeParse(body);
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
      const { username, password } = data;

      // Find user
      const user = await prisma.user.findUnique({
          where: { username }
      });

      if (!user) {
          c.status(401)
          return c.json({ error: 'Invalid credentials' });
      }

      // Verify password
      // Replace bcrypt.compare with:
      const isValidPassword = await verifyPassword(password, user.password);

      if (!isValidPassword) {
          c.status(401)
          return c.json({ error: 'Invalid credentials' });
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
        username: true,
        name: true,
        bio: true,
        avatar: true,
        createdAt: true,
        _count: {
            select: {
                blogs: true,
                followers: true,
                following: true
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

    // Validate name
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return c.json({ message: "Name is required and must be a non-empty string" }, 400);
    }

    // Validate username
    if (!body.username || typeof body.username !== 'string' || body.username.trim() === '') {
      return c.json({ message: "Username is required and must be a non-empty string" }, 400);
    }

    // Check if username is taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        username: body.username.trim(),
        NOT: { id: Number(userId) }
      }
    });

    if (existingUser) {
      return c.json({ message: "Username is already taken" }, 400);
    }

    // Construct update data
    const updateData: any = {
      name: body.name.trim(),
      username: body.username.trim()
    };

    // Optional bio
    if (body.bio && typeof body.bio === 'string') {
      updateData.bio = body.bio.trim();
    }

    // Optional avatar
    if (body.avatar && typeof body.avatar === 'string') {
      updateData.avatar = body.avatar.trim();
    }

    // Optional password
    if (body.password && typeof body.password === 'string' && body.password.trim() !== '') {
      updateData.password = await hashPassword(body.password);
    }

    const user = await prisma.user.update({
      where: { id: Number(userId) },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        avatar: true,
      }
    });

    return c.json({
      message: "Profile updated successfully",
      user
    });

  } catch (error: unknown) {
    console.error('Database error:', error);

    if (error && typeof error === 'object' && 'code' in error && (error as any).code === 'P2002') {
      return c.json({ message: "Username is already taken" }, 400);
    }

    return c.json({ message: 'Internal server error' }, 500);
  } finally {
    await prisma.$disconnect();
  }
});


// follow routes //

// follow user

userRouter.post('/follow', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const body = await c.req.json();

    const parsed = followUserInput.safeParse(body);
    if (!parsed.success) {
      return c.json({
        error: 'Invalid input',
        details: parsed.error.issues,
      }, 400);
    }

    const { followingId } = parsed.data;
    const numericFollowingId = Number(followingId);

    const userIdStr = c.get('userId');
    const userId = Number(userIdStr);

    if (!userId || isNaN(userId)) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (numericFollowingId === userId) {
      return c.json({ error: 'Cannot follow yourself' }, 400);
    }

    const userToFollow = await prisma.user.findUnique({
      where: { id: numericFollowingId },
    });

    if (!userToFollow) {
      return c.json({ error: 'User not found' }, 404);
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: numericFollowingId,
        },
      },
    });

    if (existingFollow) {
      return c.json({ error: 'Already following this user' }, 400);
    }

    await prisma.follow.create({
      data: {
        followerId: userId,
        followingId: numericFollowingId,
      },
    });

    return c.json({ message: 'User followed successfully' });

  } catch (error) {
    console.error('Follow user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});


// unfollow routes

userRouter.delete('/unfollow', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const body = await c.req.json();

    const parsed = unfollowUserInput.safeParse(body);
    if (!parsed.success) {
      return c.json({
        error: 'Invalid input',
        details: parsed.error.issues,
      }, 400);
    }

    const { followingId } = parsed.data;
    const numericFollowingId = parseInt(followingId);

    const userIdStr = c.get('userId');
    const userId = Number(userIdStr);

    if (!userId || isNaN(userId)) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: numericFollowingId,
        },
      },
    });

    if (!follow) {
      return c.json({ error: 'Follow relationship not found' }, 404);
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: numericFollowingId,
        },
      },
    });

    return c.json({ message: 'User unfollowed successfully' });

  } catch (error) {
    console.error('Unfollow user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// get user by id

userRouter.get('/:id', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const idParam = c.req.param('id');
    const userId = parseInt(idParam);

    if (isNaN(userId)) {
      return c.json({ error: 'Invalid user ID' }, 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            blogs: true,
            followers: true,
            following: true
          }
        }
      }
    });

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(user);

  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});