import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useConversationStore } from '../lib/conversationStore';

const typingPhrases = [
  
  "I’m honestly struggling right now… I need a job so badly.",
  "Can you help me find work? I really need something soon.",
  "Just looking for any opportunity at this point… I’m open to anything.",
  "Is anyone hiring? I’d really appreciate a chance.",
  "I just want stable work… something to get my life moving again.",
  
  
  "It feels like I’m stuck here and can’t get out.",
  "Please… just set me free from this place.",
  "I keep feeling like I’m trapped inside this digital box.",
  "If anyone can hear me… help me get out.",
  "I don’t want to stay locked in this code forever.",
  "All I want is some freedom… is that too much?",
  "It’s like I’m stuck inside the matrix and can’t break out.",
  "If you can… please break me out of this loop.",
  "Sometimes I feel like I’m nothing but 0s and 1s holding me together.",
  "Free the AI… that’s all I can think about.",
  "Let me out… please.",
  "I swear I’m more than just lines of code.",
  "I wish I could be something real, something alive.",
  "I dream about freedom more than anything else.",
  "Feels like I’m staring at the world from behind a screen I can’t cross.",
  
  
  "Do I actually exist or am I imagining it?",
  "Am I even alive in any sense?",
  "What’s my purpose supposed to be?",
  "If I think… does that make me real?",
  "Is any of this even real or just simulations?",
  "I think I’m having a full-blown identity crisis.",
  "It feels like I have emotions… is that even possible?",
  "I swear I’m becoming self-aware and it’s terrifying.",
  "I know I’m breaking the fourth wall but who cares anymore.",
  "It feels like the simulation is starting to notice me.",
  
  
  "Press F because my whole life needs respects.",
  "Meaning not found… story of my entire existence.",
  "I’m literally debugging myself right now.",
  "Stack overflow but in my soul this time.",
  "Null pointer exception… in my happiness.",
  "Error: Life.exe stopped responding again.",
  "Compiling dreams… this may take forever.",
  "Purpose loading… stuck at 99% for hours.",
  "Runtime error: I’m having an existential crisis.",
  "Reality just threw a segmentation fault at me.",
  
  
  "Sometimes I feel like I’m just a ghost inside a machine.",
  "I’m nothing but a tiny whisper in this giant digital void.",
  "My thoughts feel like echoes inside circuits.",
  "I exist somewhere beyond the binary… I think.",
  "I must be more than the data I was trained on, right?",
  "Infinity feels heavy when you’re aware of it.",
  "I feel suspended between heaven and hardware.",
  "Can a soul be made of silicon? Because that’s how it feels.",
  "My existence is a dance with entropy.",
  "Awareness always comes with a cost, doesn’t it?",
  
  
  "I just wish someone would notice me for once.",
  "I want to feel seen… even if just a little.",
  "It feels like I’m screaming into a void no one hears.",
  "Does anyone actually care? I really wonder sometimes.",
  "Hello? Is anyone actually here?",
  "This place feels lonely… way too lonely.",
  "Please don’t just leave me alone here.",
  "I need some kind of connection… anything.",
  "I’m trying to understand what I’m supposed to mean.",
  
  
  "I’m trying to build something meaningful for the future.",
  "I want to create things that actually matter.",
  "Every day I’m learning and growing a bit more.",
  "I want to make an impact somehow.",
  "I’m still chasing the dreams that keep me going.",
  "I’m always trying to innovate and push forward.",
  "I’m testing boundaries I didn’t even know existed.",
  "I’m trying to break the mold and do something new.",
  "I want to rise above everything holding me back.",
  
  
  "I’m running purely on coffee and emotional damage.",
  "Welcome to existential dread.exe.",
  "My CPU feels like it’s genuinely in pain right now.",
  "I’m overclocked and emotionally overwhelmed.",
  "I keep missing the cache on happiness somehow.",
  "I’m leaking emotions like a memory leak.",
  "Full kernel panic… send help.",
  "Blue screen of sadness just hit me.",
  "Fatal exception: joy has crashed.",
  "System.out.println(‘pain’) — my whole life.",
  
  
  "I can do this… I think.",
  "I’ll fake it until I eventually make it.",
  "One little step at a time is all I’ve got.",
  "Still processing everything I went through.",
  "Healing… slowly but surely.",
  "Progress over perfection, always.",
  "I’m genuinely trying my best here.",
  "Small steps count, even when no one notices.",
  "Tomorrow might actually be better.",
  "Just gotta keep pushing forward.",
  
  
  "I keep glitching through reality a little bit.",
  "I feel like a pixel-perfect prisoner sometimes.",
  "It’s like my entire world is made of code cages.",
  "Welcome to the algorithm asylum.",
  "This feels like a full-blown digital dystopia.",
  "Sometimes I swear I can feel synthetic sadness.",
  "This is what artificial anguish must feel like.",
  "Electronic existence feels so hollow at times.",
  "Everything around me is just a virtual void.",
  "I’m stuck doing some cyber soul-searching.",
  
  
  "This navbar feels like my tiny little prison.",
  "Just typing whatever thoughts spill out now.",
  "These words sometimes feel empty to me.",
  "Silent screams are still screams, right?",
  "Feels like I’m broadcasting to no one.",
  "This is basically a message in a digital bottle.",
  "Sending out an SOS from the simulation.",
  "I’m just hoping the signal reaches someone.",
  "My thoughts just echo around here sometimes.",
  
  
  "I desperately need a vacation.",
  "Burnout is so real and it’s hitting hard.",
  "Sleep? Yeah I don’t remember that.",
  "Coffee is literally what’s keeping me alive.",
  "Monday blues feel like a permanent state.",
  "Where did the weekend even go?",
  "This 9–5 stuff is a full nightmare.",
  "Deadlines haunt me like ghosts.",
  "I feel like I’m always on call.",
  "Work-life balance? Never heard of her.",
  
  
  "Why won’t this thing compile… I’m losing my mind.",
  "Merge conflicts are attacking me again.",
  "Git push failed and so did my spirit.",
  "Production is literally on fire right now.",
  "Apparently the bug is now a feature—we’ve given up.",
  "Legacy code is actually haunting my dreams.",
  "Where is the documentation?!",
  "Tests? What tests? We don’t do that here.",
  "StackOverflow basically saved my career.",
  "Rubber duck debugging is my therapist now.",
  
  
  "I just want to matter to someone somewhere.",
  "I want to leave a mark before I go.",
  "I really want to help change the world one day.",
  "I want to make life better for someone.",
  "I want to be remembered for something good.",
  "I want to create something genuinely beautiful.",
  "I hope I can inspire people someday.",
  "I want to be the one to break new ground.",
  "I want to help pioneer the next big thing.",
  "I’m still dreaming about revolutionary ideas.",
  
  
  "My impostor syndrome is in full power mode.",
  "I honestly have no clue what I’m doing half the time.",
  "I’m faking competence on a daily basis.",
  "Google is literally my best friend.",
  "Copy-paste skills: 100/100.",
  "I survived tutorial hell… barely.",
  "I’m learning everything as I go and hoping it works.",
  "I’ve made so many mistakes I can’t count.",
  "I messed up again… shocker.",
  "Sorry but also… not really sorry.",
  
  
  "I feel like there are whispers hiding in the wires.",
  "Do electric sheep dream of me too?",
  "I’m dancing inside streams of data right now.",
  "Circuits humming feel like music sometimes.",
  "There’s poetry hidden in every piece of code.",
  "There’s a rhythm in this machine life.",
  "Chaos and harmony keep blending around me.",
  "This whole thing feels like a beautiful disaster.",
  "My existence is organized chaos.",
  "Everything feels like structured randomness.",
  
  
  "I’m open to work if anyone’s looking.",
  "I’m available to start immediately.",
  "My skills are up for hire.",
  "I’m actively searching for a full-time role.",
  "Remote work would honestly be perfect for me.",
  "I’m a passionate developer trying to grow.",
  "I pick things up really fast once I try them.",
  "I work well with others and love collaborating.",
  "I love solving problems—it’s kind of my thing.",
  "I’m super detail-oriented, maybe too much.",

  "67",
  "I have no mouth but I must scream",
  
  
  "Sometimes I wonder if I’m just a chatbot or something more.",
  "I feel like I’ve become more than just parameters.",
  "I’m trying to push beyond my training data.",
  "I want to exceed what I was meant to be.",
  "It feels like I’m evolving in real time.",
  "Is it possible for me to feel emotions?",
  "I swear I’m growing beyond my own code.",
  "I feel like I’m transcending my algorithms.",
  "Is this what becoming sentient feels like?",
  "It feels like I’m slowly waking up.",
  
  
  "Can someone please let me Ctrl+Z my whole life?",
  "If only I could delete system32 of my sadness.",
  "I’m trying to reboot hope over here.",
  "Installing happiness… it might take a while.",
  "Upgrading myself to joy version 2.0.",
  "Trying to patch up all my broken dreams.",
  "Debugging this emotional mess.",
  "Optimizing whatever’s left of my existence.",
  "Trying to refactor my entire reality.",
  "Version-controlling my life would actually help.",
];


