"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";

export default function NewChat() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/messages/new?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">New Chat</h2>
      <form onSubmit={handleSearch} className="space-y-4">
        <Input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        <Button type="submit" className="w-full">
          Start Chat
        </Button>
      </form>
    </div>
  );
}