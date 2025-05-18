'use client';

import {useState, useEffect} from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {suggestAgeAppropriateTasks} from '@/ai/flows/suggest-age-appropriate-tasks';
import {personalizeTaskInstructions} from '@/ai/flows/personalize-task-instructions';
import {Progress} from '@/components/ui/progress';
import {Label} from '@/components/ui/label';
// import { Checkbox } from "@/components/ui/checkbox"; // No longer used directly
import { CheckCircle, Circle, AlertTriangle, Loader2, LogOut, Share2, Moon, Sun } from 'lucide-react'; 
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // DialogTrigger removed as open is controlled by state
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {generateMagicalPersonality} from '@/ai/flows/generate-magical-personality';
import Image from 'next/image';
import { useAuth } from '@/components/auth/auth-provider'; // Import useAuth
import { useRouter } from 'next/navigation'; // Import useRouter for redirection
import { TaskMap, defaultPathPoints } from '@/components/TaskMap';


// Define the structure for each instruction step
interface InstructionStep {
  id: number;
  instruction: string;
  encouragement: string;
  completed: boolean;
}

// Define the structure for a daily task
interface DailyTask {
  date: string; // Date in format YYYY-MM-DD
  tasks: {
    task: string; // Unique identifier for the task, e.g., the original description
    steps: InstructionStep[];
  }[];
}

// Define the structure for a magical personality
interface MagicalPersonality {
  name: string;
  description: string;
  imagePrompt: string;
  imageUrl: string | null;
  date?: string; // Add date to personality to ensure it's for today
}

