'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Menu, ChevronDown, AlertCircle, LogOut, Settings, Pencil, Trash2, X, Check, MoreVertical, Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu"
import { format, parse, isValid } from 'date-fns'  // Add this import at the top of the file
import { useRouter } from "next/router"
import { signOut } from "firebase/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { doc, setDoc, updateDoc, getDoc, getFirestore, collection } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast"
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot, DroppableProvided } from 'react-beautiful-dnd';
import { query, where, getDocs, limit } from 'firebase/firestore';
import { db, auth } from '../firebase-config';
import { Badge } from "../components/ui/badge"
import { cn } from "@/lib/utils"
import { v4 as uuidv4 } from 'uuid'; // Add this import at the top of your file
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog"
import { Slider } from "../components/ui/slider"
import { Checkbox } from "../components/ui/checkbox"
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"; // Update this import

// Add this near the top of the file, after the imports
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 
  'VA', 'WA', 'WV', 'WI', 'WY'
];

interface EssayPrompt {
  prompt: string
  wordCount: number
  isRequired: boolean
}

interface College {
  id: string;
  AvgNetPricPub: string;
  AvgNetPricePriv: string;
  actAvg25: string;
  actAvg75: string;
  actEng25: string;
  actEng75: string;
  actMath25: string;
  actMath75: string;
  addr: string;
  admRate: string;
  city: string;
  coa: string;
  coaProgYear: string;
  commonApp: string;
  control: string;
  ea: string;
  ed: string;
  essayPolicy: string;
  fee: string;
  gradRate: string;
  highDeg: string;
  instUrl: string;
  latitude: string;
  locale: string;
  longitude: string;
  lor: string;
  main: string;
  medEarn1yr: string;
  medEarn4y: string;
  medEarn5yr: string;
  name: string;
  netPricePriv030: string;
  netPricePriv110plus: string;
  netPricePriv3048: string;
  netPricePriv4875: string;
  netPricePriv75110: string;
  netPricePub030: string;
  netPricePub110plus: string;
  netPricePub3048: string;
  netPricePub4875: string;
  netPricePub75110: string;
  npcUrl: string;
  predDeg: string;
  rd: string;
  region: string;
  retRate: string;
  satAvg: string;
  satMath25: string;
  satMath75: string;
  satRead25: string;
  satRead75: string;
  srar: string;
  state: string;
  supEssay: string;
  testPolicy: string;
  tuitIn: string;
  tuitOut: string;
  tuitProgYear: string;
  undegrSize: string;
  zip: string;
}

// Update the CollegeApplication interface
interface CollegeApplication extends College {
  id: string;
  essayPrompts: EssayPrompt[];
  [key: string]: any; // Add this line
}

interface UserProfile {
  username: string;
  email: string;
  image: string;
  satReading: number;
  satMath: number;
  sat: number; // Add this line
  gpa: number;
  act: number;
  familyIncome: number;
  actEnglish: number;
  actMath: number;
}

interface CollegeSearchResult {
  name: string;
  city: string;
  state: string;
  undegrSize: string; // Add this line
  admRate: string;
  testPolicy: string;
  essayPolicy: string;
  control: string; // Add this line
  commonApp: string; // Add this line
  gradRate: string; // Add this line
}

// Update the loadUserProfile function
const loadUserProfile = async (userId: string) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      console.log("User data loaded:", userData);
      const applications = userData.applications as CollegeApplication[] || [];
      console.log("Applications before return:", applications);
      return {
        profile: userData as UserProfile,
        applications: applications
      };
    } else {
      console.log("User document does not exist, creating new profile");
      const defaultProfile: UserProfile = {
        username: 'User',
        email: '',
        image: '',
        satReading: 0,
        satMath: 0,
        sat: 0, // Add this line
        gpa: 0,
        act: 0,
        familyIncome: 0,
        actEnglish: 0,
        actMath: 0,
      };
      await setDoc(userDocRef, { ...defaultProfile, applications: [] });
      return {
        profile: defaultProfile,
        applications: []
      };
    }
  } catch (error) {
    console.error("Error in loadUserProfile:", error);
    throw error;
  }
};

// Update the custom badge variants
const customBadgeVariants = {
  "ghost-red": "bg-red-100 text-red-800 hover:bg-red-200",
  "ghost-yellow": "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  "ghost-green": "bg-green-100 text-green-800 hover:bg-green-200",
};

// Add this function at the top of your component or in a separate utility file
const getTestPolicyDisplay = (policy: string): string => {
  switch (policy) {
    case '1':
      return 'Required';
    case '2':
      return 'Recommended';
    case '3':
      return 'Not Concidered';
    case '4':
      return 'N/A';
    case '5':
      return 'Considered';
    default:
      return 'N/A';
  }
};

// Add this utility function at the top of your file
const formatPercentage = (value: string | null | undefined) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  const num = parseFloat(value);
  return isNaN(num) ? 'N/A' : `${(num * 100).toFixed(1)}%`;
};

// Add this helper function at the top of your file
const getEstimatedNetPrice = (college: CollegeApplication, familyIncome: number): string => {
  const isPublic = college.control === '1';
  let priceField = '';

  if (familyIncome <= 30000) {
    priceField = isPublic ? 'netPricePub030' : 'netPricePriv030';
  } else if (familyIncome <= 48000) {
    priceField = isPublic ? 'netPricePub3048' : 'netPricePriv3048';
  } else if (familyIncome <= 75000) {
    priceField = isPublic ? 'netPricePub4875' : 'netPricePriv4875';
  } else if (familyIncome <= 110000) {
    priceField = isPublic ? 'netPricePub75110' : 'netPricePriv75110';
  } else {
    priceField = isPublic ? 'netPricePub110plus' : 'netPricePriv110plus';
  }

  return college[priceField] ? `$${college[priceField]}` : 'N/A';
};

