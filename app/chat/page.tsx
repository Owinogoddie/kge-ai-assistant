import ChatInterface from "@/components/chat-interface";
import {Footer} from "@/components/footer";
import Header from "@/components/header";


export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col  bg-[linear-gradient(60deg,_rgb(247,_149,_51),_rgb(243,_112,_85),_rgb(239,_78,_123),_rgb(161,_102,_171),_rgb(80,_115,_184),_rgb(16,_152,_173),_rgb(7,_179,_155),_rgb(111,_186,_130))]  ">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-underline">Chat with SmartChat</h1>
        <br />
        <ChatInterface />
      </main>
      <Footer />
    </div>
  );
}