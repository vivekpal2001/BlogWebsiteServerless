import { createblogInput, updateblogInput, getBlogsInput, likeBlogInput, unlikeBlogInput, createCommentInput, getCommentsInput, updateCommentInput, deleteCommentInput } from "@vkpal2001/medium-blog";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }, 
    Variables: {
        userId: string;
    }
}>();

blogRouter.use("/*", async (c, next) => {
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
});

blogRouter.post('/', async (c) => {
    const body = await c.req.json();
    const { success , data} = createblogInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }
    const { title, content } = data;
    const authorId = Number(c.get("userId"));
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blog = await prisma.blog.create({
        data: {
            title,
            content,
            authorId,
            published: true,
            publishedAt: new Date()
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    name: true
                }
            }
        }
    })

    return c.json({
        id: blog.id
    })
})



blogRouter.put('/:id', async (c) => {
    const body = await c.req.json();
    const id = c.req.param("id");
    
    // Create the validation object with id included
    const updateData = {
        id: id,
        title: body.title,
        content: body.content
    };
    
    const { success , data } = updateblogInput.safeParse(updateData);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }
    const {title,content} = data;
    const authorId = c.get("userId");
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        // First check if the blog exists and belongs to the user
        const existingBlog = await prisma.blog.findUnique({
            where: {
                id: Number(id),
                authorId: Number(authorId)
            }
        });

        if (!existingBlog) {
            c.status(404);
            return c.json({
                message: "Blog not found or you don't have permission to edit it"
            })
        }

        const blog = await prisma.blog.update({
            where: {
                id: Number(id)
            }, 
            data: {
                title,
                content
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true
                    }
                }
            }
        })

        return c.json({
            id: blog.id,
            message: "Blog updated successfully"
        })
    } catch(e) {
        console.error("Error updating blog:", e);
        c.status(500);
        return c.json({
            message: "Error while updating blog"
        })
    }
})

blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    try {
        const query = c.req.query();
        const { success, data } = getBlogsInput.safeParse({
          authorId: query.authorId,
          following: query.following === 'true',
        });
    
        if (!success) {
          return c.json({ error: 'Invalid query parameters' }, 400);
        }
    
        const { authorId, following } = data;
    
        let whereClause: any = { published: true };
    
        if (authorId) {
          whereClause.authorId = parseInt(authorId);
        }
    
        if (following) {
            const userId = Number(c.get("userId"));
            try {
              const followedUsers = await prisma.follow.findMany({
                where: { followerId:  userId},
                select: { followingId: true },
              });
    
              const followedUserIds = followedUsers.map(f => f.followingId);
              whereClause.authorId = { in: followedUserIds };
            } catch (err) {
              console.warn('Invalid JWT token, skipping following filter');
            }
          }
        
    
        const blogs = await prisma.blog.findMany({
          where: whereClause,
          orderBy: { publishedAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar : true
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        });
    
        return c.json({ blogs });
      } catch (error) {
        console.error('Get blogs error:', error);
        return c.json({ error: 'Internal server error' }, 500);
      }
})


blogRouter.get('/my', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const blogs = await prisma.blog.findMany({
        where: {
            authorId: Number(c.get("userId"))
        },
        select: {
            content: true,
            title: true,
            id: true,
            author: {
                select: {
                    name: true
                }
            }
        }
    });

    return c.json({
        blogs
    })
})


blogRouter.delete('/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    try {
        const blogId = parseInt(c.req.param("id"));

        const blog = await prisma.blog.findUnique({
            where: { id: blogId }
        });

        if (!blog) {
            c.status(404);
            return c.json({ error: 'Blog not found' });
        }

        if (blog.authorId !== Number(c.get("userId"))) {
            c.status(403)
            return c.json({ error: 'Not authorized to delete this blog' });
        }

        await prisma.blog.delete({
            where: { id: blogId }
        });

        return c.json({ message: 'Blog deleted successfully' });

    } catch (error) {
        console.error('Delete blog error:', error);
        c.status(500);
        return c.json({ error: 'Internal server error' });
    }
})



blogRouter.get('/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    
    try {
        const blogId = parseInt(c.req.param("id"));
        
        const blog = await prisma.blog.findUnique({
            where: { id: blogId, published: true },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        bio: true,
                        avatar: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            }
        });
        
        if (!blog) {
            c.status(404);
            return c.json({ error: 'Blog not found' });
        }
        
        return c.json({blog});
        
    } catch (error) {
        console.error('Get blog error:', error);
        c.status(500);
        return c.json({ error: 'Internal server error' });
    }
})

