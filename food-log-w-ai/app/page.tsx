import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#aacfdd]/20 px-6">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12  items-center">
        <div className="space-y-8 text-center md:text-left">
          <span className="inline-bloc py-1 px-3 rounded-full bg-[#fe1100]/10 text-[#fe1100] text-sm font-bold tracking-wide">
            AI-POWERED NUTRITION
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-[#37375e] leading-tight">
            Eat Smarter, <br />
            <span className="text-[#fe875d]">not harder.</span>
          </h1>
          <p className="text-xl text-[#356288] max-w-lg mx-auto md:mx-0 leading-relaxed">
            Your personal AI food logger. Snap a photo of your meal and let us
            handle the calories, macros, and nutrients instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link href="/food-log">
              <button className="w-full sm:w-auto bg-[#fe875d] hover:bg-[#fe875d]/90 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-[#fe875d]/20 transition-transform hover:-translate-y-1">
                {" "}
                Start Tracking Now{" "}
              </button>
            </Link>
            
            <button className="w-full sm:w-auto text-[#37375e] font-bold px-8 py-4 hover:bg-[#37375e]/5 rounded-2xl transition-colors">
            Learn More
            </button>
          </div> 
        </div>

        {/* Hero Image */}
        <div className="relative flex justfiy-center items-center">
          <div className="absolute w-[400px] h-[400px] bg-[#aacfdd] rounded-full blur-3xl opcaity-40 -z-10 animate-pulse"></div>
          <Image
           src="/MofuLogoEating.png"
           alt="Mofu Eating Logo"
           width={450}
           height={450}
           className="drop-shadow-2xl hover:scale-105 transition-transform duration-500 ease-in-out"
           priority
          />
        </div>
      </div>
    </main>
  );
}
