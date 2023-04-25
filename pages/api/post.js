import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { content, authorId } = req.body;

  try {
    const post = await prisma.post.create({
      data: {
        content,
        authorId,
      },
    });
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create post' });
  }
}
