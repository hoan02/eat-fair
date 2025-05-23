import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Command,
  CreditCard,
  File,
  FileText,
  HelpCircle,
  ImageIcon,
  Laptop,
  Loader2,
  Moon,
  MoreVertical,
  Pizza,
  Plus,
  Settings,
  SunMedium,
  Trash,
  Twitter,
  User,
  X,
  type LightbulbIcon as LucideProps,
  Coffee,
  Users,
  Receipt,
  LayoutDashboard,
  LogOut,
  UserPlus,
  Home,
  PieChart,
  FileDown,
  Filter,
  Edit,
  Trash2,
  Crown,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"

export const Icons = {
  logo: Coffee,
  close: X,
  spinner: Loader2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  trash: Trash,
  trash2: Trash2,
  settings: Settings,
  user: User,
  arrowRight: ArrowRight,
  help: HelpCircle,
  pizza: Pizza,
  sun: SunMedium,
  moon: Moon,
  laptop: Laptop,
  google: ({ ...props }: LucideProps) => (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="google"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 488 512"
      {...props}
    >
      <path
        fill="currentColor"
        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
      ></path>
    </svg>
  ),
  facebook: ({ ...props }: LucideProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" {...props}>
      <path
        fill="currentColor"
        d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"
      />
    </svg>
  ),
  twitter: Twitter,
  check: Check,
  warning: AlertTriangle,
  more: MoreVertical,
  image: ImageIcon,
  file: File,
  fileText: FileText,
  plus: Plus,
  creditCard: CreditCard,
  command: Command,
  coffee: Coffee,
  users: Users,
  receipt: Receipt,
  dashboard: LayoutDashboard,
  logout: LogOut,
  userPlus: UserPlus,
  home: Home,
  pieChart: PieChart,
  fileDown: FileDown,
  filter: Filter,
  edit: Edit,
  imageIcon: ImageIcon,
  crown: Crown,
  mail: Mail,
  phone: Phone,
  mapPin: MapPin,
}