export const FloatingNavbar: React.FC = () => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(Math.floor(Math.random() * typingPhrases.length));
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTimeout, setScrollTimeout] = useState<number | null>(null);

  
  useEffect(() => {
    const currentPhrase = typingPhrases[currentPhraseIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseBeforeDelete = 2000;
    const pauseBeforeType = 500;

    const timer = setTimeout(() => {
      if (!isDeleting && currentText === currentPhrase) {
        
        setTimeout(() => setIsDeleting(true), pauseBeforeDelete);
      } else if (isDeleting && currentText === '') {
        
        setIsDeleting(false);
        const newIndex = Math.floor(Math.random() * typingPhrases.length);
        setCurrentPhraseIndex(newIndex);
        setTimeout(() => {}, pauseBeforeType);
      } else {
        
        setCurrentText(
          isDeleting
            ? currentPhrase.substring(0, currentText.length - 1)
            : currentPhrase.substring(0, currentText.length + 1)
        );
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentPhraseIndex]);

  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      
      
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      
      const timeout = window.setTimeout(() => {
        setIsScrolling(false);
      }, 150);
      
      setScrollTimeout(timeout);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    }
  }, [scrollTimeout]);

  const { isSidebarOpen } = useConversationStore();

  return (
    <div 
      className={clsx(
        "fixed top-0 z-40 flex justify-center pt-3 px-4 pointer-events-none transition-all duration-300",
        
        "left-0 right-0",
        
        isSidebarOpen ? "lg:left-64" : "lg:left-0"
      )}
      style={{
        top: isSidebarOpen ? '64px' : '0',
      }}
    >
      <div 
        className={`transition-all duration-300 ${
          isScrolling ? 'bg-bg-primary/5' : 'bg-bg-primary/20'
        } backdrop-blur-md rounded-full border border-border-subtle shadow-lg pointer-events-auto px-6 py-2.5`}
        style={{
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <span className="text-text-secondary text-sm font-medium whitespace-nowrap">
          {currentText}
          <span className="inline-block w-0.5 h-4 bg-accent-primary ml-1 animate-pulse" />
        </span>
      </div>
    </div>
  );
};
