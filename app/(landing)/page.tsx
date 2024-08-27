import { Footer } from "@/components/footer";
import Header from "@/components/header";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col  bg-[linear-gradient(60deg,_rgb(247,_149,_51),_rgb(243,_112,_85),_rgb(239,_78,_123),_rgb(161,_102,_171),_rgb(80,_115,_184),_rgb(16,_152,_173),_rgb(7,_179,_155),_rgb(111,_186,_130))]  ">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4 text-white">
            Welcome to SmartChat
          </h1>
          <p className="text-2xl mb-8 text-white">
            Your AI-powered assistant for instant answers
          </p>
          <Link
            href="/chat"
            className="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
          >
            Start Chatting
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            title="24/7 Availability"
            description="Get answers anytime, anywhere"
            icon="🕒"
          />
          <FeatureCard
            title="Instant Responses"
            description="No waiting, get immediate answers"
            icon="⚡"
          />
          <FeatureCard
            title="Continuously Learning"
            description="Our AI improves with every interaction"
            icon="🧠"
          />
        </div>
      </main>
      <Footer/>
    </div>
  );
}

function FeatureCard({ title, description, icon }: any) {
  return (
    <div className="bg-white bg-opacity-20 p-6 rounded-lg shadow-lg backdrop-filter backdrop-blur-lg">
      <div className="text-4xl mb-4">{icon}</div>
      <h2 className="text-2xl font-semibold mb-2 text-white">{title}</h2>
      <p className="text-white">{description}</p>
    </div>
  );
}