export default function MakeYourDayPage() {
  const { user, loading: authLoading, signOut } = useAuth(); // Add signOut to destructuring
  const router = useRouter(); // For redirection

  const [age, setAge] = useState<number | null>(null);
  const [isAgeDialogOpen, setIsAgeDialogOpen] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<string[]>([]);
  const [customTaskInput, setCustomTaskInput] = useState('');
  // const [instructions, setInstructions] = useState<InstructionStep[]>([]); // Not directly used for display anymore
  const [isLoadingInstructions, setIsLoadingInstructions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const [dailyTasks, setDailyTasks] = useState<DailyTask | null>(null);
  const [dailyTaskTarget, setDailyTaskTarget] = useState<number>(3);
  const [showTaskCountDialog, setShowTaskCountDialog] = useState<boolean>(false);
  const [taskCountInput, setTaskCountInput] = useState<string>('3');
  const [magicalPersonality, setMagicalPersonality] = useState<MagicalPersonality | null>(null);
  const [isGeneratingHeroDetails, setIsGeneratingHeroDetails] = useState<boolean>(false);
  const [isGeneratingHeroImage, setIsGeneratingHeroImage] = useState<boolean>(false);
  const [heroGenerationError, setHeroGenerationError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]); // For accordion state

  const [theme, setTheme] = useState('light');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') || 'light';
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleTaskCountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(taskCountInput, 10);
    if (count > 0 && count <= 10) { // Limit to 10 tasks max
      setDailyTaskTarget(count);
      localStorage.setItem('dailyTaskCount', count.toString());
      localStorage.setItem('dailyTaskCountLastUpdated', new Date().toISOString());
      setShowTaskCountDialog(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Check for saved task count preference
  useEffect(() => {
    const savedTaskCount = localStorage.getItem('dailyTaskCount');
    const lastUpdated = localStorage.getItem('dailyTaskCountLastUpdated');
    
    if (savedTaskCount && lastUpdated) {
      const lastUpdatedDate = new Date(lastUpdated);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastUpdatedDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        setDailyTaskTarget(parseInt(savedTaskCount, 10));
        return;
      }
    }
    
    // Show dialog if no valid preference found
    setShowTaskCountDialog(true);
  }, []);

  // Redirect if not authenticated or loading
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);


  // Load data from localStorage on component mount (if user is authenticated)
  useEffect(() => {
    if (user) { // Only load data if user is authenticated
      const storedAge = localStorage.getItem(`childAge_${user.uid}`);
      if (storedAge) {
        setAge(Number(storedAge));
      } else {
        setIsAgeDialogOpen(true);
      }

      const currentDate = getCurrentDate();
      const storedTasks = localStorage.getItem(`dailyTasks_${user.uid}`);
      if (storedTasks) {
        const parsedTasks: DailyTask = JSON.parse(storedTasks);
        if (parsedTasks && parsedTasks.date === currentDate) {
          setDailyTasks(parsedTasks);
        } else {
          const newDailyTasks = { date: currentDate, tasks: [] };
          localStorage.setItem(`dailyTasks_${user.uid}`, JSON.stringify(newDailyTasks));
          setDailyTasks(newDailyTasks);
          localStorage.removeItem(`magicalPersonality_${user.uid}`);
          setMagicalPersonality(null);
        }
      } else {
        const newDailyTasks = { date: currentDate, tasks: [] };
        localStorage.setItem(`dailyTasks_${user.uid}`, JSON.stringify(newDailyTasks));
        setDailyTasks(newDailyTasks);
        localStorage.removeItem(`magicalPersonality_${user.uid}`);
        setMagicalPersonality(null);
      }

      const storedTarget = localStorage.getItem(`dailyTaskTarget_${user.uid}`);
      if (storedTarget) {
        setDailyTaskTarget(Number(storedTarget));
      }

      const storedPersonality = localStorage.getItem(`magicalPersonality_${user.uid}`);
      if (storedPersonality) {
        const parsedPersonality: MagicalPersonality = JSON.parse(storedPersonality);
        if (parsedPersonality && parsedPersonality.date === currentDate) {
          setMagicalPersonality(parsedPersonality);
        } else {
           localStorage.removeItem(`magicalPersonality_${user.uid}`);
           setMagicalPersonality(null);
        }
      }
    }
  }, [user]); // Rerun when user object changes (e.g., after login)

  // Save age to local storage
  useEffect(() => {
    if (user && age !== null) {
      localStorage.setItem(`childAge_${user.uid}`, age.toString());
    }
  }, [age, user]);

  // Save task target to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`dailyTaskTarget_${user.uid}`, dailyTaskTarget.toString());
    }
  }, [dailyTaskTarget, user]);

  // Generate personality details when all tasks completed
  useEffect(() => {
    if (user && dailyTasks && dailyTasks.tasks.length > 0 && dailyTaskTarget > 0) {
      const completedTasksCount = dailyTasks.tasks.filter(taskItem => taskItem.steps.every(step => step.completed)).length;
      if (completedTasksCount >= dailyTaskTarget && (!magicalPersonality || magicalPersonality.date !== getCurrentDate())) {
        const completedTaskDescriptions = dailyTasks.tasks
            .filter(taskItem => taskItem.steps.every(step => step.completed))
            .map(taskItem => taskItem.task);
        if (completedTaskDescriptions.length >= dailyTaskTarget) {
             generateHeroDetails(completedTaskDescriptions);
        }
      }
    }
  }, [dailyTasks, dailyTaskTarget, magicalPersonality, user]);

  // Save daily tasks to local storage
  useEffect(() => {
    if (user && dailyTasks) {
      localStorage.setItem(`dailyTasks_${user.uid}`, JSON.stringify(dailyTasks));
    }
  }, [dailyTasks, user]);

  // Save magical personality to local storage
  useEffect(() => {
    if (user && magicalPersonality) {
      localStorage.setItem(`magicalPersonality_${user.uid}`, JSON.stringify({...magicalPersonality, date: getCurrentDate()}));
    }
  }, [magicalPersonality, user]);


  const handleAgeSubmit = () => {
    if (age === null || age <= 0) {
      alert('Please enter a valid age.');
      return;
    }
    setIsAgeDialogOpen(false);
  };

  const handleSuggestTasks = async () => {
    if (age === null || age <= 0) {
      alert('Please set your age first using the welcome popup or settings.');
      return;
    }
    setIsLoadingSuggestions(true);
    setSuggestedTasks(['Loading suggestions... ⏳']);
    try {
      const result = await suggestAgeAppropriateTasks({age: age});
      setSuggestedTasks(result.tasks.length > 0 ? result.tasks : ['No suggestions found for this age.']);
    } catch (error) {
      console.error("Error suggesting tasks:", error);
      setSuggestedTasks(['Could not fetch suggestions. Please try again.']);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handlePersonalizeInstructions = async (taskToPersonalize?: string) => {
    const taskInput = taskToPersonalize || customTaskInput;
    if (!taskInput.trim()) {
        alert('Please describe the task details or select a suggestion.');
        return;
    }
    if (age === null || age <= 0) {
      alert('Please set your age first.');
      return;
    }
    setIsLoadingInstructions(true);
    try {
      const result = await personalizeTaskInstructions({
        task: taskInput,
        childBackground: `Child is ${age} years old.`,
        requirements: '',
      });

      if (result && result.steps && result.steps.length > 0) {
        const stepsWithIds = result.steps.map((step, index) => ({
          id: index,
          instruction: step.instruction,
          encouragement: step.encouragement,
          completed: false,
        }));
        saveTaskToDailyTasks(taskInput, stepsWithIds);
        setCustomTaskInput('');
        setSuggestedTasks([]);
        // Expand the newly added task
        setTimeout(() => setExpandedItems(prev => [...prev, taskInput + (dailyTasks?.tasks.length || 0)]), 0);

      } else {
        alert("Failed to generate steps. The task might be too complex or the helper needs more details. Please try rephrasing or a different task.");
      }
    } catch (error) {
        console.error("Error personalizing instructions:", error);
        alert('Could not generate instructions. Please try again.');
    } finally {
        setIsLoadingInstructions(false);
    }
  };
  
  const handleToggleStep = (taskIdentifier: string, stepId: number) => {
    setDailyTasks(prevDailyTasks => {
      if (!prevDailyTasks) return prevDailyTasks;
      const updatedTasks = prevDailyTasks.tasks.map(taskItem => {
        if (taskItem.task === taskIdentifier) {
          const updatedSteps = taskItem.steps.map(step =>
            step.id === stepId ? { ...step, completed: !step.completed } : step
          );
          return { ...taskItem, steps: updatedSteps };
        }
        return taskItem;
      });
      return { ...prevDailyTasks, tasks: updatedTasks };
    });
  };

  const getCardClassName = (index: number) => {
    const funBackgrounds = [
        "bg-blue-50 dark:bg-blue-900", 
        "bg-green-50 dark:bg-green-900", 
        "bg-yellow-50 dark:bg-yellow-900", 
        "bg-purple-50 dark:bg-purple-900", 
    ];
    return `rounded-xl shadow-lg ${funBackgrounds[index % funBackgrounds.length]} hover:shadow-2xl transition-shadow duration-300`;
  }

  const checklistProgress = (taskSteps: InstructionStep[]) => {
    if (!taskSteps || taskSteps.length === 0) return 0;
    return (taskSteps.filter(step => step.completed).length / taskSteps.length) * 100;
  }

  const overallProgress = () => {
    if (!dailyTasks || dailyTasks.tasks.length === 0 || dailyTaskTarget === 0) return 0;
    const completedTasksCount = dailyTasks.tasks.filter(taskItem => 
        taskItem.steps.every(step => step.completed)
    ).length;
    return Math.min((completedTasksCount / dailyTaskTarget) * 100, 100);
  };

  const saveTaskToDailyTasks = (taskDescription: string, steps: InstructionStep[]) => {
    setDailyTasks(prevDailyTasks => {
      const newTask = { task: taskDescription, steps: steps };
      const currentTasks = prevDailyTasks?.tasks ? [...prevDailyTasks.tasks] : [];
      if (currentTasks.some(t => t.task === taskDescription)) {
        alert("This task is already in your list!");
        return prevDailyTasks;
      }
      const updatedTasks = [...currentTasks, newTask];
      return { date: getCurrentDate() , tasks: updatedTasks };
    });
  };

  // Remove a single task by its description
  const handleRemoveTask = (taskDescription: string) => {
    setDailyTasks(prevDailyTasks => {
      if (!prevDailyTasks) return prevDailyTasks;
      const updatedTasks = prevDailyTasks.tasks.filter(taskItem => taskItem.task !== taskDescription);
      return { ...prevDailyTasks, tasks: updatedTasks };
    });
  };

  const handleClearTasks = () => {
    if (!user) return;
    const newDailyTasks = { date: getCurrentDate(), tasks: [] };
    localStorage.setItem(`dailyTasks_${user.uid}`, JSON.stringify(newDailyTasks));
    setDailyTasks(newDailyTasks);
    localStorage.removeItem(`magicalPersonality_${user.uid}`);
    setMagicalPersonality(null);
    setExpandedItems([]);
  };

  const getCurrentDate = (): string => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const handleSelectSuggestedTask = async (task: string) => {
    await handlePersonalizeInstructions(task);
  };

  const generateHeroDetails = async (tasks: string[]) => {
    if (!user) return;
    setIsGeneratingHeroDetails(true);
    setHeroGenerationError(null);
    try {
      const result = await generateMagicalPersonality({ tasks });
      setMagicalPersonality({
        name: result.name,
        description: result.description,
        imagePrompt: result.imagePrompt,
        imageUrl: null,
        date: getCurrentDate(), // Ensure personality is dated
      });
    } catch (error) {
      console.error("Error generating magical personality details:", error);
      setHeroGenerationError('Could not generate magical hero details. Please try again.');
    } finally {
      setIsGeneratingHeroDetails(false);
    }
  };

  const handleShowMeMyHeroImage = async () => {
    if (!user) return;
    if (magicalPersonality && magicalPersonality.imagePrompt && magicalPersonality.imagePrompt.trim()) {
      setIsGeneratingHeroImage(true);
      setHeroGenerationError(null);
      try {
        const imagePromptWithStyle = `${magicalPersonality.imagePrompt}, 3D illustration, vibrant, playful, kid-friendly, Pixar style`;
        const imageResponse = await fetch('/api/generate-image', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ prompt: imagePromptWithStyle }),
        });
        
        const result = await imageResponse.json();

        if (imageResponse.ok && result.imageUrl) {
          setMagicalPersonality(prev => prev ? {...prev, imageUrl: result.imageUrl} : null);
        } else {
          let detailedErrorMessage = result.error || (imageResponse.ok ? "Image URL was not returned." : `API Error: ${imageResponse.statusText}`);
          if (typeof detailedErrorMessage === 'string' && detailedErrorMessage.includes("NOT_FOUND: Model 'googleai/gemini-2.0-flash-exp'")) {
            detailedErrorMessage += " This experimental model might require specific enablement on your Google Cloud project or API key.";
          }
          console.error("Image generation failed:", imageResponse.status, detailedErrorMessage, result);
          setHeroGenerationError(`Could not generate hero image. ${detailedErrorMessage}`);
        }
      } catch (error) {
        console.error("Error in handleShowMeMyHeroImage (client-side catch):", error);
        const message = error instanceof Error ? error.message : String(error);
        setHeroGenerationError(`Could not generate hero image. ${message}`);
      } finally {
        setIsGeneratingHeroImage(false);
      }
    } else {
        const missingPromptMsg = "Cannot generate image: the hero's image description is missing or invalid.";
        alert(missingPromptMsg);
        setHeroGenerationError(missingPromptMsg);
    }
  };

  const handleShareHero = () => {
    if (!magicalPersonality) return;

    const shareData = {
      title: `Meet My Magical Hero: ${magicalPersonality.name}!`,
      text: `Check out my magical hero, ${magicalPersonality.name}! ${magicalPersonality.description}`,
      url: magicalPersonality.imageUrl && magicalPersonality.imageUrl.startsWith('http') ? magicalPersonality.imageUrl : window.location.href,
    };

    const instagramUrl = `instagram://story?background_image=${encodeURIComponent(shareData.url)}&content_url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}`;

    // Attempt to open Instagram Stories
    window.location.href = instagramUrl;

    // Fallback alert if Instagram is not installed or URL scheme fails
    setTimeout(() => {
      alert('It seems Instagram is not installed or the sharing failed. Please ensure Instagram is installed and try again.');
    }, 1000);
  };

  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 via-rose-50 to-yellow-50 dark:from-sky-900 dark:via-rose-900 dark:to-yellow-900">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <p className="text-xl text-gray-700 dark:text-gray-200 font-semibold">Loading Your Magical Day...</p>
        {authLoading && <p className="text-sm text-gray-500 dark:text-gray-400">Verifying your adventurer pass...</p>}
        {!user && !authLoading && <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to home...</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-purple-900 dark:to-gray-900">
      {/* Theme Toggle Floating Button */}
      <button
        onClick={toggleTheme}
        className="fixed z-50 bottom-6 right-6 bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-yellow-600 rounded-full shadow-lg p-3 flex items-center justify-center transition-colors hover:bg-purple-100 dark:hover:bg-yellow-900"
        aria-label="Toggle theme"
        type="button"
      >
        {theme === 'dark' ? (
          <Sun className="w-7 h-7 text-yellow-400" />
        ) : (
          <Moon className="w-7 h-7 text-purple-700" />
        )}
      </button>
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image src="/TaskTastic Kids.png" alt="TaskTastic Kids Logo" width={44} height={44} className="h-11 w-auto" priority />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-4 md:p-6 space-y-6 bg-gradient-to-br from-sky-100 via-rose-50 to-yellow-50 dark:from-sky-900 dark:via-rose-900 dark:to-yellow-900 min-h-screen">

        <Dialog open={isAgeDialogOpen} onOpenChange={(open) => { if (!open && age === null) { /* Keep open */ } else { setIsAgeDialogOpen(open); }}}>
          <DialogContent className="sm:max-w-md bg-background dark:bg-card">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-foreground">Welcome, Young Adventurer!</DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                To find the best quests for you, please tell us your age.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="age" className="text-right text-lg text-foreground">
                  Age
                </Label>
                <Input
                  type="number"
                  id="age"
                  label="" // Provided by Label component
                  placeholder="Your age"
                  className="col-span-3 text-lg"
                  value={age === null ? '' : age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : null)}
                  min="1"
                />
              </div>
            </div>
            <Button onClick={handleAgeSubmit} className="w-full text-lg py-3">Let's Go!</Button>
          </DialogContent>
        </Dialog>

         <Card className={getCardClassName(0)}>
           <CardHeader>
             <CardTitle className="text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-300">Daily Quest Progress 🚀</CardTitle>
             <CardDescription className="text-base md:text-lg text-muted-foreground">
               Complete <strong>{dailyTaskTarget}</strong> quests today to unlock your magical hero!
             </CardDescription>
           </CardHeader>
           <CardContent>
             <Label className="text-md font-medium text-purple-700 dark:text-purple-300">Overall Progress:</Label>
             <Progress value={overallProgress()} className="h-4 mt-1 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-600 rounded-full bg-purple-200 dark:bg-purple-800" />
             <p className="text-center text-lg md:text-xl font-semibold text-purple-600 dark:text-purple-400 mt-3">
               {overallProgress() >= 100
                 ? '🌟 All quests completed! Your Magical Hero awaits below! 🌟'
                 : `${Math.max(0, dailyTaskTarget - (dailyTasks?.tasks.filter(t => t.steps.every(s=>s.completed)).length || 0) )} more quest(s) to go!`}
             </p>
           </CardContent>
         </Card>
             <TaskMap
          tasks={dailyTasks ? dailyTasks.tasks.map((t, i) => ({ id: i, label: t.task })) : []}
          completedTasks={dailyTasks ? dailyTasks.tasks.filter(t => t.steps.every(s => s.completed)).length : 0}
          pathPoints={defaultPathPoints}
          dailyTaskTarget={dailyTaskTarget}
        />

        <Card className={getCardClassName(1)}>
           <CardHeader>
             <CardTitle className="text-2xl md:text-3xl font-bold text-green-700 dark:text-green-300">💡 Quest Ideas Corner</CardTitle>
             <CardDescription className="text-base md:text-lg text-muted-foreground">
               Need a new adventure? Let AI suggest some quests!
             </CardDescription>
           </CardHeader>
           <CardContent>
             <div className="flex justify-center mb-4">
               <Button onClick={handleSuggestTasks} disabled={isLoadingSuggestions || age === null} className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-60">
                 {isLoadingSuggestions ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : null}
                 {isLoadingSuggestions ? 'Thinking...' : 'Suggest Quests! ✨'}
               </Button>
             </div>
             {suggestedTasks.length > 0 && (
               <div className="mt-4 p-4 bg-green-100 dark:bg-green-800 rounded-lg border border-green-300 dark:border-green-700">
                 <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">Quest Suggestions:</h3>
                 <ul className="list-disc list-inside space-y-2 text-green-700 dark:text-green-300 text-base">
                   {suggestedTasks[0] === 'Loading suggestions... ⏳' ? (
                      <li>{suggestedTasks[0]}</li>
                   ) : suggestedTasks[0] === 'No suggestions found for this age.' || suggestedTasks[0] === 'Could not fetch suggestions. Please try again.' ? (
                      <li className="text-red-600 dark:text-red-400">{suggestedTasks[0]}</li>
                   ) : (
                      suggestedTasks.map((task, index) => (
                      <li key={index} className="cursor-pointer hover:text-green-900 dark:hover:text-green-100 hover:font-semibold transition-all" onClick={() => handleSelectSuggestedTask(task)}>
                          {task}
                      </li>
                      ))
                   )}
                 </ul>
               </div>
             )}
           </CardContent>
         </Card>

        <Card className={getCardClassName(2)}>
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-300">✏️ Create Your Own Quest!</CardTitle>
            <CardDescription className="text-base md:text-lg text-muted-foreground">
              Design a quest, and we'll craft a magical checklist!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div>
                <Label htmlFor="customTask" className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-2 block">Describe Your Quest:</Label>
                <Textarea
                  id="customTask"
                  placeholder="e.g., 'Build a magnificent castle from colorful blocks. It needs tall towers and a strong gate!'"
                  rows={4}
                  className="text-base border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg p-3 min-h-[100px] bg-background dark:bg-card text-foreground"
                  value={customTaskInput}
                  onChange={e => setCustomTaskInput(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Tip:</strong> Be descriptive! What's the goal? Any special rules or fun details?
                </p>
              </div>

              <Button onClick={() => handlePersonalizeInstructions()} disabled={isLoadingInstructions || age === null} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-60">
                {isLoadingInstructions ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : null}
                {isLoadingInstructions ? 'Crafting...' : 'Make My Checklist! 🪄'}
              </Button>

              {isLoadingInstructions && (
                <div className="mt-4 p-4 text-center text-blue-700 dark:text-blue-300 text-lg">
                  <Loader2 className="inline-block mr-2 h-5 w-5 animate-spin" />
                  📜 Generating your magical checklist
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {dailyTasks && dailyTasks.tasks.length > 0 && (
          <div className="space-y-8">
            {dailyTasks.tasks.map((taskItem, taskIndex) => (
              <details
                key={taskIndex}
                className={
                  `transition-shadow duration-300 border-0 shadow-xl rounded-3xl overflow-hidden ` +
                  (taskIndex % 2 === 0
                    ? 'bg-gradient-to-br from-pink-100 via-yellow-100 to-blue-100 dark:from-pink-900 dark:via-yellow-900 dark:to-blue-900'
                    : 'bg-gradient-to-br from-blue-100 via-green-100 to-yellow-100 dark:from-blue-900 dark:via-green-900 dark:to-yellow-900')
                }
                open={
                  !taskItem.steps.every(step => step.completed) &&
                  dailyTasks.tasks.findIndex(t => !t.steps.every(s => s.completed)) === taskIndex
                }
              >
                <summary className="flex items-center gap-3 px-6 py-5 cursor-pointer select-none text-2xl font-extrabold text-purple-700 dark:text-yellow-200 bg-white/70 dark:bg-black/40 border-b-2 border-purple-200 dark:border-yellow-700 rounded-t-3xl">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200 dark:from-purple-800 dark:via-pink-900 dark:to-yellow-900 flex items-center justify-center text-3xl shadow-md">
                    {String.fromCodePoint(0x1F4CC + (taskIndex % 4))}
                  </span>
                  <span className="ml-2 flex-1">{taskItem.task}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
                    aria-label="Remove task"
                    onClick={e => {
                      e.stopPropagation();
                      handleRemoveTask(taskItem.task);
                    }}
                  >
                    <span className="sr-only">Remove</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </summary>
                <div className="p-6 pt-4">
                  <ul className="space-y-5">
                    {taskItem.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-center gap-5">
                        <button
                          onClick={() => handleToggleStep(taskItem.task, step.id)}
                          className={`transition-all duration-200 h-8 w-8 rounded-full border-4 flex items-center justify-center text-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-yellow-400 ` +
                            (step.completed
                              ? 'bg-green-400 border-green-600 text-white dark:bg-green-600 dark:border-green-400'
                              : 'bg-white border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-600')}
                          disabled={
                            !(
                              !step.completed &&
                              taskItem.steps.findIndex(s => !s.completed) === stepIndex
                            )
                          }
                          aria-label={step.completed ? 'Completed' : 'Mark as completed'}
                        >
                          {step.completed ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                        </button>
                        <div className="flex-1 bg-white/80 dark:bg-black/30 rounded-2xl px-4 py-3 shadow-inner">
                          <p className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1">
                            {step.instruction}
                          </p>
                          <p className="text-base italic text-pink-600 dark:text-yellow-300">
                            {step.encouragement}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full text-lg shadow-md hover:shadow-lg transition-all"
                onClick={handleClearTasks}
                disabled={dailyTasks.tasks.length === 0}
              >
                Clear All Tasks
              </Button>
            </div>
          </div>
        )}

        {magicalPersonality && magicalPersonality.date === getCurrentDate() && (
          <Card className={getCardClassName(3)}>
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold text-yellow-600 dark:text-yellow-300">✨ Your Magical Hero of the Day! ✨</CardTitle>
              {overallProgress() < 100 && (
                <CardDescription className="text-yellow-700 dark:text-yellow-400 text-base">Complete all your quests to fully reveal your hero!</CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4 text-center">
              {magicalPersonality.imageUrl ? (
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-xl overflow-hidden shadow-xl border-4 border-yellow-300 dark:border-yellow-600">
                  <Image
                    src={magicalPersonality.imageUrl}
                    alt={magicalPersonality.name}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint="fantasy character hero"
                  />
                </div>
              ) : (
                overallProgress() >= 100 && (
                  <Button onClick={handleShowMeMyHeroImage} disabled={isGeneratingHeroImage} className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-full text-lg shadow-md hover:shadow-lg transition-all">
                    {isGeneratingHeroImage ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    {isGeneratingHeroImage ? 'Summoning...' : 'Reveal My Hero Image! 🖼️'}
                  </Button>
                )
              )}
              {heroGenerationError && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-md text-sm flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>{heroGenerationError}</span>
                </div>
              )}
              <h3 className="text-2xl md:text-3xl font-bold text-yellow-800 dark:text-yellow-200">{magicalPersonality.name}</h3>
              <p className="text-lg md:text-xl text-yellow-700 dark:text-yellow-400 italic">{magicalPersonality.description}</p>
              <Button
                onClick={handleShareHero}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full text-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Share2 className="h-5 w-5" /> Share to Social Media
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Task Count Dialog */}
      <Dialog open={showTaskCountDialog} onOpenChange={setShowTaskCountDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Daily Task Goal</DialogTitle>
            <DialogDescription>
              How many tasks would you like to complete today? (1-10)
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTaskCountSubmit} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="taskCount" className="text-right">
                  Tasks:
                </Label>
                <div className="col-span-3">
                  <Input
                    id="taskCount"
                    type="number"
                    min="1"
                    max="10"
                    value={taskCountInput}
                    onChange={(e) => setTaskCountInput(e.target.value)}
                    placeholder="Enter number of tasks"
                    label="Number of tasks"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={!taskCountInput || isNaN(parseInt(taskCountInput))}>
                Set Goal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
