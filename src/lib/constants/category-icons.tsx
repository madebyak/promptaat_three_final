import {
  // Business & Finance
  Building2, Briefcase, CreditCard, PiggyBank, TrendingUp, LineChart, DollarSign, Receipt, 
  Landmark, BadgePercent, Building, Wallet, ShoppingCart, ShoppingBag,
  
  // Education & Knowledge
  GraduationCap, BookOpen, Book, Library, School, PenTool, Lightbulb, Brain,
  
  // Technology
  Laptop, Smartphone, Tablet, Monitor, Cpu, Server, Database, Code2, Globe, Wifi,
  
  // Media & Content
  Image, VideoIcon, Music2, FileText, Film, Camera, Newspaper, MessageSquare, Mail,
  
  // Health & Wellness
  Stethoscope, HeartPulse, Activity, Thermometer, Pill, Apple, Dumbbell, 
  
  // Travel & Places
  MapPin, Map, Compass, Plane, Car, Bus, Train, Hotel, Palmtree, Mountain, Navigation,
  
  // Home & Lifestyle
  Home, Coffee, Utensils, Bed, Sofa, ShowerHead, Shirt, Scissors, Baby,
  
  // Nature & Environment
  Leaf, Sun, Cloud, Droplets, Wind, Flower2, Trees, Sprout,
  
  // Arts & Entertainment
  Palette, Gamepad2, Ticket, Music, Tv, Radio, Popcorn, Clapperboard,
  
  // Professional & Services
  Scale, Gavel, Wrench, Hammer, Truck, Shield, Users, UserCircle,
  
  // Miscellaneous
  Star, Bell, Calendar, Clock, Search, Settings, Tag, Flag, Award,
  
  // Type definition
  type LucideIcon
} from 'lucide-react'
import { ReactElement } from 'react';

export interface IconInfo {
  name: string;
  icon: ReactElement;
}

// Group icons by category for better organization
export const categoryIconGroups = {
  "Business & Finance": {
    building2: Building2,
    briefcase: Briefcase,
    creditCard: CreditCard,
    piggyBank: PiggyBank,
    trendingUp: TrendingUp,
    lineChart: LineChart,
    dollarSign: DollarSign,
    receipt: Receipt,
    landmark: Landmark,
    badgePercent: BadgePercent,
    building: Building,
    wallet: Wallet,
    shoppingCart: ShoppingCart,
    shoppingBag: ShoppingBag
  },
  "Education & Knowledge": {
    graduationCap: GraduationCap,
    bookOpen: BookOpen,
    book: Book,
    library: Library,
    school: School,
    penTool: PenTool,
    lightbulb: Lightbulb,
    brain: Brain
  },
  "Technology": {
    laptop: Laptop,
    smartphone: Smartphone,
    tablet: Tablet,
    monitor: Monitor,
    cpu: Cpu,
    server: Server,
    database: Database,
    code2: Code2,
    globe: Globe,
    wifi: Wifi
  },
  "Media & Content": {
    image: Image,
    videoIcon: VideoIcon,
    music2: Music2,
    fileText: FileText,
    film: Film,
    camera: Camera,
    newspaper: Newspaper,
    messageSquare: MessageSquare,
    mail: Mail
  },
  "Health & Wellness": {
    stethoscope: Stethoscope,
    heartPulse: HeartPulse,
    activity: Activity,
    thermometer: Thermometer,
    pill: Pill,
    apple: Apple,
    dumbbell: Dumbbell
  },
  "Travel & Places": {
    mapPin: MapPin,
    map: Map,
    compass: Compass,
    plane: Plane,
    car: Car,
    bus: Bus,
    train: Train,
    hotel: Hotel,
    palmtree: Palmtree,
    mountain: Mountain,
    navigation: Navigation
  },
  "Home & Lifestyle": {
    home: Home,
    coffee: Coffee,
    utensils: Utensils,
    bed: Bed,
    sofa: Sofa,
    showerHead: ShowerHead,
    shirt: Shirt,
    scissors: Scissors,
    baby: Baby
  },
  "Nature & Environment": {
    leaf: Leaf,
    sun: Sun,
    cloud: Cloud,
    droplets: Droplets,
    wind: Wind,
    flower2: Flower2,
    trees: Trees,
    sprout: Sprout
  },
  "Arts & Entertainment": {
    palette: Palette,
    gamepad2: Gamepad2,
    ticket: Ticket,
    music: Music,
    tv: Tv,
    radio: Radio,
    popcorn: Popcorn,
    clapperboard: Clapperboard
  },
  "Professional & Services": {
    scale: Scale,
    gavel: Gavel,
    wrench: Wrench,
    hammer: Hammer,
    truck: Truck,
    shield: Shield,
    users: Users,
    userCircle: UserCircle
  },
  "Miscellaneous": {
    star: Star,
    bell: Bell,
    calendar: Calendar,
    clock: Clock,
    search: Search,
    settings: Settings,
    tag: Tag,
    flag: Flag,
    award: Award
  }
};

// Flat map of all icons for easy lookup
export const categoryIcons: Record<string, IconInfo> = Object.entries(categoryIconGroups)
  .reduce((acc, [category, icons]) => {
    const iconEntries = Object.entries(icons).map(([key, Icon]) => [
      key,
      {
        name: key,
        icon: <Icon className="h-4 w-4" />,
      },
    ]);
    return { ...acc, ...Object.fromEntries(iconEntries) };
  }, {});

// Get recently used icons from localStorage (if available)
export function getRecentlyUsedIcons(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const recentIcons = localStorage.getItem('recentCategoryIcons');
    return recentIcons ? JSON.parse(recentIcons) : [];
  } catch (error) {
    console.error('Error getting recently used icons:', error);
    return [];
  }
}

// Add an icon to recently used
export function addToRecentlyUsedIcons(iconName: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const recentIcons = getRecentlyUsedIcons();
    const updatedIcons = [
      iconName,
      ...recentIcons.filter(name => name !== iconName)
    ].slice(0, 8); // Keep only the 8 most recent
    
    localStorage.setItem('recentCategoryIcons', JSON.stringify(updatedIcons));
  } catch (error) {
    console.error('Error saving recently used icons:', error);
  }
}

// Get a specific icon by name
export function getCategoryIcon(iconName: string | null): ReactElement | null {
  if (!iconName) return null;
  const IconComponent = categoryIcons[iconName]?.icon;
  return IconComponent || null;
}
