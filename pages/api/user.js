import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, authorId, name } = req.body;

  try {
    const user = await prisma.user.create({
      data: {
        authorId: authorId,
        email: email,
        name: name,
      },
    });
    console.log(user)
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create user" });
  }
}
