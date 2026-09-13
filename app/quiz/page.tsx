'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Timer, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  ShieldAlert, 
  HelpCircle, 
  X,
  Sparkles,
  Zap,
  Play,
  Mail,
  Phone,
  UserCheck,
  Search,
  Lock
} from 'lucide-react';
import { ClientQuestion, QuizConfig, Student } from '@/lib/types';

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [identifier, setIdentifier] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<ClientQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alreadySubmittedId, setAlreadySubmittedId] = useState<string | null>(null);

  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  
  // Timer state (seconds left)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(600);
  const [startTimeIso, setStartTimeIso] = useState<string>('');
  
  // Submit modal & submission state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load basic config on page mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/quiz');
        const data = await res.json();
        if (data.config) setConfig(data.config);
        if (data.questions) setQuestions(data.questions);

        // Check if student identity saved in localStorage
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('xts_student');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed.email || parsed.phone) {
                setIdentifier(parsed.email || parsed.phone);
              }
            } catch (e) {}
          }
        }
      } catch (err: any) {
        console.error('Error fetching quiz config:', err);
      }
    }
    loadConfig();
  }, []);

  // Handle Candidate Verification (Stage 1)
  const handleVerifyCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStudent(null);
    setAlreadySubmittedId(null);

    if (!identifier.trim()) {
      setError('Please enter your registered Email address or Phone number.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, action: 'verify' })
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.isSubmitted && data.studentId) {
          setAlreadySubmittedId(data.studentId);
          setStudent(data.student || null);
          setError('You have already completed and submitted your quiz attempt.');
          return;
        }
        throw new Error(data.error || 'Verification failed');
      }

      setStudent(data.student);
      if (data.config) setConfig(data.config);

      // Store student details in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('xts_student', JSON.stringify(data.student));
      }

    } catch (err: any) {
      setError(err.message || 'Candidate not found in registered dataset.');
    } finally {
      setLoading(false);
    }
  };

  // Launch Quiz Attempt (Stage 2)
  const handleStartQuizSession = async () => {
    if (!student) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id, action: 'start' })
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.isSubmitted && data.studentId) {
          router.push(`/result?studentId=${encodeURIComponent(data.studentId)}`);
          return;
        }
        throw new Error(data.error || 'Failed to start quiz session');
      }

      if (data.questions) setQuestions(data.questions);
      if (data.config) setConfig(data.config);

      const initialSeconds = (data.config?.timeLimitMinutes || 10) * 60;
      setTimeLeftSeconds(initialSeconds);
      setStartTimeIso(data.startTime || new Date().toISOString());
      setQuizStarted(true);

    } catch (err: any) {
      setError(err.message || 'Failed to start quiz');
    } finally {
      setLoading(false);
    }
  };

  // Submission handler
  const executeSubmission = useCallback(async () => {
    if (!student || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          answers: selectedAnswers,
          startTime: startTimeIso || new Date().toISOString()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      // Redirect to individual result page
      router.push(`/result?studentId=${encodeURIComponent(student.id)}`);
    } catch (err: any) {
      alert(err.message || 'Error submitting quiz answers');
      setSubmitting(false);
    }
  }, [student, selectedAnswers, startTimeIso, submitting, router]);

  // Keep a ref to the latest executeSubmission so the timer never depends on it
  const executeSubmissionRef = useRef(executeSubmission);
  useEffect(() => {
    executeSubmissionRef.current = executeSubmission;
  }, [executeSubmission]);

  // Timer countdown hook
  useEffect(() => {
    if (!quizStarted || submitting) return;

    const timerInterval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          executeSubmissionRef.current(); // Auto-submit when timer expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
    // Only re-run when quiz starts or submission completes — NOT when executeSubmission changes
  }, [quizStarted, submitting]);

  const handleOptionSelect = (optionKey: 'A' | 'B' | 'C' | 'D') => {
    if (!questions[currentIdx]) return;
    const qId = questions[currentIdx].id;
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: optionKey
    }));
  };

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Pre-quiz view: Verification & Welcome Card
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-between">
        <Navbar />

        <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto w-full flex-grow flex items-center justify-center">
          <div className="w-full glass-card p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl relative">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 text-xs font-bold uppercase mb-3">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                Pre-Registered Candidate Portal
              </div>
              <h1 className="text-3xl font-black text-white">
                XTS Tech Arena — <span className="text-gradient">Quiz Entrance</span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-2">
                Enter your registered Email or Phone number added by the Admin to proceed.
              </p>
            </div>

            {/* Error / Alert banner */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Verification Alert</p>
                  <p className="mt-0.5">{error}</p>
                  {alreadySubmittedId && (
                    <button
                      onClick={() => router.push(`/result?studentId=${encodeURIComponent(alreadySubmittedId)}`)}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 flex items-center gap-1.5"
                    >
                      <span>View Your Completed Result</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Stage 1: Identification Input Form */}
            {!student ? (
              <form onSubmit={handleVerifyCandidate} className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Registered Email or Phone Number
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. sourav@example.com or 9876543210"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-xl font-bold text-base text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 shadow-xl shadow-purple-900/40 hover:shadow-cyan-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-5 h-5" />
                  <span>{loading ? 'Verifying Candidate...' : 'Verify Eligibility'}</span>
                </button>
              </form>
            ) : (
              /* Stage 2: Personalized Welcome Card */
              <div className="space-y-6">
                
                <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-cyan-950/70 border border-purple-800/60 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-700/60 flex items-center justify-center mx-auto">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Candidate Verified</span>
                    <h2 className="text-2xl font-black text-white mt-1">
                      Welcome, <span className="text-gradient">{student.fullName}</span>! 🎉
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      ID: {student.studentId} • {student.email}
                    </p>
                  </div>
                </div>

                {/* Specs Box */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Questions</div>
                      <div className="font-bold text-white font-mono">{questions.length || 10} MCQs</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                    <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Time Limit</div>
                      <div className="font-bold text-white font-mono">{config?.timeLimitMinutes || 10} Minutes</div>
                    </div>
                  </div>
                </div>

                {/* Important Rules */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" /> Quiz Rules:
                  </div>
                  <ul className="space-y-1 text-slate-400 pl-4 list-disc">
                    <li>The 10-minute countdown starts immediately when you click Start Quiz Now.</li>
                    <li>Auto-submits when timer reaches 00:00.</li>
                    <li>Only one attempt allowed per pre-registered candidate.</li>
                  </ul>
                </div>

                {/* Start Quiz Button */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStudent(null)}
                    className="w-1/3 py-3.5 rounded-xl bg-slate-900 border border-slate-800 font-bold text-slate-400 text-xs hover:text-white"
                  >
                    Change ID
                  </button>

                  <button
                    type="button"
                    onClick={handleStartQuizSession}
                    disabled={loading}
                    className="w-2/3 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 shadow-xl shadow-purple-900/40 hover:shadow-cyan-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>{loading ? 'Starting...' : 'Start Quiz Now'}</span>
                  </button>
                </div>

              </div>
            )}

            <div className="pt-6 mt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
              Only candidates pre-registered by Xavier’s Tech Byte Society admin are allowed.
            </div>

          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Active Quiz Interface
  const currentQuestion = questions[currentIdx];
  const isLowTime = timeLeftSeconds <= 120; // < 2 mins
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round(((currentIdx + 1) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-between select-none">
      
      {/* Top Quiz Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          <div>
            <span className="font-extrabold text-white text-base tracking-tight hidden sm:inline">
              XTS <span className="text-gradient">TECH ARENA</span>
            </span>
            <p className="text-xs text-slate-400 font-mono">
              Candidate: <span className="text-slate-200 font-bold">{student?.fullName}</span>
            </p>
          </div>

          {/* Timer Display */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold transition-all ${
            isLowTime 
              ? 'bg-red-950/90 border-red-500/80 text-red-300 animate-pulse glow-purple' 
              : 'bg-slate-900 border-slate-700 text-cyan-300'
          }`}>
            <Timer className={`w-4 h-4 ${isLowTime ? 'text-red-400' : 'text-cyan-400'}`} />
            <span className="text-lg tracking-wider">{formatTime(timeLeftSeconds)}</span>
          </div>

          {/* Quick Submit button in Header */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white text-xs tracking-wider uppercase transition-colors shadow-md shadow-purple-950"
          >
            Submit Quiz
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 h-1.5 mt-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Low Time Alert Banner */}
      {isLowTime && (
        <div className="bg-red-950/90 border-b border-red-800 text-red-200 px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span>Warning: Time limit expiring soon! Quiz will automatically submit at 00:00.</span>
        </div>
      )}

      {/* Main Workspace */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full flex-grow">
        
        {/* Question Header & Grid Palette */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <h2 className="text-xs text-slate-400 font-mono mt-0.5">
              Answered: {answeredCount} / {questions.length}
            </h2>
          </div>

          {/* Question Grid palette */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {questions.map((q, idx) => {
              const isAnswered = !!selectedAnswers[q.id];
              const isCurrent = idx === currentIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all ${
                    isCurrent
                      ? 'bg-purple-600 text-white ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-950'
                      : isAnswered
                      ? 'bg-emerald-950 border border-emerald-700/80 text-emerald-300'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl mb-8 space-y-6">
            
            {currentQuestion.title && (
              <h2 className="text-xl sm:text-2xl font-black text-purple-400">
                {currentQuestion.title}
              </h2>
            )}

            {currentQuestion.story && (
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                {currentQuestion.story}
              </div>
            )}

            <h3 className="text-lg font-extrabold text-white leading-relaxed">
              {currentQuestion.question}
            </h3>

            {/* Multiple Choice Options */}
            <div className="space-y-3">
              {(['A', 'B', 'C', 'D'] as const).map(optionKey => {
                const optionText = currentQuestion.options[optionKey];
                const isSelected = selectedAnswers[currentQuestion.id] === optionKey;

                return (
                  <button
                    key={optionKey}
                    onClick={() => handleOptionSelect(optionKey)}
                    className={`w-full text-left p-4 rounded-2xl border text-sm font-medium transition-all flex items-start justify-between gap-4 group ${
                      isSelected
                        ? 'bg-purple-950/80 border-purple-500 text-white ring-1 ring-purple-500/50 shadow-lg shadow-purple-950/50'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 ${
                        isSelected ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                      }`}>
                        {optionKey}
                      </span>
                      <span className="leading-relaxed whitespace-pre-wrap">{optionText}</span>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-purple-400 bg-purple-500' : 'border-slate-700'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentIdx < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-bold text-white text-sm hover:opacity-90 flex items-center gap-2"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 font-bold text-white text-sm hover:scale-[1.02] shadow-lg shadow-purple-950 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Quiz</span>
            </button>
          )}
        </div>

      </main>

      {/* Confirmation Dialog Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative space-y-6">
            
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-950 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-black text-white">Submit Quiz?</h3>
              <p className="text-slate-300 text-sm">
                You won't be able to change your answers after submission.
              </p>
              <div className="p-3 rounded-xl bg-slate-900 text-xs font-mono text-slate-400">
                Answered: <span className="text-white font-bold">{answeredCount}</span> of <span className="text-white font-bold">{questions.length}</span> questions
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
                className="py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 font-bold text-slate-300 text-sm hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={executeSubmission}
                disabled={submitting}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 font-bold text-white text-sm hover:scale-[1.02] shadow-lg shadow-purple-950 disabled:opacity-50"
              >
                {submitting ? 'Evaluating...' : 'Submit Quiz'}
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060913] text-slate-300 flex items-center justify-center">Loading quiz environment...</div>}>
      <QuizContent />
    </Suspense>
  );
}