// Add this helper function at the top of your file
const getControlType = (controlCode: string): string => {
  switch (controlCode) {
    case '1':
      return 'Public';
    case '2':
      return 'Private';
    case '3':
      return 'Private For-Profit';
    default:
      return 'Unknown';
  }
};

// Add this helper function near the top of the file with other utility functions
const getCommonAppDisplay = (value: string): string => {
  return value === "1" ? "Yes" : value;
};

// Update the TestScoreRange component
const TestScoreRange: React.FC<{
  min25: number;
  max75: number;
  userScore: number;
  label: string;
}> = ({ min25, max75, userScore, label }) => {
  const range = max75 - min25;
  let userPosition;

  if (userScore < min25) {
    userPosition = ((userScore - 600) / min25) * 25;
  } else if (userScore > max75) {
    userPosition = 75 + ((userScore - max75) / (1550 - max75)) * 25;
  } else {
    userPosition = 25 + ((userScore - min25) / range) * 50;
  }

  // Clamp the userPosition between 0 and 100
  userPosition = Math.min(Math.max(userPosition, 0), 100);

  return (
    <div className="mb-1">
      <div className="text-xs mb-0.5">{label}</div>
      <div className="relative">
        <div className="h-2 flex">
          <div className="w-1/4 bg-red-400"></div>
          <div className="w-1/4 bg-orange-400"></div>
          <div className="w-1/4 bg-yellow-400"></div>
          <div className="w-1/4 bg-green-400"></div>
        </div>
        {userScore > 0 && (
          <div 
            className="absolute top-0 w-0 h-0 border-l-[3px] border-r-[3px] border-t-[10px] border-l-transparent border-r-transparent border-t-black"
            style={{ left: `calc(${userPosition}% - 3px)`, marginTop: '-2px' }}
          ></div>
        )}
        <div className="flex justify-between text-[8px] text-gray-600 relative" style={{ marginTop: '-0.1rem' }}>
          <span className="absolute left-1/4 -translate-x-1/2">{min25}</span>
          <span className="absolute left-3/4 -translate-x-1/2">{max75}</span>
        </div>
      </div>
    </div>
  );
};

