import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="bg-blue-600 text-white p-4 flex justify-between">
      <h1 className="font-bold">AI Edu</h1>

      <div className="space-x-4">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/chat">AI Chat</Link>
        <Link to="/quiz">Quiz</Link>
      </div>
    </div>
  );
}