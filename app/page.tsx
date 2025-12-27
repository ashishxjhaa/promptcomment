'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner"
import axios from "axios";

export default function Home() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    if (!usernameRegex.test(username)) {
      toast.error("Username must be 3-20 characters (letters, numbers, underscore only)");
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post('/api/user', { username });
      localStorage.setItem('userId', response.data.id);
      localStorage.setItem('username', response.data.username);
      router.push('/comment');
    } catch (error) {
      console.log(error)
      toast.error("Something went wrong")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4F3ED]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tigher">Enter Your Username</h1>
          <p className="opacity-60">Choose a unique username to continue</p>
        </div>
        
        <div className="space-y-4">
          <Input 
            type="text" 
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            className="bg-white"
          />
          <Button 
            onClick={handleSubmit} 
            disabled={!username.trim() || loading}
            className="w-full"
          >
            {loading ? <Spinner className="w-4 h-4" /> : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}