const CollegeApplicationTracker: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: 'User',
    email: '',
    image: '',
    satReading: 0,
    satMath: 0,
    sat: 0, // Add this line
    gpa: 0,
    act: 0,
    familyIncome: 0,
    actEnglish: 0,
    actMath: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  const [applications, setApplications] = useState<CollegeApplication[]>([]);

  const [editingColleges, setEditingColleges] = useState<{ [key: string]: CollegeApplication }>({});

  const [authChecked, setAuthChecked] = useState(false);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<CollegeSearchResult[]>([]);

  const [collegeToRemove, setCollegeToRemove] = useState<string | null>(null);

  const [colleges, setColleges] = useState<College[]>([]);

  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    state: '',
    admissionRate: [0, 100],
    graduationRate: [0, 100], // Add this line
    control: '', // Add this line
    testPolicy: '', // Add this line
  });

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 
    'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 
    'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const [sliderValues, setSliderValues] = useState(filters.admissionRate);
  const [gradSliderValues, setGradSliderValues] = useState(filters.graduationRate); // Add this line

  const handleFilterChange = useCallback((filterName: string, value: any) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  }, []);

  const handleSliderChange = useCallback((value: number[]) => {
    setSliderValues(value);
  }, []);

  const handleSliderCommit = useCallback((value: number[]) => {
    handleFilterChange('admissionRate', value);
  }, [handleFilterChange]);

  const handleGradSliderChange = useCallback((value: number[]) => {
    setGradSliderValues(value);
  }, []);

  const handleGradSliderCommit = useCallback((value: number[]) => {
    handleFilterChange('graduationRate', value);
  }, [handleFilterChange]);

  useEffect(() => {
    const loadColleges = async () => {
      try {
        const response = await fetch('/api/fetchColleges');
        if (!response.ok) {
          throw new Error('Failed to fetch college data');
        }
        const data = await response.json();
        setColleges(data);
      } catch (error) {
        console.error('Error loading colleges:', error);
        toast({
          title: "Error",
          description: "Failed to load college data",
          variant: "destructive",
        });
      }
    };
    loadColleges();
  }, []);

  // Move this function to the top of the component
  const ensureApplicationIds = (apps: any[]): CollegeApplication[] => {
    return apps.map(app => ({
      ...app,
      id: app.id || uuidv4(),
      testPolicy: app.testPolicy, // This is already a string
    }));
  };

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (isMounted) {
        if (user) {
          console.log("User authenticated:", user.uid);
          try {
            const data = await loadUserProfile(user.uid);
            if (data && isMounted) {
              console.log("User profile loaded:", data.profile);
              console.log("Applications loaded:", data.applications);
              setUserProfile(data.profile);
              const appsWithIds = ensureApplicationIds(data.applications);
              console.log("Applications with ensured IDs:", appsWithIds);
              setApplications(appsWithIds);
              console.log("Applications set in state:", appsWithIds);
              if (appsWithIds.some((app, index) => app.id !== data.applications[index].id)) {
                console.log("Updating applications with new IDs");
                const userDocRef = doc(db, "users", user.uid);
                await updateDoc(userDocRef, { applications: appsWithIds });
              }
            }
          } catch (error) {
            console.error("Error loading user data:", error);
            if (isMounted) {
              toast({
                title: "Error",
                description: "Failed to load user data",
                variant: "destructive",
              });
            }
          }
        } else {
          console.log("User not authenticated, redirecting to signin");
          router.push("/signin");
        }
        setIsLoading(false);
        setAuthChecked(true);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [router, toast]);

  useEffect(() => {
    console.log("Current applications state:", applications);
  }, [applications]);

  useEffect(() => {
    console.log("Applications state updated:", applications);
  }, [applications]);

  // Add this useEffect hook to log applications when they change
  useEffect(() => {
    console.log("Applications updated:", applications);
  }, [applications]);

  // Add these state variables at the top with other state declarations
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const resultsPerPage = 10;

  // Add this function to handle page changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Update the searchColleges function
  const searchColleges = async (term: string, appliedFilters: typeof filters) => {
    try {
      const collegesRef = collection(db, "colleges");
      const q = query(collegesRef, limit(50));
      const querySnapshot = await getDocs(q);
      
      const allResults: CollegeSearchResult[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (meetsFilterCriteria(data, appliedFilters) && 
            (term === '' || data.name.toLowerCase().includes(term.toLowerCase()))) {
          allResults.push({
            name: data.name,
            city: data.city || '',
            state: data.state || '',
            undegrSize: data.undegrSize || '',
            admRate: data.admRate || '',
            testPolicy: data.testPolicy || '',
            essayPolicy: data.essayPolicy || '',
            control: data.control || '',
            commonApp: data.commonApp || '',
            gradRate: data.gradRate || '', // Add this line
          });
        }
      });
      
      // Update total results count
      setTotalResults(allResults.length);
      
      // Paginate results
      const startIndex = (currentPage - 1) * resultsPerPage;
      const paginatedResults = allResults.slice(startIndex, startIndex + resultsPerPage);
      
      setSearchResults(paginatedResults);
    } catch (error) {
      console.error("Error searching colleges:", error);
      toast({
        title: "Error",
        description: "Failed to search colleges",
        variant: "destructive",
      });
    }
  };

  // Add this useEffect to reset page when search term or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // Add this useEffect to trigger search when filters or searchTerm change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchColleges(searchTerm, filters);
    }, 300); // 300ms delay to avoid too many searches while typing

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filters]);

  const meetsFilterCriteria = (college: any, appliedFilters: typeof filters): boolean => {
    // Filter by state
    if (appliedFilters.state && college.state !== appliedFilters.state) return false;
    
    // Filter by control type
    if (appliedFilters.control && college.control !== appliedFilters.control) return false;
    
    // Filter by test policy
    if (appliedFilters.testPolicy && college.testPolicy !== appliedFilters.testPolicy) return false;
    
    // Filter by admission rate
    const admRate = college.admRate ? parseFloat(college.admRate) : null;
    
    // Check if the admission rate filter is at its default values
    const isAdmRateFilterDefault = appliedFilters.admissionRate[0] === 0 && appliedFilters.admissionRate[1] === 100;
    
    // If admission rate filter is not at default, exclude colleges with null or NaN admission rates
    if (!isAdmRateFilterDefault) {
      if (admRate === null || isNaN(admRate)) {
        return false;
      }
      
      const admRatePercentage = admRate * 100;
      if (admRatePercentage < appliedFilters.admissionRate[0] || admRatePercentage > appliedFilters.admissionRate[1]) {
        return false;
      }
    }
    
    // Filter by graduation rate
    const gradRate = college.gradRate ? parseFloat(college.gradRate) : null;
    const isGradRateFilterDefault = appliedFilters.graduationRate[0] === 0 && appliedFilters.graduationRate[1] === 100;
    
    if (!isGradRateFilterDefault) {
      if (gradRate === null || isNaN(gradRate)) {
        return false;
      }
      
      const gradRatePercentage = gradRate * 100;
      if (gradRatePercentage < appliedFilters.graduationRate[0] || gradRatePercentage > appliedFilters.graduationRate[1]) {
        return false;
      }
    }
    
    return true;
  };

  // Add this function inside the component
  const clearSearch = () => {
    setSearchTerm('');
    setFilters({
      state: '',
      admissionRate: [0, 100],
      graduationRate: [0, 100], // Add this line
      control: '', // Add this line
      testPolicy: '', // Add this line
    });
    setSearchResults([]);
  };

  if (!authChecked || isLoading) {
    return <div>Loading...</div>; // Or a more sophisticated loading spinner
  }

  if (!auth.currentUser) {
    return null; // or redirect to login page
  }

  const addEssayPrompt = (applicationId: string) => {
    const newApplications = applications.map(app => {
      if (app.id === applicationId) {
        return {
          ...app,
          essayPrompts: [...(app.essayPrompts || []), { prompt: '', wordCount: 0, isRequired: true }]
        }
      }
      return app
    });
    setApplications(newApplications);
    saveApplications(newApplications);
  }

  const updateEssayPrompt = (applicationId: string, promptIndex: number, field: keyof EssayPrompt, value: string | number | boolean) => {
    const newApplications = applications.map(app => {
      if (app.id === applicationId) {
        const newPrompts = [...(app.essayPrompts || [])];
        newPrompts[promptIndex] = { ...newPrompts[promptIndex], [field]: value };
        return { ...app, essayPrompts: newPrompts };
      }
      return app;
    });
    setApplications(newApplications);
    saveApplications(newApplications);
  }

  const removeEssayPrompt = (applicationId: string, promptIndex: number) => {
    const newApplications = applications.map(app => {
      if (app.id === applicationId) {
        const newPrompts = [...(app.essayPrompts || [])];
        newPrompts.splice(promptIndex, 1);
        return { ...app, essayPrompts: newPrompts };
      }
      return app;
    });
    setApplications(newApplications);
    saveApplications(newApplications);
  }

  // Update the removeCollege function
  const removeCollege = (id: string) => {
    setCollegeToRemove(id);
  };

  const confirmRemoveCollege = async () => {
    if (!collegeToRemove) return;

    try {
      const newApplications = applications.filter(app => app.id !== collegeToRemove);
      setApplications(newApplications);
      
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          applications: newApplications
        });
      }
      
      toast({
        title: "Success",
        description: "College removed from your list",
        variant: "default",
      });
    } catch (error) {
      console.error("Error removing college:", error);
      
      toast({
        title: "Error",
        description: "Failed to remove college from your list",
        variant: "destructive",
      });
    } finally {
      setCollegeToRemove(null);
    }
  };

  const startEditing = (college: CollegeApplication) => {
    setEditingColleges(prev => ({
      ...prev,
      [college.id]: { ...college }
    }));
  };

  const saveEditing = (id: string) => {
    const editedCollege = editingColleges[id];
    if (editedCollege) {
      const newApplications = applications.map(app => 
        app.id === id ? editedCollege : app
      );
      setApplications(newApplications);
      saveApplications(newApplications);
      setEditingColleges(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const cancelEditing = (id: string) => {
    setEditingColleges(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const updateEditingCollege = (id: string, field: keyof CollegeApplication, value: any) => {
    setEditingColleges(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';

    // Check if the date is already in MMM-DD format
    const mmmDdRegex = /^[A-Za-z]{3}-\d{2}$/;
    if (mmmDdRegex.test(dateString)) {
      return dateString;
    }

    // Check if the date is in MM/DD/YYYY format
    const mmDdYyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateString.match(mmDdYyyyRegex);

    if (match) {
      const [, month, day, year] = match;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (isValid(date)) {
        return format(date, 'MMM-dd');
      }
    }

    // If it's not in MM/DD/YYYY format, try parsing as yyyy-MM-dd
    try {
      const date = parse(dateString, 'yyyy-MM-dd', new Date());
      if (isValid(date)) {
        return format(date, 'MMM-dd');
      }
    } catch (error) {
      console.error("Error parsing date:", error);
    }

    // If all parsing attempts fail, return the original string
    return dateString;
  };

  // Update the logout functionality
  const handleLogout = () => {
    signOut(auth).then(() => {
      setUserProfile({
        username: '',
        email: '',
        image: '',
        satReading: 0,
        satMath: 0,
        sat: 0, // Add this line
        gpa: 0,
        act: 0,
        familyIncome: 0,
        actEnglish: 0,
        actMath: 0,
      });
      router.push("/signin");
    }).catch((error) => {
      console.error("Error signing out: ", error);
    });
  }

  const updateProfile = (field: keyof UserProfile, value: string | number) => {
    setUserProfile(prev => ({ 
      ...prev, 
      [field]: field === 'satReading' || field === 'satMath' ? Number(value) : value 
    }));
  };

  const saveProfileChanges = async () => {
    if (!auth.currentUser) {
      toast({
        title: "Error",
        description: "No user logged in",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      
      // Calculate total SAT score
      const satReading = parseInt(userProfile.satReading.toString(), 10) || 0;
      const satMath = parseInt(userProfile.satMath.toString(), 10) || 0;
      const totalSAT = satReading + satMath;

      const updatedProfile = {
        username: userProfile.username,
        email: userProfile.email,
        image: userProfile.image,
        satReading: String(userProfile.satReading),
        satMath: String(userProfile.satMath),
        sat: String(totalSAT),
        gpa: String(userProfile.gpa),
        act: String(userProfile.act),
        familyIncome: String(userProfile.familyIncome),
        actEnglish: String(userProfile.actEnglish),
        actMath: String(userProfile.actMath),
      };

      await updateDoc(userDocRef, updatedProfile);
      
      // Update password if a new one is provided
      if (newPassword) {
        if (!oldPassword) {
          throw new Error("Old password is required to change password");
        }

        // Create a credential with the old password
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email!,
          oldPassword
        );

        // Reauthenticate the user
        await reauthenticateWithCredential(auth.currentUser, credential);

        // If reauthentication is successful, update the password
        await updatePassword(auth.currentUser, newPassword);
      }

      setUserProfile(prev => ({
        ...prev,
        ...updatedProfile,
        satReading: Number(updatedProfile.satReading),
        satMath: Number(updatedProfile.satMath),
        sat: Number(updatedProfile.sat),
        gpa: Number(updatedProfile.gpa),
        act: Number(updatedProfile.act),
        familyIncome: Number(updatedProfile.familyIncome),
        actEnglish: Number(updatedProfile.actEnglish),
        actMath: Number(updatedProfile.actMath),
      }));

      setOldPassword(''); // Clear the old password field
      setNewPassword(''); // Clear the new password field

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile: ", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveApplications = async (newApplications: CollegeApplication[]) => {
    if (!auth.currentUser) {
      toast({
        title: "Error",
        description: "No user logged in",
        variant: "destructive",
      });
      return;
    }

    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, {
        applications: newApplications
      });
      setApplications(newApplications); // Update local state
      toast({
        title: "Success",
        description: "Applications saved successfully",
      });
    } catch (error) {
      console.error("Error saving applications:", error);
      toast({
        title: "Error",
        description: "Failed to save applications",
        variant: "destructive",
      });
    }
  };

  const togglePopover = (id: string) => {
    setOpenPopoverId(prevId => prevId === id ? null : id)
  }

  // Modify the onDragEnd function
  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    const items = Array.from(applications);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);

    setApplications(items);
    saveApplications(items);
  };

  // Add this function inside the CollegeApplicationTrackerComponent, before the return statement
  const saveAndCloseEssayPrompt = (appId: string, promptIndex: number) => {
    // Here you can add any additional save logic if needed
    // For now, we'll just close the popover since changes are saved automatically
    const popoverTrigger = document.querySelector(`[data-popover-trigger="${appId}-${promptIndex}"]`);
    if (popoverTrigger instanceof HTMLElement) {
      popoverTrigger.click(); // This will close the popover
    }
  };

  // Add this function to filter applications based on the search term
  const filteredApplications = applications.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addCollegeToApplications = async (college: CollegeSearchResult) => {
    if (!auth.currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to add a college",
        variant: "destructive",
      });
      return;
    }

    const collegeExists = applications.some(app => app.name.toLowerCase() === college.name.toLowerCase());

    if (collegeExists) {
      toast({
        title: "Info",
        description: `${college.name} is already in your list`,
        variant: "default",
      });
      return;
    }

    try {
      // Fetch the full college data from Firestore
      const collegesRef = collection(db, "colleges");
      const q = query(collegesRef, where("name", "==", college.name), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("College not found in database");
      }

      const collegeDoc = querySnapshot.docs[0];
      const collegeData = collegeDoc.data() as College;

      const newApplication: CollegeApplication = {
        ...collegeData,
        id: uuidv4(),
        essayPrompts: [],
      };

      const userDocRef = doc(db, "users", auth.currentUser.uid);
      
      // Get the current applications array from Firestore
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        throw new Error("User document not found");
      }
      
      const userData = userDoc.data();
      const currentApplications = userData.applications || [];
      
      // Add the new application to the array
      const updatedApplications = [...currentApplications, newApplication];
      
      // Update Firestore document
      await updateDoc(userDocRef, {
        applications: updatedApplications
      });

      // Update local state
      setApplications(updatedApplications);

      toast({
        title: "Success",
        description: `${college.name} added to your list`,
      });
    } catch (error) {
      console.error("Error adding college to applications:", error);
      toast({
        title: "Error",
        description: "Failed to add college to your list",
        variant: "destructive",
      });
    }
  };

  const isFilterActive = () => {
    return filters.state !== '' || filters.admissionRate[0] !== 0 || filters.admissionRate[1] !== 100 || filters.graduationRate[0] !== 0 || filters.graduationRate[1] !== 100 || filters.control !== '' || filters.testPolicy !== '';
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="ml-2 text-xl font-semibold text-gray-900">CollegeTracker</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={userProfile.image} alt={userProfile.username} />
                <AvatarFallback>
                  {userProfile.username
                    ? userProfile.username.split(' ').map(n => n[0]).join('')
                    : 'U'}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {userProfile.username || 'User'}
              </h3>
            </div>
            <div className="flex items-center space-x-8 text-sm text-gray-500">
              <span><strong>GPA:</strong> {userProfile.gpa}</span>
              <span><strong>SAT:</strong> {Number(userProfile.satReading) + Number(userProfile.satMath)} (R: {userProfile.satReading}, M: {userProfile.satMath})</span>
              <span><strong>ACT:</strong> {userProfile.act}</span>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="primary">Edit Profile</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="username"
                      value={userProfile.username}
                      onChange={(e) => updateProfile('username', e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => updateProfile('email', e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="image" className="text-right">
                      Profile Image
                    </Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateProfile('image', reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="satReading" className="text-right">
                      SAT Reading
                    </Label>
                    <Input
                      id="satReading"
                      type="number"
                      value={userProfile.satReading}
                      onChange={(e) => updateProfile('satReading', parseInt(e.target.value))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="satMath" className="text-right">
                      SAT Math
                    </Label>
                    <Input
                      id="satMath"
                      type="number"
                      value={userProfile.satMath}
                      onChange={(e) => updateProfile('satMath', parseInt(e.target.value))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="act" className="text-right">
                      ACT Score
                    </Label>
                    <Input
                      id="act"
                      type="number"
                      value={userProfile.act}
                      onChange={(e) => updateProfile('act', parseInt(e.target.value))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="gpa" className="text-right">
                      GPA
                    </Label>
                    <Input
                      id="gpa"
                      type="number"
                      step="0.01"
                      value={userProfile.gpa}
                      onChange={(e) => updateProfile('gpa', parseFloat(e.target.value))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="familyIncome" className="text-right">
                      Family Income
                    </Label>
                    <Input
                      id="familyIncome"
                      type="number"
                      value={userProfile.familyIncome}
                      onChange={(e) => updateProfile('familyIncome', parseInt(e.target.value))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="oldPassword" className="text-right">
                      Current Password
                    </Label>
                    <Input
                      id="oldPassword"
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newPassword" className="text-right">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={saveProfileChanges} disabled={isLoading} variant="primary">
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search bar and results */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search colleges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full h-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-10"
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              {(searchTerm !== '' || isFilterActive()) && (
                <Button
                  variant="outline"
                  onClick={clearSearch}
                  className="h-10"
                >
                  Clear Search
                </Button>
              )}
            </div>
            
            {/* Filter panel */}
            {showFilters && (
              <div className="mt-4 bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="state">State</Label>
                    <select
                      id="state"
                      value={filters.state}
                      onChange={(e) => handleFilterChange('state', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">All States</option>
                      {US_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="control">Control</Label>
                    <select
                      id="control"
                      value={filters.control}
                      onChange={(e) => handleFilterChange('control', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">All Types</option>
                      <option value="1">Public</option>
                      <option value="2">Private</option>
                      <option value="3">Private For-Profit</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="testPolicy">Test Policy</Label>
                    <select
                      id="testPolicy"
                      value={filters.testPolicy}
                      onChange={(e) => handleFilterChange('testPolicy', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">All Policies</option>
                      <option value="1">Required</option>
                      <option value="2">Recommended</option>
                      <option value="3">Not Considered</option>
                      <option value="4">N/A</option>
                      <option value="5">Considered</option>
                    </select>
                  </div>
                  <div className="px-6">
                    <Label>Admission Rate (%)</Label>
                    <div className="pt-2 pb-2">
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={sliderValues}
                        onValueChange={(value) => {
                          handleSliderChange(value);
                          handleSliderCommit(value);
                        }}
                        className="relative"
                      />
                      <div className="relative">
                        <span 
                          className="absolute text-sm" 
                          style={{ left: `${sliderValues[0]}%`, transform: 'translateX(-50%)' }}
                        >
                          {sliderValues[0]}%
                        </span>
                        <span 
                          className="absolute text-sm" 
                          style={{ left: `${sliderValues[1]}%`, transform: 'translateX(-50%)' }}
                        >
                          {sliderValues[1]}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-6">
                    <Label>Graduation Rate (%)</Label>
                    <div className="pt-2 pb-2">
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={gradSliderValues}
                        onValueChange={(value) => {
                          handleGradSliderChange(value);
                          handleGradSliderCommit(value);
                        }}
                        className="relative"
                      />
                      <div className="relative">
                        <span 
                          className="absolute text-sm" 
                          style={{ left: `${gradSliderValues[0]}%`, transform: 'translateX(-50%)' }}
                        >
                          {gradSliderValues[0]}%
                        </span>
                        <span 
                          className="absolute text-sm" 
                          style={{ left: `${gradSliderValues[1]}%`, transform: 'translateX(-50%)' }}
                        >
                          {gradSliderValues[1]}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Search results table */}
            {(searchTerm !== '' || isFilterActive()) && searchResults.length > 0 && (
              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>College Name</TableHead>
                      <TableHead className="text-center">Size</TableHead>
                      <TableHead className="text-center">Admission Rate</TableHead>
                      <TableHead className="text-center">Graduation Rate</TableHead>
                      <TableHead className="text-center">Test Policy</TableHead>
                      <TableHead className="text-center">Essay Policy</TableHead>
                      <TableHead className="text-center">Common App</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((college) => {
                      const isAlreadyAdded = applications.some(app => app.name.toLowerCase() === college.name.toLowerCase());
                      return (
                        <TableRow key={college.name}>
                          <TableCell>
                            <div>
                              <span className="font-bold text-indigo-800">{college.name}</span>
                              <div className="text-xs text-gray-500">
                                {`${college.city}, ${college.state} • ${getControlType(college.control)}`}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{college.undegrSize}</TableCell>
                          <TableCell className="text-center">{formatPercentage(college.admRate)}</TableCell>
                          <TableCell className="text-center">{formatPercentage(college.gradRate)}</TableCell>
                          <TableCell className="text-center">{getTestPolicyDisplay(college.testPolicy)}</TableCell>
                          <TableCell className="text-center">{college.essayPolicy}</TableCell>
                          <TableCell className="text-center">{getCommonAppDisplay(college.commonApp)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              onClick={() => addCollegeToApplications(college)}
                              disabled={isAlreadyAdded}
                              variant={isAlreadyAdded ? "secondary" : "primary"}
                            >
                              {isAlreadyAdded ? "Added" : "+ Add"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                {/* Pagination controls */}
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * resultsPerPage) + 1} to {Math.min(currentPage * resultsPerPage, totalResults)} of {totalResults} results
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.ceil(totalResults / resultsPerPage) }, (_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    )).slice(Math.max(0, currentPage - 3), Math.min(Math.ceil(totalResults / resultsPerPage), currentPage + 2))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= Math.ceil(totalResults / resultsPerPage)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User's college list */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <DragDropContext onDragEnd={onDragEnd}>
              <Table>
                <TableHeader className="bg-slate-200">
                  <TableRow>
                    {[
                      "College Name", "Size", "Adm Rate",
                      "Grad Rate", "Reten Rate", "Avg Net Price", "Est Net Price", "Test Scores", "Test Policy",
                      "Essay Policy", "Supplemental Essays", "Deadlines", "Common App",
                      "LOR", "App Fee", ""
                    ].map((header, index) => (
                      <TableHead 
                        key={header} 
                        className={`py-4 ${index === 0 ? 'pl-3 pr-1 text-left' : 'px-1 text-center'} text-s font-medium`}
                      >
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <Droppable droppableId="applications">
                  {(provided) => (
                    <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                      {applications.map((app, index) => (
                        <Draggable key={app.id} draggableId={app.id} index={index}>
                          {(provided, snapshot) => (
                            <TableRow
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="border-b border-slate-200 bg-white hover:bg-slate-50"
                            >
                              <TableCell className="py-4 pl-3 pr-1 align-middle [&:has([role=checkbox])]:pr-0">
                                <div>
                                  <a 
                                    href={app.instUrl && !app.instUrl.startsWith('http') ? `https://${app.instUrl}` : app.instUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="font-bold text-indigo-800 hover:text-indigo-900 hover:underline"
                                  >
                                    {app.name}
                                  </a>
                                  <div className="text-xs text-gray-500">
                                    {`${app.city}, ${app.state} • ${getControlType(app.control)}`}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-1 text-center">
                                {!!editingColleges[app.id] ? (
                                  <Input 
                                    value={editingColleges[app.id]?.undegrSize || ''} 
                                    onChange={(e) => updateEditingCollege(app.id, 'undegrSize', e.target.value)}
                                    className="flex rounded-md border-input bg-background px-1 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full h-full border-0 focus:ring-0"
                                  />
                                ) : app.undegrSize}
                              </TableCell>
                              <TableCell className="py-4 px-1 text-center">
                                {!!editingColleges[app.id] ? (
                                  <Input 
                                    value={editingColleges[app.id]?.admRate || ''}
                                    onChange={(e) => {
                                      const value = e.target.value.replace('%', '');
                                      const numValue = parseFloat(value) / 100;
                                      updateEditingCollege(app.id, 'admRate', isNaN(numValue) ? '' : numValue.toString());
                                    }}
                                    className="flex rounded-md border-input bg-background px-1 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full h-full border-0 focus:ring-0"
                                  />
                                ) : formatPercentage(app.admRate)}
                              </TableCell>
                              <TableCell className="py-4 px-1 text-center">
                                {!!editingColleges[app.id] ? (
                                  <Input 
                                    value={editingColleges[app.id]?.gradRate || ''}
                                    onChange={(e) => {
                                      const value = e.target.value.replace('%', '');
                                      const numValue = parseFloat(value) / 100;
                                      updateEditingCollege(app.id, 'gradRate', isNaN(numValue) ? '' : numValue.toString());
                                    }}
                                    className="flex rounded-md border-input bg-background px-1 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full h-full border-0 focus:ring-0"
                                  />
                                ) : formatPercentage(app.gradRate)}
                              </TableCell>
                              <TableCell className="py-4 px-1 text-center">
                                {!!editingColleges[app.id] ? (
                                  <Input 
                                    value={editingColleges[app.id]?.retRate || ''}
                                    onChange={(e) => {
                                      const value = e.target.value.replace('%', '');
                                      const numValue = parseFloat(value) / 100;
                                      updateEditingCollege(app.id, 'retRate', isNaN(numValue) ? '' : numValue.toString());
                                    }}
                                    className="flex rounded-md border-input bg-background px-1 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full h-full border-0 focus:ring-0"
                                  />
                                ) : formatPercentage(app.retRate)}
                              </TableCell>
                              <TableCell className="py-4 px-1 text-center">
                                {!!editingColleges[app.id] ? (
                                  <Input 
                                    value={editingColleges[app.id]?.control === '1' 
                                      ? editingColleges[app.id]?.AvgNetPricPub 
                                      : editingColleges[app.id]?.AvgNetPricePriv || ''} 
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/^\$/, '');
                                      updateEditingCollege(app.id, 
                                        editingColleges[app.id]?.control === '1' ? 'AvgNetPricPub' : 'AvgNetPricePriv', 
                                        value
                                      );
                                    }}
                                    placeholder="Avg Net Price"
                                    className="flex rounded-md border-input bg-background px-1 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full h-full border-0 focus:ring-0"
                                  />
                                ) : (
                                  <span>
                                    {app.control === '1' 
                                      ? `$${app.AvgNetPricPub}` 
                                      : `$${app.AvgNetPricePriv}`}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="py-4 px-1 text-center">
                                {!!editingColleges[app.id] ? (
                                  <Input 
                                    value={getEstimatedNetPrice(editingColleges[app.id], userProfile.familyIncome).replace('$', '')}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/[^0-9]/g, '');
                                      const newApp = { ...editingColleges[app.id] };
                                      if (newApp.control === '1') {
                                        newApp.netPricePub030 = value;
                                        newApp.netPricePub3048 = value;
                                        newApp.netPricePub4875 = value;
                                        newApp.netPricePub75110 = value;
                                        newApp.netPricePriv110plus = value;
                                      } else {
                                        newApp.netPricePriv030 = value;
                                        newApp.netPricePriv3048 = value;
                                        newApp.netPricePriv4875 = value;
                                        newApp.netPricePriv75110 = value;
                                        newApp.netPricePriv110plus = value;
                                      }
                                      setEditingColleges({ ...editingColleges, [app.id]: newApp });
                                    }}
                                    className="flex rounded-md border-input bg-background px-1 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full h-full border-0 focus:ring-0"
                                  />
                                ) : (
                                  <a 
                                    href={app.npcUrl && !app.npcUrl.startsWith('http') ? `https://${app.npcUrl}` : app.npcUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-indigo-800 hover:text-indigo-900 hover:underline"
                                  >
                                    {getEstimatedNetPrice(app, userProfile.familyIncome)}
                                  </a>
                                )}
                              </TableCell>
                              <TableCell className="py-4 px-1 text-center">
                                <TestScoreRange
                                  min25={parseInt(app.satRead25) + parseInt(app.satMath25)}
                                  max75={parseInt(app.satRead75) + parseInt(app.satMath75)}
                                  userScore={userProfile.sat}
                                  label=""
                                />
                              </TableCell>
                              <TableCell className="py-4 px-1 text-center">
                                {!!editingColleges[app.id] ? (
                                  <div className="flex justify-center items-center">
                                    <select
                                      value={editingColleges[app.id]?.testPolicy || ''}
                                      onChange={(e) => updateEditingCollege(app.id, 'testPolicy', e.target.value)}
                                      className="flex rounded-md border-input bg-background px-1 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full h-full border-0 focus:ring-0"
                                    >
                                      <option value="1">Required</option>
                                      <option value="2">Recommended</option>
                                      <option value="3">Neither required nor recommended</option>
                                      <option value="4">N/A</option>
                                      <option value="5">Considered but not required</option>
                                    </select>
                                  </div>
                                ) : (
                                  <div className="flex justify-center items-center h-full">
                                    <span>
                                      {getTestPolicyDisplay(app.testPolicy)}
                                    </span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="py-4 px-1 text-center">
                                {!!editingColleges[app.id] ? (
                                  <div className="flex justify-center items-center">
                                    <select
                                      value={editingColleges[app.id]?.essayPolicy || ''}
                                      onChange={(e) => updateEditingCollege(app.id, 'essayPolicy', e.target.value)}
                                      className="flex rounded-md border-input bg-background px-1 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full h-full border-0 focus:ring-0"
                                    >
                                      <option value="">Not Required</option>
                                      <option value="1">Required</option>
                                    </select>
                                  </div>
                                ) : (
                                  <div className="flex justify-center items-center h-full">
                                    {app.essayPolicy === "1" && (
                                      <span className="text-red-500">R</span>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="py-4 px-1 text-center w-[350px]">
                                {app.essayPrompts?.map((prompt, promptIndex) => (
                                  <Popover key={promptIndex}>
                                    <PopoverTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        className="w-full max-w-[320px] justify-center mb-2 px-2 truncate"
                                        data-popover-trigger={`${app.id}-${promptIndex}`}
                                      >
                                        {prompt.isRequired ? (
                                          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0 text-red-500" />
                                        ) : (
                                          <Check className="h-4 w-4 mr-1 flex-shrink-0 text-yellow-500" />
                                        )}
                                        <span className="font-medium mr-1">{prompt.wordCount}</span>
                                        <div className="w-px h-full bg-gray-200 ml-1 mr-2 flex-shrink-0"></div>
                                        <span className="truncate max-w-[220px]">{prompt.prompt}</span>
                                        <ChevronDown className="h-4 w-4 ml-auto flex-shrink-0" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                      <div className="space-y-4">
                                        <textarea
                                          value={prompt.prompt}
                                          onChange={(e) => updateEssayPrompt(app.id, promptIndex, 'prompt', e.target.value)}
                                          placeholder="Essay prompt"
                                          rows={4}
                                          className="w-full p-2 text-sm border rounded-md resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                        />
                                        <div className="flex items-center space-x-2">
                                          <Label htmlFor={`wordCount-${app.id}-${promptIndex}`} className="flex-shrink-0">
                                            Word count:
                                          </Label>
                                          <Input
                                            id={`wordCount-${app.id}-${promptIndex}`}
                                            type="number"
                                            value={prompt.wordCount}
                                            onChange={(e) => updateEssayPrompt(app.id, promptIndex, 'wordCount', parseInt(e.target.value))}
                                            placeholder="Word count"
                                            className="flex-grow"
                                          />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Switch
                                            id={`required-${app.id}-${promptIndex}`}
                                            checked={prompt.isRequired}
                                            onCheckedChange={(checked) => updateEssayPrompt(app.id, promptIndex, 'isRequired', checked)}
                                          />
                                          <Label htmlFor={`required-${app.id}-${promptIndex}`}>Required</Label>
                                        </div>
                                        <div className="flex justify-between items-center space-x-2">
                                          <Button
                                            onClick={() => saveAndCloseEssayPrompt(app.id, promptIndex)}
                                            className="flex-grow px-4 py-2 bg-white text-green-500 border border-green-500 rounded-md hover:bg-green-50 transition-colors"
                                          >
                                            Save
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeEssayPrompt(app.id, promptIndex)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                ))}
                                <button
                                  onClick={() => addEssayPrompt(app.id)}
                                  className="w-full max-w-[320px] text-gray-500 hover:text-blue-700 transition-colors text-sm mt-2"
                                >
                                  + Add prompt
                                </button>
                              </TableCell>
                              <TableCell className="py-4 px-1 text-center">
                                {!!editingColleges[app.id] ? (
                                  <div className="flex flex-col space-y-2">
                                  <Input 
                                      value={editingColleges[app.id]?.ed || ''} 
                                      onChange={(e) => updateEditingCollege(app.id, 'ed', e.target.value)}
                                      placeholder="ED"
                                      className="flex rounded-md border-input bg-background px-1 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full h-full border-0 focus:ring-0"
                                    />
                                    <Input 
                                      value={editingColleges[app.id]?.ea || ''} 
                                      onChange={(e) => updateEditingCollege(app.id, 'ea', e.target.value)}
                                      placeholder="EA"
                                      className="flex rounded-md border-input bg-background px-1 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full h-full border-0 focus:ring-0"
                                    />
                                    <Input 
                                      value={editingColleges[app.id]?.rd || ''} 
                                      onChange={(e) => updateEditingCollege(app.id, 'rd', e.target.value)}
                                      placeholder="RD"
                                      className="flex rounded-md border-input bg-background px-1 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full h-full border-0 focus:ring-0"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center space-y-1">
                                    {app.ed && (
                                      <Badge 
                                        className={`${customBadgeVariants["ghost-red"]} w-full justify-center`}
                                      >
                                        {`ED: ${formatDate(app.ed)}`}
                                      </Badge>
                                    )}
                                    {app.ea && (
                                      <Badge 
                                        className={`${customBadgeVariants["ghost-yellow"]} w-full justify-center`}
                                      >
                                        {`EA: ${formatDate(app.ea)}`}
                                      </Badge>
                                    )}
                                    {app.rd && (
                                      <Badge 
                                        className={`${customBadgeVariants["ghost-green"]} w-full justify-center`}
                                      >
                                        {`RD: ${formatDate(app.rd)}`}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="py-4 px-1 text-center">
                                {!!editingColleges[app.id] ? (
                                  <Input 
                                    value={editingColleges[app.id]?.commonApp || ''} 
                                    onChange={(e) => updateEditingCollege(app.id, 'commonApp', e.target.value)}
                                    className="flex rounded-md border-input bg-background px-1 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full h-full border-0 focus:ring-0"
                                  />
                                ) : getCommonAppDisplay(app.commonApp)}
                              </TableCell>
                              <TableCell className="py-4 px-1 text-center">
                                {!!editingColleges[app.id] ? (
                                  <Input 
                                    type="number" 
                                    value={editingColleges[app.id]?.lor || 0} 
                                    onChange={(e) => updateEditingCollege(app.id, 'lor', parseInt(e.target.value))}
                                    className="flex rounded-md border-input bg-background px-1 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full h-full border-0 focus:ring-0"
                                  />
                                ) : app.lor}
                              </TableCell>
                              <TableCell className="py-4 px-1 text-center">
                                {!!editingColleges[app.id] ? (
                                  <div className="flex items-center justify-center">
                                    <span className="mr-1">$</span>
                                    <Input 
                                      type="number" 
                                      value={editingColleges[app.id]?.fee || ''} 
                                      onChange={(e) => updateEditingCollege(app.id, 'fee', e.target.value ? parseInt(e.target.value) : '')}
                                      className="flex rounded-md border-input bg-background px-1 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-20 h-full border-0 focus:ring-0"
                                    />
                                  </div>
                                ) : (
                                  <span>{app.fee ? `$${app.fee}` : ''}</span>
                                )}
                              </TableCell>
                              <TableCell className="py-4 px-1 text-right">
                                {!!editingColleges[app.id] ? (
                                  <div className="flex justify-end space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      className="h-8 w-8 p-0"
                                      onClick={() => saveEditing(app.id)}
                                    >
                                      <span className="sr-only">Save changes</span>
                                      <Check className="h-4 w-4 text-green-500" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      className="h-8 w-8 p-0"
                                      onClick={() => cancelEditing(app.id)}
                                    >
                                      <span className="sr-only">Cancel editing</span>
                                      <X className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex justify-end">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          className="h-8 w-8 p-0"
                                        >
                                          <span className="sr-only">Open menu</span>
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => startEditing(app)}>
                                          <Pencil className="mr-2 h-4 w-4" />
                                          <span>Edit</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => removeCollege(app.id)}>
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          <span>Delete</span>
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </TableBody>
                  )}
                </Droppable>
              </Table>
            </DragDropContext>
          </div>
        </div>
      </main>

      <AlertDialog open={!!collegeToRemove} onOpenChange={() => setCollegeToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the college from your list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveCollege}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CollegeApplicationTracker;