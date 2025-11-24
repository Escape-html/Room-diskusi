import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  collection, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  Users, 
  Timer, 
  Send, 
  MessageSquare, 
  Play, 
  Square, 
  Trash2, 
  UserCircle,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// --- Firebase Initialization ---
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBD6MpnST2FjXolOO-HeSuaORqaT4_TuXw",
    authDomain: "api-key-3e85e.firebaseapp.com",
    projectId: "api-key-3e85e",
    storageBucket: "api-key-3e85e.firebasestorage.app",
    messagingSenderId: "742090936684",
    appId: "1:742090936684:web:9c5023de1bf7f62c9da349",
    measurementId: "G-5L2JYTLPGL"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>

// --- Constants ---
// PERBAIKAN: Menambahkan ID dokumen spesifik ('main') agar jalur menjadi GENAP (6 segmen)
// Path: artifacts/{appId}/public/data/{SESSION_COLL}/{SESSION_DOC}
const SESSION_COLL = 'session_control'; 
const SESSION_DOC = 'main'; 

const RESPONSES_COLL = 'responses'; 

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // { name, role }
  const [loading, setLoading] = useState(true);

  // Auth Initialization
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      const savedData = localStorage.getItem('forum_user_data');
      if (savedData) {
        setUserData(JSON.parse(savedData));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = (name, role) => {
    const data = { name, role, id: user.uid };
    setUserData(data);
    localStorage.setItem('forum_user_data', JSON.stringify(data));
  };

  const handleLogout = () => {
    setUserData(null);
    localStorage.removeItem('forum_user_data');
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Memuat Sistem...</div>;

  if (!userData) {
    return <LoginScreen onJoin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-blue-500 selection:text-white">
      <Navbar user={userData} onLogout={handleLogout} />
      <main className="container mx-auto p-4 max-w-4xl">
        {userData.role === 'admin' ? (
          <AdminView user={userData} />
        ) : (
          <ParticipantView user={userData} />
        )}
      </main>
    </div>
  );
}

// --- Components ---

function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-gray-800 border-b border-gray-700 p-4 shadow-lg sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center max-w-4xl">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-blue-400 w-6 h-6" />
          <h1 className="font-bold text-xl tracking-tight hidden sm:block">Forum Kilat</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-full border border-gray-600">
            <UserCircle size={16} className={user.role === 'admin' ? "text-yellow-400" : "text-green-400"} />
            <span className="font-medium truncate max-w-[100px]">{user.name}</span>
            <span className="text-xs text-gray-400 uppercase border-l border-gray-600 pl-2 ml-1">
              {user.role}
            </span>
          </div>
          <button 
            onClick={onLogout}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Keluar
          </button>
        </div>
      </div>
    </nav>
  );
}

