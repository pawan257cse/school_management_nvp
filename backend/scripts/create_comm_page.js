const fs = require('fs');

const commHubContent = import React, { useState } from 'react';
import { 
  MessageSquare, Send, PhoneCall, Bell, Calendar, Award, 
  Sparkles, CheckCircle2, Clock, ShieldCheck, Zap, AlertCircle, FileText
} from 'lucide-react';

export default function CommunicationHub({ initialTab = 'whatsapp' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [messageText, setMessageText] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('all');
  const [bellSchedule] = useState([
    { period: 'Morning Assembly', time: '07:45 AM', type: 'Long Ring', active: true },
    { period: 'Period 1', time: '08:00 AM', type: 'Single Ring', active: true },
    { period: 'Period 2', time: '08:40 AM', type: 'Single Ring', active: true },
    { period: 'Period 3', time: '09:10 AM', type: 'Single Ring', active: true },
    { period: 'Period 4', time: '09:45 AM', type: 'Single Ring', active: true },
    { period: 'Lunch Break', time: '10:20 AM', type: 'Double Ring', active: true },
    { period: 'Period 5', time: '10:40 AM', type: 'Single Ring', active: true },
    { period: 'Period 6', time: '11:20 AM', type: 'Single Ring', active: true },
    { period: 'Period 7', time: '11:50 AM', type: 'Single Ring', active: true },
    { period: 'Period 8', time: '12:25 PM', type: 'Single Ring', active: true },
    { period: 'School Over', time: '01:00 PM', type: 'Long Ring', active: true }
  ]);

  const tabs = [
    { id: 'whatsapp', name: 'WhatsApp Broadcast', icon: MessageSquare },
    { id: 'sms', name: 'SMS Portal', icon: Send },
    { id: 'voice', name: 'Voice Calls (IVR)', icon: PhoneCall },
    { id: 'bell', name: 'Digital Bell', icon: Bell },
    { id: 'calendar', name: 'Holiday Calendar', icon: Calendar },
    { id: 'certificates', name: 'Certificates Generator', icon: Award }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> NVP Smart Communication Suite
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
              Communication & Broadcast Portal
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Send instant WhatsApp broadcasts, SMS alerts, automated digital bells, holiday schedules, and student certificates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              API Gateway Active
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={\lex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all \\}
            >
              <Icon className={\w-4 h-4 \\} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        {activeTab === 'whatsapp' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" /> WhatsApp Business Broadcast
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Send official notices, fee reminders & announcements directly to parents' WhatsApp.</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                Official API Connected
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Target Recipients</label>
                  <select 
                    value={selectedAudience} 
                    onChange={(e) => setSelectedAudience(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="all">All Students & Parents (93 Active)</option>
                    <option value="staff">All Staff & Teachers (10 Active)</option>
                    <option value="class_pg">Class PG Only</option>
                    <option value="class_lkg">Class LKG Only</option>
                    <option value="class_ukg">Class UKG Only</option>
                    <option value="class_1">Class 1 Only</option>
                    <option value="class_2">Class 2 Only</option>
                    <option value="class_3">Class 3 Only</option>
                    <option value="class_4">Class 4 Only</option>
                    <option value="class_5">Class 5 Only</option>
                    <option value="class_6">Class 6 Only</option>
                    <option value="class_7">Class 7 Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Message Content</label>
                  <textarea
                    rows={5}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Dear Parent, NVP English Medium School Nimbi Jodhan announces..."
                    className="w-full p-4 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400 font-medium">Instant WhatsApp Dispatch via High-Priority Queue</span>
                  <button 
                    onClick={() => {
                      if (!messageText.trim()) return alert('Please enter message text');
                      alert('WhatsApp broadcast queued successfully to ' + selectedAudience);
                      setMessageText('');
                    }}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
                  >
                    <Send className="w-4 h-4" /> Send WhatsApp Broadcast
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 text-slate-200 rounded-3xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-black text-xs">
                    NVP
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">NVP School WhatsApp</h4>
                    <p className="text-[10px] text-emerald-400 font-semibold">Official Broadcast Channel</p>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 text-xs space-y-2">
                  <p className="font-bold text-white text-[11px]">📢 NVP School Official Update</p>
                  <p className="text-slate-300 text-[11px] whitespace-pre-wrap">
                    {messageText || 'Your announcement text preview will appear here in real-time.'}
                  </p>
                  <div className="text-[9px] text-slate-400 text-right font-medium">Just Now ✓✓</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sms' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-indigo-600" /> DLT Registered SMS Gateway
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">High-speed transactional SMS for emergency alerts, fee dues & exam results.</p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full border border-indigo-200">
                DLT ID: 17071682991002
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3">
                <Zap className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-indigo-950">Instant Delivery Speed</h4>
                  <p className="text-[11px] text-indigo-700 mt-0.5">Messages reach parents within 3 seconds across all TRAI telecom operators.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">Approved Header ID: NVPSCH</h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Official SMS header verified for NVP English Medium School Nimbi Jodhan.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-blue-600" /> Automated Voice Call Broadcast (IVR)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Pre-recorded voice messages automatically dialed to parent phones for urgent notices.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <PhoneCall className="w-10 h-10 text-blue-600 mx-auto opacity-80" />
              <h4 className="text-sm font-bold text-slate-800">Voice Broadcast Gateway Ready</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Record your voice notice or type text for automated Text-to-Speech conversion in Hindi/English.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'bell' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-600" /> Smart Digital School Bell
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Automatic schedule for school period bells, morning assembly & lunch breaks.</p>
              </div>
              <button 
                onClick={() => alert('Manual Emergency Bell Triggered')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-bold shadow-sm flex items-center gap-2"
              >
                <Bell className="w-4 h-4" /> Ring Bell Now
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {bellSchedule.map((b, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between bg-white hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs border border-amber-200/60">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{b.period}</h4>
                      <p className="text-[11px] text-slate-500">{b.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-slate-100 rounded-xl text-xs font-black text-slate-700">
                      {b.time}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" /> Official NVP Holiday Calendar (2026-2027)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Approved list of festive holidays, seasonal breaks & school vacations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Diwali & Festival Vacation', date: 'Oct 24 - Nov 02, 2026', days: '10 Days' },
                { title: 'Winter Break', date: 'Dec 25 - Jan 01, 2027', days: '8 Days' },
                { title: 'Holi Celebration', date: 'Mar 24 - Mar 25, 2027', days: '2 Days' },
                { title: 'Annual Exam Break', date: 'Apr 01 - Apr 10, 2027', days: '10 Days' }
              ].map((h, i) => (
                <div key={i} className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-purple-950">{h.title}</h4>
                    <p className="text-[11px] text-purple-700 font-medium mt-0.5">{h.date}</p>
                  </div>
                  <span className="px-3 py-1 bg-purple-200/60 text-purple-900 font-black text-[11px] rounded-xl">
                    {h.days}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-rose-600" /> Official Certificate Generator
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Generate Bonafide Certificates, Transfer Certificates (TC) & Character Certificates.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Transfer Certificate (TC)', desc: 'Official student school leaving document' },
                { title: 'Bonafide Certificate', desc: 'Proof of study for scholarship & Aadhaar' },
                { title: 'Character Certificate', desc: 'Official conduct & performance certificate' }
              ].map((c, i) => (
                <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-rose-300 hover:shadow-md transition-all space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/60">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{c.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{c.desc}</p>
                  </div>
                  <button 
                    onClick={() => alert('Generating ' + c.title)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Generate Certificate
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
;

fs.writeFileSync('E:/NVP/SCHOOL/question_paper_web/frontend/src/pages/head/CommunicationHub.jsx', commHubContent);
console.log('CommunicationHub.jsx written successfully!');