//  likes routes
blogRouter.post('/like', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
      const body = await c.req.json();
  
      const parsed = likeBlogInput.safeParse(body);
      if (!parsed.success) {
        return c.json({
          error: 'Invalid input',
          details: parsed.error.issues,
        }, 400);
      }
  
      const { blogId } = parsed.data;
      const numericBlogId = parseInt(blogId);
  
      // Get userId from context
      const userIdStr = c.get('userId'); // Make sure it's set via middleware
      const userId = Number(userIdStr);
  
      if (!userId || isNaN(userId)) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
  
      // Check if blog exists
      const blog = await prisma.blog.findUnique({
        where: { id: numericBlogId },
      });
  
      if (!blog) {
        return c.json({ error: 'Blog not found' }, 404);
      }
  
      // Check if already liked
      const existingLike = await prisma.like.findUnique({
        where: {
          blogId_userId: {
            blogId: numericBlogId,
            userId,
          },
        },
      });
  
      if (existingLike) {
        return c.json({ error: 'Blog already liked' }, 400);
      }
  
      // Create like
      await prisma.like.create({
        data: {
          blogId: numericBlogId,
          userId,
        },
      });
  
      return c.json({ message: 'Blog liked successfully' });
    } catch (error) {
      console.error('Like blog error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  //unlike routes

  blogRouter.delete('/unlike', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
      const body = await c.req.json();
  
      const parsed = unlikeBlogInput.safeParse(body);
      if (!parsed.success) {
        return c.json({
          error: 'Invalid input',
          details: parsed.error.issues,
        }, 400);
      }
  
      const { blogId } = parsed.data;
      const numericBlogId = parseInt(blogId);
  
      const userIdStr = c.get('userId'); // Must be set by auth middleware
      const userId = Number(userIdStr);
  
      if (!userId || isNaN(userId)) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
  
      const like = await prisma.like.findUnique({
        where: {
          blogId_userId: {
            blogId: numericBlogId,
            userId,
          },
        },
      });
  
      if (!like) {
        return c.json({ error: 'Like not found' }, 404);
      }
  
      await prisma.like.delete({
        where: {
          blogId_userId: {
            blogId: numericBlogId,
            userId,
          },
        },
      });
  
      return c.json({ message: 'Blog unliked successfully' });
    } catch (error) {
      console.error('Unlike blog error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });



  //comments routes

  blogRouter.post('/comment', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
      const body = await c.req.json();
  
      const parsed = createCommentInput.safeParse(body);
      if (!parsed.success) {
        return c.json({
          error: 'Invalid input',
          details: parsed.error.issues,
        }, 400);
      }
  
      const { blogId, content } = parsed.data;
      const numericBlogId = Number(blogId);
  
      const userIdStr = c.get('userId');
      const userId = Number(userIdStr);
  
      if (!userId || isNaN(userId)) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
  
      const blog = await prisma.blog.findUnique({
        where: { id: numericBlogId },
      });
  
      if (!blog) {
        return c.json({ error: 'Blog not found' }, 404);
      }
  
      const comment = await prisma.comment.create({
        data: {
          content,
          blogId: numericBlogId,
          authorId: userId,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
        },
      });
  
      return c.json({
        message: 'Comment created successfully',
        comment,
      }, 201);
    } catch (error) {
      console.error('Create comment error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
});

// get blog comments
blogRouter.get('/comment/:blogId', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
      const blogId = c.req.param('blogId');
      const page = c.req.query('page') ? parseInt(c.req.query('page')!) : undefined;
      const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : undefined;
  
      const parsed = getCommentsInput.safeParse({
        blogId,
        page,
        limit
      });
  
      if (!parsed.success) {
        return c.json({ error: 'Invalid parameters' }, 400);
      }
  
      const { blogId: parsedBlogId, page: parsedPage, limit: parsedLimit } = parsed.data;
      const numericBlogId = parseInt(parsedBlogId);
      const skip = (parsedPage - 1) * parsedLimit;
  
      const [comments, totalCount] = await Promise.all([
        prisma.comment.findMany({
          where: { blogId: numericBlogId },
          skip,
          take: parsedLimit,
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                name: true
              }
            }
          }
        }),
        prisma.comment.count({
          where: { blogId: numericBlogId }
        })
      ]);
  
      return c.json({
        comments,
        pagination: {
          currentPage: parsedPage,
          totalPages: Math.ceil(totalCount / parsedLimit),
          totalCount,
          hasNext: parsedPage * parsedLimit < totalCount,
          hasPrev: parsedPage > 1
        }
      });
    } catch (error) {
      console.error('Get comments error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

// edit comment 
blogRouter.put('/comment', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
      const body = await c.req.json();
  
      const parsed = updateCommentInput.safeParse(body);
      if (!parsed.success) {
        return c.json({
          error: 'Invalid input',
          details: parsed.error.issues,
        }, 400);
      }
  
      const { commentId, content } = parsed.data;
      const numericCommentId = parseInt(commentId);
  
      const userIdStr = c.get('userId');
      const userId = Number(userIdStr);
  
      if (!userId || isNaN(userId)) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
  
      const existingComment = await prisma.comment.findUnique({
        where: { id: numericCommentId },
      });
  
      if (!existingComment) {
        return c.json({ error: 'Comment not found' }, 404);
      }
  
      if (existingComment.authorId !== userId) {
        return c.json({ error: 'Not authorized to update this comment' }, 403);
      }
  
      const comment = await prisma.comment.update({
        where: { id: numericCommentId },
        data: { content },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
        },
      });
  
      return c.json({
        message: 'Comment updated successfully',
        comment,
      });
    } catch (error) {
      console.error('Update comment error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

// delete comment

blogRouter.delete('/comment', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
      const body = await c.req.json();
  
      const parsed = deleteCommentInput.safeParse(body);
      if (!parsed.success) {
        return c.json({
          error: 'Invalid input',
          details: parsed.error.issues,
        }, 400);
      }
  
      const { commentId } = parsed.data;
      const numericCommentId = parseInt(commentId);
  
      const userIdStr = c.get('userId');
      const userId = Number(userIdStr);
  
      if (!userId || isNaN(userId)) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
  
      const comment = await prisma.comment.findUnique({
        where: { id: numericCommentId },
      });
  
      if (!comment) {
        return c.json({ error: 'Comment not found' }, 404);
      }
  
      if (comment.authorId !== userId) {
        return c.json({ error: 'Not authorized to delete this comment' }, 403);
      }
  
      await prisma.comment.delete({
        where: { id: numericCommentId },
      });
  
      return c.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Delete comment error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
});