function LoginScreen({ onJoin }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('participant');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onJoin(name, role);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          <div className="bg-blue-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="text-blue-400 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Selamat Datang</h2>
          <p className="text-gray-400 text-sm mt-2">Masuk ke ruang diskusi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nama Anda</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder-gray-500"
              placeholder="Contoh: Budi Santoso"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Peran</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('participant')}
                className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${role === 'participant' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'}`}
              >
                <Users size={20} />
                <span className="text-sm font-medium">Peserta</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${role === 'admin' ? 'bg-yellow-600/20 border-yellow-500 text-yellow-400' : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'}`}
              >
                <UserCircle size={20} />
                <span className="text-sm font-medium">Admin</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
          >
            Masuk Ruangan
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Admin View ---
function AdminView({ user }) {
  const [question, setQuestion] = useState('');
  const [duration, setDuration] = useState(60); 
  const [sessionState, setSessionState] = useState(null);
  const [responses, setResponses] = useState([]);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  // Listen to Session State (FIXED PATH)
  useEffect(() => {
    // Jalur sekarang genap: artifacts -> appId -> public -> data -> SESSION_COLL -> SESSION_DOC
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', SESSION_COLL, SESSION_DOC);
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSessionState(docSnap.data());
      } else {
        setSessionState({ status: 'idle' });
      }
    });
    return () => unsub();
  }, []);

  // Listen to Responses
  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'public', 'data', RESPONSES_COLL);
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => b.timestamp - a.timestamp);
      setResponses(data);
    });
    return () => unsub();
  }, []);

  const startSession = async () => {
    if (!question.trim()) return;
    setIsLoadingAction(true);
    const endTime = Date.now() + (duration * 1000);
    
    try {
      // Clear previous responses
      const batchPromises = responses.map(r => 
        deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', RESPONSES_COLL, r.id))
      );
      await Promise.all(batchPromises);

      // Set new session (FIXED PATH)
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', SESSION_COLL, SESSION_DOC), {
        question,
        duration,
        endTime,
        startTime: Date.now(),
        status: 'active',
        sessionId: Date.now().toString()
      });
    } catch (e) {
      console.error("Error starting session", e);
    }
    setIsLoadingAction(false);
  };

  const stopSession = async () => {
    setIsLoadingAction(true);
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', SESSION_COLL, SESSION_DOC), {
        ...sessionState,
        status: 'stopped',
        endTime: Date.now()
      });
    } catch(e) { console.error(e); }
    setIsLoadingAction(false);
  };

  const resetSession = async () => {
    setIsLoadingAction(true);
    try {
      setQuestion('');
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', SESSION_COLL, SESSION_DOC), {
        status: 'waiting',
        question: '',
        endTime: 0
      });
    } catch(e) { console.error(e); }
    setIsLoadingAction(false);
  };

  const isSessionActive = sessionState?.status === 'active';

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-5 space-y-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Timer className="text-blue-400" />
            Kontrol Sesi
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Pertanyaan Diskusi</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={isSessionActive}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 resize-none h-24"
                placeholder="Tulis pertanyaan untuk peserta..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Durasi Jawaban (Detik)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="10"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  disabled={isSessionActive}
                  className="flex-1 accent-blue-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="bg-gray-700 px-3 py-1 rounded text-sm font-mono text-blue-300 w-16 text-center">
                  {duration}s
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {!isSessionActive ? (
                <button
                  onClick={startSession}
                  disabled={isLoadingAction || !question.trim()}
                  className="col-span-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Play size={18} fill="currentColor" />
                  Mulai Sesi
                </button>
              ) : (
                <button
                  onClick={stopSession}
                  disabled={isLoadingAction}
                  className="col-span-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 animate-pulse"
                >
                  <Square size={18} fill="currentColor" />
                  Hentikan Sesi
                </button>
              )}
              
              {!isSessionActive && sessionState?.status !== 'waiting' && sessionState?.status !== 'idle' && (
                 <button
                 onClick={resetSession}
                 disabled={isLoadingAction}
                 className="col-span-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2 rounded-lg flex items-center justify-center gap-2"
               >
                 <Trash2 size={16} />
                 Reset Papan
               </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
           <div className="flex justify-between items-center mb-2">
             <span className="text-gray-400 text-sm">Total Respon</span>
             <span className="text-2xl font-bold text-white">{responses.length}</span>
           </div>
           {isSessionActive && <CountdownTarget endTime={sessionState?.endTime} />}
        </div>
      </div>

      <div className="md:col-span-7">
        <div className="bg-gray-800 rounded-xl border border-gray-700 h-[calc(100vh-140px)] flex flex-col">
          <div className="p-4 border-b border-gray-700 bg-gray-800/50 rounded-t-xl">
            <h3 className="font-bold text-white flex items-center gap-2">
              <MessageSquare className="text-green-400" size={18} />
              Tanggapan Masuk
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {responses.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                <MessageSquare size={48} className="mb-2" />
                <p>Belum ada tanggapan</p>
              </div>
            ) : (
              responses.map((res) => (
                <div key={res.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-blue-300 text-sm">{res.userName}</span>
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(res.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-gray-200 leading-relaxed text-sm whitespace-pre-wrap">{res.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Participant View ---
function ParticipantView({ user }) {
  const [sessionState, setSessionState] = useState({ status: 'waiting', question: '' });
  const [response, setResponse] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [responsesList, setResponsesList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Listen to Session (FIXED PATH)
  useEffect(() => {
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', SESSION_COLL, SESSION_DOC);
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSessionState(data);
        
        const localSessionId = localStorage.getItem('last_session_id');
        if (localSessionId !== data.sessionId) {
          setHasAnswered(false);
          setResponse('');
          if(data.sessionId) localStorage.setItem('last_session_id', data.sessionId);
        }
      }
    });
    return () => unsub();
  }, []);

  // Listen to Responses
  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'public', 'data', RESPONSES_COLL);
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => d.data());
      data.sort((a, b) => b.timestamp - a.timestamp);
      setResponsesList(data);
    });
    return () => unsub();
  }, []);

  const submitResponse = async (e) => {
    e.preventDefault();
    if (!response.trim() || hasAnswered) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', RESPONSES_COLL), {
        userId: user.id,
        userName: user.name,
        text: response,
        timestamp: Date.now(),
        sessionId: sessionState.sessionId
      });
      setHasAnswered(true);
      setResponse('');
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const isTimeUp = sessionState.status === 'stopped' || (sessionState.endTime && Date.now() > sessionState.endTime);
  const canAnswer = sessionState.status === 'active' && !hasAnswered && !isTimeUp;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-xl relative overflow-hidden">
        {sessionState.status === 'active' && (
           <div className="absolute top-0 right-0 p-4">
             <div className="animate-pulse flex items-center gap-2 text-red-400 font-bold bg-red-900/20 px-3 py-1 rounded-full border border-red-900/50">
                <Clock size={16} />
                <CountdownDisplay endTime={sessionState.endTime} onEnd={() => {}} />
             </div>
           </div>
        )}
        
        <div className="mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${sessionState.status === 'active' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-gray-700 text-gray-400'}`}>
            {sessionState.status === 'active' ? 'Diskusi Aktif' : sessionState.status === 'waiting' ? 'Menunggu Admin' : 'Sesi Berakhir'}
          </span>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-white mt-4 mb-2 leading-relaxed">
          {sessionState.question || "Menunggu pertanyaan dari Admin..."}
        </h2>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
        {hasAnswered ? (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="text-green-500 w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Jawaban Terkirim!</h3>
            <p className="text-gray-400 text-sm max-w-xs mt-2">Terima kasih atas partisipasi Anda. Silakan simak jawaban peserta lain di bawah.</p>
          </div>
        ) : !canAnswer && sessionState.status === 'active' ? (
             <div className="text-center py-8 text-red-400">
                <AlertCircle className="mx-auto mb-2 w-8 h-8" />
                <p>Waktu Habis!</p>
             </div>
        ) : (
          <form onSubmit={submitResponse} className="relative">
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              disabled={!canAnswer || isSubmitting}
              className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 min-h-[120px]"
              placeholder={sessionState.status ===
