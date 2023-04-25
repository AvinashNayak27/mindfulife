import React from "react";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import prisma from "@/lib/prisma";
import Modal from "react-modal";
export async function getStaticProps() {
  const posts = await prisma.post.findMany();
  const serializedPosts = JSON.stringify(posts);
  console.log(serializedPosts);

  return {
    props: { posts: serializedPosts },
  };
}
export default function Board({ posts }) {
  posts = JSON.parse(posts);
  const [newPost, setNewPost] = useState("");
  const user = useUser();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [positions, setPositions] = useState(
    posts.map(() => ({
      x: Math.floor(Math.random() * 800) - 400,
      y: Math.floor(Math.random() * 800) - 400,
    }))
  );
  useEffect(() => {
    // Apply the background color to the body element
    document.body.classList.add("bg-blue-50");
    return () => {
      document.body.classList.remove("bg-blue-50");
    };
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    setNewPost(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = { content: newPost, authorId: user.user.id };
      await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.error(error);
    }
    setNewPost("");
    router.reload();
  };
  function adjustPosition(positions, i) {
    const post = positions[i];
    const minDistance = 150; // minimum distance between posts
    const newPos = { ...post };
    for (let j = 0; j < positions.length; j++) {
      if (j !== i) {
        const otherPost = positions[j];
        const distance = Math.sqrt(
          (post.x - otherPost.x) ** 2 + (post.y - otherPost.y) ** 2
        );
        if (distance < minDistance) {
          const angle = Math.atan2(post.y - otherPost.y, post.x - otherPost.x);
          newPos.x += minDistance * Math.cos(angle);
          newPos.y += minDistance * Math.sin(angle);
        }
      }
    }
    return newPos;
  }

  return (
    <div className="relative h-screen bg-yellow">
      {posts.map((post, i) => {
        const newPos = adjustPosition(positions, i);
        positions[i] = newPos;
        return (
          <div
            key={post.id}
            className="absolute rounded-full bg-blue-500 text-white text-center p-4 cursor-pointer transform hover:scale-110 transition duration-300 shadow-lg"
            style={{
              left: `calc(50% + ${newPos.x}px)`,
              top: `calc(50% + ${newPos.y}px)`,
            }}
          >
            <p className="font-serif text-lg">{post.content}</p>
          </div>
        );
      })}
      <button
        onClick={openModal}
        className="fixed bottom-8 right-8 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full shadow-lg flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-pencil"
          viewBox="0 0 16 16"
        >
          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
        </svg>
        <span className="ml-2 text-lg font-semibold">write ...</span>
      </button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Create Post"
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            width: "400px",
            height: "auto",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        <form onSubmit={handleSubmit}>
          <label
            className="block font-serif font-bold text-lg mb-2 text-gray-700"
            htmlFor="content"
          >
            Post content
          </label>
          <textarea
            className="w-full px-3 py-2 mb-4 leading-tight text-gray-700 border border-yellow-400 rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            id="content"
            value={newPost}
            onChange={handleInputChange}
            placeholder="Write your post here"
            style={{ height: "235px" }}
            rows="5"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg"
          >
            Submit
          </button>
          <button
            onClick={closeModal}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2 shadow-lg"
          >
            Cancel
          </button>
        </form>
      </Modal>
    </div>
  );
}
