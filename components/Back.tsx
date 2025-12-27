'use client'

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";


function Back() {
  const router = useRouter();

  return (
    <div className="flex justify-between items-center w-fit h-fit bg-[#F4F3ED] hover:bg-[#f6efcb] rounded-2xl p-0.5 mx-8 mt-8 cursor-default">
      <div 
        className='flex rounded-3xl px-3 pt-1 pb-1.5' 
        onClick={() => router.back()}
      >
        <ArrowLeft />
        <div className="px-1.5 font-normal">Back</div>
      </div>
    </div>
  )
}

export default Back