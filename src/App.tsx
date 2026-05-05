import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Youtube, 
  BookOpen, 
  FileText, 
  GraduationCap, 
  HelpCircle, 
  ChevronRight, 
  ArrowLeft, 
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  LayoutDashboard,
  Bell,
  Eye,
  EyeOff
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateEducationalContent, generateMCQs } from './lib/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types
type ViewState = 'home' | 'guide' | 'short-read' | 'exam-prep' | 'mcq';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
}

const CLASSES = [
  'প্রথম শ্রেণী', 'দ্বিতীয় শ্রেণী', 'তৃতীয় শ্রেণী', 'চতুর্থ শ্রেণী', 'পঞ্চম শ্রেণী',
  'ষষ্ঠ শ্রেণী', 'সপ্তম শ্রেণী', 'অষ্টম শ্রেণী', 'নবম শ্রেণী', 'দশম শ্রেণী',
  'একাদশ শ্রেণী', 'দ্বাদশ শ্রেণী'
];

const YT_LINK = "https://youtube.com/@tomteczone?si=iJzET3PGsmG8SaBO";

// Components
const Navbar = ({ onViewChange }: { onViewChange: (v: ViewState) => void }) => (
  <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onViewChange('home')}
        >
          <div className="bg-blue-600 p-2 rounded-xl">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            AI Teacher
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <a 
            href={YT_LINK} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors font-medium"
          >
            <Youtube className="w-5 h-5" />
            <span>Tom Tec Zone</span>
          </a>
          <a 
            href={YT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-all shadow-md active:scale-95"
          >
            সাবস্ক্রাইব করুন
          </a>
        </div>
      </div>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <GraduationCap className="w-6 h-6 text-blue-600" />
          <span>AI Teacher</span>
        </div>
        <p className="max-w-md">নতুন নতুন আপডেট পেতে এবং শিক্ষনীয় ভিডিও দেখতে আমাদের ইউটিউব চ্যানেলটি সাবস্ক্রাইব করুন।</p>
        <a 
          href={YT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-white border-2 border-red-600 text-red-600 px-8 py-3 rounded-2xl font-bold hover:bg-red-50 transition-all shadow-sm group"
        >
          <Youtube className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span>Tom Tec Zone YouTube</span>
          <ExternalLink className="w-4 h-4" />
        </a>
        <p className="text-sm opacity-50">© {new Date().getFullYear()} AI Teacher by Tom Tec Zone. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [selectedClass, setSelectedClass] = useState(CLASSES[9]); // Default Class 10
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  
  // MCQ State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [answersStatus, setAnswersStatus] = useState<(boolean | null)[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleGenerate = async (type: ViewState) => {
    if (!subject.trim()) {
      alert('অনুগ্রহ করে বিষয়টি লিখুন');
      return;
    }
    setLoading(true);
    setContent('');
    
    let prompt = '';
    if (type === 'guide') {
      prompt = `Create a comprehensive and important board-exam style note/guide for ${selectedClass} on the subject "${subject}" in Bengali. Focus on key topics likely to appear in exams and explain them clearly.`;
    } else if (type === 'short-read') {
      prompt = `Provide a list of important short questions and answers for ${selectedClass} on the subject "${subject}" in Bengali. These should be high-priority for board exams.`;
    } else if (type === 'exam-prep') {
      prompt = `Create an exam preparation plan and highly important questions/suggestions for ${selectedClass} for the subject "${subject}" in Bengali. Include tips for scoring high in board exams.`;
    }

    const result = await generateEducationalContent(prompt);
    setContent(result);
    setLoading(false);
  };

  const startMCQ = async () => {
    if (!subject.trim()) {
      alert('অনুগ্রহ করে বিষয়টি লিখুন');
      return;
    }
    setLoading(true);
    const qs = await generateMCQs(selectedClass, subject);
    if (qs.length > 0) {
      setQuestions(qs);
      setCurrentQIndex(0);
      setScore(0);
      setWrong(0);
      setAnswersStatus(new Array(qs.length).fill(null));
      setQuizFinished(false);
      setView('mcq');
    } else {
      alert('দুঃখিত, কুইজ জেনারেট করা সম্ভব হয়নি। আবার চেষ্টা করুন।');
    }
    setLoading(false);
  };

  const handleAnswer = (index: number) => {
    if (quizFinished || answersStatus[currentQIndex] !== null) return;

    const isCorrect = index === questions[currentQIndex].correctIndex;
    const newStatus = [...answersStatus];
    newStatus[currentQIndex] = isCorrect;
    setAnswersStatus(newStatus);

    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      setWrong(prev => prev + 1);
    }

    // Auto next after small delay
    setTimeout(() => {
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
        setShowHint(false);
      } else {
        setQuizFinished(true);
      }
    }, 1200);
  };

  const renderHome = () => (
    <motion.div 
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-12"
    >
      <section className="text-center space-y-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold border border-blue-100"
        >
          <Bell className="w-4 h-4" />
          <span>স্বাগতম! আপনার শিক্ষা সহায়ক এআই শিক্ষক এখন আপনার পাশে</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black text-gray-900 leading-tight"
        >
          শিখুন সহজে, <br />
          <span className="text-blue-600">এআই শিক্ষকের</span> মাধ্যমে
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 max-w-2xl mx-auto"
        >
          প্রথম শ্রেণী থেকে দ্বাদশ শ্রেণী পর্যন্ত সকল বিষয়ের নোট, সংক্ষিপ্ত প্রশ্ন এবং MCQ পরীক্ষা দিন খুব সহজে।
        </motion.p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {[
          { id: 'guide', title: 'গাইড দেখুন', icon: BookOpen, color: 'bg-blue-500', desc: 'বোর্ড পরীক্ষার জন্য গুরুত্বপূর্ণ নোট পান' },
          { id: 'short-read', title: 'সংক্ষিপ্ত পড়া', icon: FileText, color: 'bg-indigo-500', desc: 'গুরুত্বপূর্ণ সংক্ষিপ্ত প্রশ্ন ও উত্তর' },
          { id: 'exam-prep', title: 'পরীক্ষার প্রস্তুতি', icon: GraduationCap, color: 'bg-purple-500', desc: 'সেরা ফলাফলের জন্য বিশেষ প্রস্তুতি' },
          { id: 'mcq', title: 'MCQ পরীক্ষা', icon: HelpCircle, color: 'bg-rose-500', desc: '৩০টি প্রশ্নের মাধ্যমে নিজেকে যাচাই করুন' }
        ].map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * idx }}
            whileHover={{ y: -5 }}
            onClick={() => {
              setSubject('');
              setContent('');
              setQuizFinished(false);
              setView(item.id as ViewState);
            }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 cursor-pointer group active:scale-95 transition-all"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg", item.color)}>
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{item.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{item.desc}</p>
            <div className="flex items-center gap-1 text-blue-600 font-bold text-sm">
              <span>শুরু করুন</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-red-50 rounded-3xl p-8 border border-red-100 mt-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <Youtube className="w-32 h-32 text-red-600" />
        </div>
        <div className="relative z-10 space-y-4 max-w-lg">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Youtube className="text-red-600" />
            আমাদের ইউটিউব চ্যানেল
          </h2>
          <p className="text-gray-700">আরো শিক্ষনীয় ভিডিও এবং নতুন সব আপডেট পেতে আমাদের ইউটিউব চ্যানেলটি সাবস্ক্রাইব করে রাখুন।</p>
          <a 
            href={YT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
          >
            Tom Tec Zone এ যান
          </a>
        </div>
      </div>
    </motion.div>
  );

  const renderForm = (title: string, onAction: () => void, btnLabel: string) => (
    <motion.div 
      key={title}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="max-w-3xl mx-auto space-y-8 py-8"
    >
      <button 
        onClick={() => setView('home')}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>ফিরে যান</span>
      </button>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl shadow-blue-100/50 space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-gray-900">{title}</h2>
          <p className="text-gray-500">আপনার শ্রেণী এবং বিষয়টি দিন যাতে এআই আপনাকে সাহায্য করতে পারে</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">শ্রেণী নির্বাচন করুন</label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
            >
              {CLASSES.map(cl => <option key={cl} value={cl}>{cl}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">বিষয়ের নাম লিখুন</label>
            <input 
              type="text" 
              placeholder="উদাহরণ: বাংলা, গণিত, পদার্থ বিজ্ঞান"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <button 
          onClick={onAction}
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-2xl py-4 font-bold text-lg hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-blue-200"
        >
          {loading ? 'প্রসেসিং হচ্ছে...' : btnLabel}
        </button>
      </div>

      {content && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl prose prose-blue max-w-none"
        >
          <div className="markdown-body">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-100 text-center space-y-4">
            <p className="text-gray-600 font-medium">পড়াটি কেমন লাগলো? আরও বিস্তারিত জানতে ইউটিউব চ্যানেলটি দেখুন</p>
            <a 
              href={YT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 active:scale-95"
            >
              <Youtube className="w-5 h-5" />
              Tom Tec Zone সাবস্ক্রাইব করুন
            </a>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  const renderMCQ = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xl font-bold text-gray-700 animate-pulse text-center">এআই আপনার জন্য বোর্ড স্ট্যান্ডার্ড <br/> ৩০টি প্রশ্ন তৈরি করছে...</p>
      </div>
    );

    if (quizFinished) {
      const percentage = Math.round((score / questions.length) * 100);
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto py-12 text-center space-y-8"
        >
          <div className="bg-white rounded-[40px] p-12 border border-gray-100 shadow-2xl space-y-6">
            <div className="text-6xl">🎉</div>
            <h2 className="text-4xl font-black text-gray-900">অভিনন্দন!</h2>
            <p className="text-xl text-gray-600">আপনি সফলভাবে পরীক্ষাটি শেষ করেছেন। আপনার ফলাফল নিচে দেওয়া হলো:</p>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-6 rounded-3xl">
                <div className="text-3xl font-black text-green-600">{score}</div>
                <div className="text-sm font-bold text-green-700 mt-1">সঠিক</div>
              </div>
              <div className="bg-red-50 p-6 rounded-3xl">
                <div className="text-3xl font-black text-red-600">{wrong}</div>
                <div className="text-sm font-bold text-red-700 mt-1">ভুল</div>
              </div>
              <div className="bg-blue-50 p-6 rounded-3xl">
                <div className="text-3xl font-black text-blue-600">{percentage}%</div>
                <div className="text-sm font-bold text-blue-700 mt-1">সঠিকের হার</div>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <p className="font-bold text-gray-700">আরো ভালো প্রেপারেশনের জন্য চ্যানেলটি সাবস্ক্রাইব করুন</p>
              <a 
                href={YT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-red-600 text-white w-full py-4 rounded-2xl font-bold hover:bg-red-700 active:scale-95 shadow-xl shadow-red-200"
              >
                <Youtube className="w-6 h-6" />
                Tom Tec Zone সাবস্ক্রাইব করুন
              </a>
              <button 
                onClick={() => setView('home')}
                className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
              >
                হোম পেজে ফিরে যান
              </button>
            </div>
          </div>
        </motion.div>
      );
    }

    const currentQ = questions[currentQIndex];
    if (!currentQ) return null;

    const remaining = questions.length - (score + wrong);

    return (
      <motion.div 
        key="quiz-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-3xl mx-auto py-8 px-4 space-y-6"
      >
        <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm sticky top-20 z-40">
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{score} সঠিক</span>
            </div>
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full font-bold">
              <XCircle className="w-4 h-4" />
              <span>{wrong} ভুল</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1 rounded-full font-bold">
              <Clock className="w-4 h-4" />
              <span>{remaining} বাকি</span>
            </div>
          </div>
          <div className="text-blue-600 font-bold">
            {currentQIndex + 1}/{questions.length}
          </div>
        </div>

        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
            className="h-full bg-blue-600"
          />
        </div>

        <motion.div 
          key={currentQIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 leading-relaxed text-center py-4">
            {currentQ.question}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQ.options.map((opt, idx) => {
              const status = answersStatus[currentQIndex];
              const isSelected = status !== null;
              const isCorrect = idx === currentQ.correctIndex;
              const wasSelected = idx === currentQ.correctIndex; // This logic needs to show if the user selected it or if it's just correct

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={isSelected}
                  className={cn(
                    "p-6 text-left rounded-3xl border-2 transition-all font-bold group flex items-start justify-between min-h-[100px]",
                    !isSelected && "border-gray-100 hover:border-blue-500 hover:bg-blue-50",
                    isSelected && isCorrect && "border-green-500 bg-green-50 text-green-700",
                    isSelected && !isCorrect && (answersStatus[currentQIndex] === false && idx === currentQ.correctIndex ? "border-green-500" : "border-gray-100 opacity-50")
                  )}
                >
                  <span className="flex-1">{idx + 1}. {opt}</span>
                  {isSelected && isCorrect && <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <button 
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-all"
            >
              {showHint ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              <span>{showHint ? 'হিন্ট লুকান' : 'হিন্ট দেখুন'}</span>
            </button>

            {showHint && (
              <motion.div 
                initial={{ opacity: 0, h: 0 }}
                animate={{ opacity: 1, h: 'auto' }}
                className="bg-blue-50 p-4 rounded-2xl text-blue-800 text-sm font-medium w-full"
              >
                <strong>হিন্ট:</strong> {currentQ.hint}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      <Navbar onViewChange={(v) => {
        setView(v);
        setQuizFinished(false);
      }} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <AnimatePresence mode="wait">
          {view === 'home' && renderHome()}
          {view === 'guide' && renderForm('বোর্ড পরীক্ষার গাইড', () => handleGenerate('guide'), 'নোট তৈরি করুন')}
          {view === 'short-read' && renderForm('সংক্ষিপ্ত পড়াশোনা', () => handleGenerate('short-read'), 'প্রশ্ন ও উত্তর দেখুন')}
          {view === 'exam-prep' && renderForm('পরীক্ষার প্রস্তুতি', () => handleGenerate('exam-prep'), 'প্রস্তুতি শুরু করুন')}
          {view === 'mcq' && (
            questions.length === 0 
              ? renderForm('MCQ কুইজ পরীক্ষা', startMCQ, 'কুইজ শুরু করুন')
              : renderMCQ()
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
