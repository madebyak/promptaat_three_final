"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  UserCheck, 
  UserX, 
  Key, 
  Eye,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  BookmarkIcon,
  Download
} from "lucide-react";
import { fetchUsers, updateUserStatus, resetUserPassword, UserData, PaginationParams } from "@/lib/api/cms/users";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function UsersManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState<"all" | "subscribed" | "none">("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ 
    isOpen: boolean; 
    userId: string | null; 
    tempPassword: string | null 
  }>({
    isOpen: false,
    userId: null,
    tempPassword: null
  });
  
  const [userDetailsDialog, setUserDetailsDialog] = useState<{
    isOpen: boolean;
    user: UserData | null;
  }>({
    isOpen: false,
    user: null
  });
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch users with pagination and search
  const { 
    data: paginatedResponse, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ["cms-users", debouncedSearchQuery, currentPage, pageSize],
    queryFn: () => fetchUsers({ 
      search: debouncedSearchQuery, 
      page: currentPage, 
      pageSize 
    }),
  });

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: string) => {
    setPageSize(parseInt(newSize));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Toggle user active status
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateUserStatus(userId, !currentStatus);
      toast({
        title: "User status updated",
        description: `User has been ${!currentStatus ? "activated" : "deactivated"} successfully.`,
      });
      refetch();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  // Reset user password
  const handleResetPassword = async (userId: string) => {
    try {
      const result = await resetUserPassword(userId);
      setResetPasswordDialog({
        isOpen: true,
        userId,
        tempPassword: result.temporaryPassword
      });
      toast({
        title: "Password reset",
        description: "User password has been reset successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to reset user password",
        variant: "destructive",
      });
    }
  };

  // Format date to relative time
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {  // Empty catch block without unused variable
      return "Invalid date";
    }
  };
  
  // Handle viewing user details
  const handleViewUserDetails = (user: UserData) => {
    setUserDetailsDialog({
      isOpen: true,
      user
    });
  };
  
  // Format date to full date
  const formatFullDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {  // Empty catch block without unused variable
      return "Invalid date";
    }
  };

  // Country code to country name mapping
  const getCountryName = (countryCode: string | null | undefined): string => {
    if (!countryCode) return "—";
    
    const countryMap: Record<string, string> = {
      'af': 'Afghanistan',
      'al': 'Albania',
      'dz': 'Algeria',
      'as': 'American Samoa',
      'ad': 'Andorra',
      'ao': 'Angola',
      'ai': 'Anguilla',
      'aq': 'Antarctica',
      'ag': 'Antigua and Barbuda',
      'ar': 'Argentina',
      'am': 'Armenia',
      'aw': 'Aruba',
      'au': 'Australia',
      'at': 'Austria',
      'az': 'Azerbaijan',
      'bs': 'Bahamas',
      'bh': 'Bahrain',
      'bd': 'Bangladesh',
      'bb': 'Barbados',
      'by': 'Belarus',
      'be': 'Belgium',
      'bz': 'Belize',
      'bj': 'Benin',
      'bm': 'Bermuda',
      'bt': 'Bhutan',
      'bo': 'Bolivia',
      'ba': 'Bosnia and Herzegovina',
      'bw': 'Botswana',
      'bv': 'Bouvet Island',
      'br': 'Brazil',
      'io': 'British Indian Ocean Territory',
      'bn': 'Brunei Darussalam',
      'bg': 'Bulgaria',
      'bf': 'Burkina Faso',
      'bi': 'Burundi',
      'kh': 'Cambodia',
      'cm': 'Cameroon',
      'ca': 'Canada',
      'cv': 'Cape Verde',
      'ky': 'Cayman Islands',
      'cf': 'Central African Republic',
      'td': 'Chad',
      'cl': 'Chile',
      'cn': 'China',
      'cx': 'Christmas Island',
      'cc': 'Cocos (Keeling) Islands',
      'co': 'Colombia',
      'km': 'Comoros',
      'cg': 'Congo',
      'cd': 'Congo, the Democratic Republic of the',
      'ck': 'Cook Islands',
      'cr': 'Costa Rica',
      'ci': 'Cote D\'Ivoire',
      'hr': 'Croatia',
      'cu': 'Cuba',
      'cy': 'Cyprus',
      'cz': 'Czech Republic',
      'dk': 'Denmark',
      'dj': 'Djibouti',
      'dm': 'Dominica',
      'do': 'Dominican Republic',
      'ec': 'Ecuador',
      'eg': 'Egypt',
      'sv': 'El Salvador',
      'gq': 'Equatorial Guinea',
      'er': 'Eritrea',
      'ee': 'Estonia',
      'et': 'Ethiopia',
      'fk': 'Falkland Islands (Malvinas)',
      'fo': 'Faroe Islands',
      'fj': 'Fiji',
      'fi': 'Finland',
      'fr': 'France',
      'gf': 'French Guiana',
      'pf': 'French Polynesia',
      'tf': 'French Southern Territories',
      'ga': 'Gabon',
      'gm': 'Gambia',
      'ge': 'Georgia',
      'de': 'Germany',
      'gh': 'Ghana',
      'gi': 'Gibraltar',
      'gr': 'Greece',
      'gl': 'Greenland',
      'gd': 'Grenada',
      'gp': 'Guadeloupe',
      'gu': 'Guam',
      'gt': 'Guatemala',
      'gn': 'Guinea',
      'gw': 'Guinea-Bissau',
      'gy': 'Guyana',
      'ht': 'Haiti',
      'hm': 'Heard Island and Mcdonald Islands',
      'va': 'Holy See (Vatican City State)',
      'hn': 'Honduras',
      'hk': 'Hong Kong',
      'hu': 'Hungary',
      'is': 'Iceland',
      'in': 'India',
      'id': 'Indonesia',
      'ir': 'Iran, Islamic Republic of',
      'iq': 'Iraq',
      'ie': 'Ireland',
      'il': 'Israel',
      'it': 'Italy',
      'jm': 'Jamaica',
      'jp': 'Japan',
      'jo': 'Jordan',
      'kz': 'Kazakhstan',
      'ke': 'Kenya',
      'ki': 'Kiribati',
      'kp': 'Korea, Democratic People\'s Republic of',
      'kr': 'Korea, Republic of',
      'kw': 'Kuwait',
      'kg': 'Kyrgyzstan',
      'la': 'Lao People\'s Democratic Republic',
      'lv': 'Latvia',
      'lb': 'Lebanon',
      'ls': 'Lesotho',
      'lr': 'Liberia',
      'ly': 'Libyan Arab Jamahiriya',
      'li': 'Liechtenstein',
      'lt': 'Lithuania',
      'lu': 'Luxembourg',
      'mo': 'Macao',
      'mk': 'Macedonia, the Former Yugoslav Republic of',
      'mg': 'Madagascar',
      'mw': 'Malawi',
      'my': 'Malaysia',
      'mv': 'Maldives',
      'ml': 'Mali',
      'mt': 'Malta',
      'mh': 'Marshall Islands',
      'mq': 'Martinique',
      'mr': 'Mauritania',
      'mu': 'Mauritius',
      'yt': 'Mayotte',
      'mx': 'Mexico',
      'fm': 'Micronesia, Federated States of',
      'md': 'Moldova, Republic of',
      'mc': 'Monaco',
      'mn': 'Mongolia',
      'ms': 'Montserrat',
      'ma': 'Morocco',
      'mz': 'Mozambique',
      'mm': 'Myanmar',
      'na': 'Namibia',
      'nr': 'Nauru',
      'np': 'Nepal',
      'nl': 'Netherlands',
      'an': 'Netherlands Antilles',
      'nc': 'New Caledonia',
      'nz': 'New Zealand',
      'ni': 'Nicaragua',
      'ne': 'Niger',
      'ng': 'Nigeria',
      'nu': 'Niue',
      'nf': 'Norfolk Island',
      'mp': 'Northern Mariana Islands',
      'no': 'Norway',
      'om': 'Oman',
      'pk': 'Pakistan',
      'pw': 'Palau',
      'ps': 'Palestinian Territory, Occupied',
      'pa': 'Panama',
      'pg': 'Papua New Guinea',
      'py': 'Paraguay',
      'pe': 'Peru',
      'ph': 'Philippines',
      'pn': 'Pitcairn',
      'pl': 'Poland',
      'pt': 'Portugal',
      'pr': 'Puerto Rico',
      'qa': 'Qatar',
      're': 'Reunion',
      'ro': 'Romania',
      'ru': 'Russian Federation',
      'rw': 'Rwanda',
      'sh': 'Saint Helena',
      'kn': 'Saint Kitts and Nevis',
      'lc': 'Saint Lucia',
      'pm': 'Saint Pierre and Miquelon',
      'vc': 'Saint Vincent and the Grenadines',
      'ws': 'Samoa',
      'sm': 'San Marino',
      'st': 'Sao Tome and Principe',
      'sa': 'Saudi Arabia',
      'sn': 'Senegal',
      'cs': 'Serbia and Montenegro',
      'sc': 'Seychelles',
      'sl': 'Sierra Leone',
      'sg': 'Singapore',
      'sk': 'Slovakia',
      'si': 'Slovenia',
      'sb': 'Solomon Islands',
      'so': 'Somalia',
      'za': 'South Africa',
      'gs': 'South Georgia and the South Sandwich Islands',
      'es': 'Spain',
      'lk': 'Sri Lanka',
      'sd': 'Sudan',
      'sr': 'Suriname',
      'sj': 'Svalbard and Jan Mayen',
      'sz': 'Swaziland',
      'se': 'Sweden',
      'ch': 'Switzerland',
      'sy': 'Syrian Arab Republic',
      'tw': 'Taiwan, Province of China',
      'tj': 'Tajikistan',
      'tz': 'Tanzania, United Republic of',
      'th': 'Thailand',
      'tl': 'Timor-Leste',
      'tg': 'Togo',
      'tk': 'Tokelau',
      'to': 'Tonga',
      'tt': 'Trinidad and Tobago',
      'tn': 'Tunisia',
      'tr': 'Turkey',
      'tm': 'Turkmenistan',
      'tc': 'Turks and Caicos Islands',
      'tv': 'Tuvalu',
      'ug': 'Uganda',
      'ua': 'Ukraine',
      'ae': 'United Arab Emirates',
      'gb': 'United Kingdom',
      'us': 'United States',
      'um': 'United States Minor Outlying Islands',
      'uy': 'Uruguay',
      'uz': 'Uzbekistan',
      'vu': 'Vanuatu',
      've': 'Venezuela',
      'vn': 'Vietnam',
      'vg': 'Virgin Islands, British',
      'vi': 'Virgin Islands, U.S.',
      'wf': 'Wallis and Futuna',
      'eh': 'Western Sahara',
      'ye': 'Yemen',
      'zm': 'Zambia',
      'zw': 'Zimbabwe'
    };
    
    // Convert to lowercase for case-insensitive matching
    const code = countryCode.toLowerCase().trim();
    return countryMap[code] || code.toUpperCase(); // Return the country name or the code in uppercase if not found
  };
  
  // Handle exporting users to CSV
  const handleExportUsers = async () => {
    try {
      // Fetch all users for export (with a large page size to get as many as possible)
      const exportResponse = await fetchUsers({ pageSize: 1000 });
      
      if (!exportResponse || !exportResponse.data || exportResponse.data.length === 0) {
        toast({
          title: "Export failed",
          description: "No users found to export",
          variant: "destructive",
        });
        return;
      }
      
      // Prepare CSV content
      const headers = [
        "ID",
        "First Name",
        "Last Name",
        "Email",
        "Country",
        "Status",
        "Subscription",
        "Created At"
      ];
      
      const rows = exportResponse.data.map(user => [
        user.id,
        user.firstName,
        user.lastName,
        user.email,
        user.country || "",
        user.isActive ? "Active" : "Inactive",
        user.subscription ? user.subscription.status : "None",
        new Date(user.createdAt).toISOString().split("T")[0]
      ]);
      
      // Convert to CSV string
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      ].join("\n");
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `users-export-${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: `${exportResponse.data.length} users exported to CSV`,
      });
    } catch (err) {
      toast({
        title: "Export failed",
        description: err instanceof Error ? err.message : "Failed to export users",
        variant: "destructive",
      });
    }
  };

  // Handle bulk selection of users
  const handleSelectUser = (userId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  // Handle select all users
  const handleSelectAllUsers = (isChecked: boolean) => {
    if (isChecked && paginatedResponse) {
      const filteredUsers = paginatedResponse.data
        .filter(user => {
          // Apply status filter
          if (statusFilter === "active" && !user.isActive) return false;
          if (statusFilter === "inactive" && user.isActive) return false;
          
          // Apply subscription filter
          if (subscriptionFilter === "subscribed" && !user.subscription) return false;
          if (subscriptionFilter === "none" && user.subscription) return false;
          
          return true;
        })
        .map(user => user.id);
      setSelectedUsers(filteredUsers);
    } else {
      setSelectedUsers([]);
    }
  };

  // Handle bulk activation/deactivation
  const handleBulkStatusChange = async (activate: boolean) => {
    if (selectedUsers.length === 0) return;

    try {
      // Create an array of promises for each user status update
      const updatePromises = selectedUsers.map(userId => 
        updateUserStatus(userId, activate)
      );

      // Wait for all promises to resolve
      await Promise.all(updatePromises);

      toast({
        title: `${activate ? 'Activated' : 'Deactivated'} ${selectedUsers.length} users`,
        description: `Successfully ${activate ? 'activated' : 'deactivated'} ${selectedUsers.length} users.`,
      });

      // Clear selection and refetch data
      setSelectedUsers([]);
      setBulkActionOpen(false);
      refetch();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  // Calculate user metrics for the dashboard
  const calculateMetrics = () => {
    if (!paginatedResponse || !paginatedResponse.data) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        subscribedUsers: 0
      };
    }

    const totalUsers = paginatedResponse.pagination.total;
    const activeUsers = paginatedResponse.data.filter(user => user.isActive).length;
    const inactiveUsers = paginatedResponse.data.filter(user => !user.isActive).length;
    const subscribedUsers = paginatedResponse.data.filter(user => user.subscription).length;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      subscribedUsers
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="space-y-4">
      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {"An error occurred while fetching users"}
          </AlertDescription>
        </Alert>
      )}
      
      {/* User Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Active Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.inactiveUsers}</div>
              <p className="text-xs text-muted-foreground">Inactive Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.subscribedUsers}</div>
              <p className="text-xs text-muted-foreground">Subscribed Users</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{selectedUsers.length} users selected</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedUsers([])}
                >
                  Clear Selection
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => setBulkActionOpen(true)}
                >
                  Bulk Actions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage your users and subscriptions
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleExportUsers} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Users
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or country..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search users"
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="status-filter">Status:</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value as "all" | "active" | "inactive");
                    setCurrentPage(1); // Reset to first page when filter changes
                  }}
                >
                  <SelectTrigger id="status-filter" className="w-[130px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="subscription-filter">Subscription:</Label>
                <Select
                  value={subscriptionFilter}
                  onValueChange={(value) => {
                    setSubscriptionFilter(value as "all" | "subscribed" | "none");
                    setCurrentPage(1); // Reset to first page when filter changes
                  }}
                >
                  <SelectTrigger id="subscription-filter" className="w-[130px]">
                    <SelectValue placeholder="Filter by subscription" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="subscribed">Subscribed</SelectItem>
                    <SelectItem value="none">No Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            {isLoading ? (
              <div className="flex justify-center items-center p-4 h-32">
                <Spinner size="lg" />
              </div>
            ) : paginatedResponse && paginatedResponse.data.length > 0 ? (
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30px]">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={selectedUsers.length > 0 && 
                              paginatedResponse.data.filter(user => {
                                if (statusFilter === "active" && !user.isActive) return false;
                                if (statusFilter === "inactive" && user.isActive) return false;
                                if (subscriptionFilter === "subscribed" && !user.subscription) return false;
                                if (subscriptionFilter === "none" && user.subscription) return false;
                                return true;
                              }).every(user => selectedUsers.includes(user.id))}
                            onChange={(e) => handleSelectAllUsers(e.target.checked)}
                          />
                        </div>
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedResponse.data
                    .filter(user => {
                      // Apply status filter
                      if (statusFilter === "active" && !user.isActive) return false;
                      if (statusFilter === "inactive" && user.isActive) return false;
                      
                      // Apply subscription filter
                      if (subscriptionFilter === "subscribed" && !user.subscription) return false;
                      if (subscriptionFilter === "none" && user.subscription) return false;
                      
                      return true;
                    })
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              checked={selectedUsers.includes(user.id)}
                              onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getCountryName(user.country)}</TableCell>
                        <TableCell>
                          {user.isActive ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.subscription ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {user.subscription.status}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              None
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toggleUserStatus(user.id, user.isActive)}>
                                {user.isActive ? (
                                  <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    <span>Deactivate</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    <span>Activate</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                                <Key className="mr-2 h-4 w-4" />
                                <span>Reset Password</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewUserDetails(user)}>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Show message when no users match filters */}
                    {paginatedResponse.data.length > 0 && 
                     paginatedResponse.data.filter(user => {
                       if (statusFilter === "active" && !user.isActive) return false;
                       if (statusFilter === "inactive" && user.isActive) return false;
                       if (subscriptionFilter === "subscribed" && !user.subscription) return false;
                       if (subscriptionFilter === "none" && user.subscription) return false;
                       return true;
                     }).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6">
                          <p className="text-muted-foreground">No users match the selected filters</p>
                          <Button 
                            variant="link" 
                            className="mt-2" 
                            onClick={() => {
                              setStatusFilter("all");
                              setSubscriptionFilter("all");
                            }}
                          >
                            Clear filters
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-4 py-4 border-t">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                      Showing
                      <Select
                        value={pageSize.toString()}
                        onValueChange={handlePageSizeChange}
                      >
                        <SelectTrigger className="h-8 w-[70px] mx-2">
                          <SelectValue placeholder={pageSize.toString()} />
                        </SelectTrigger>
                        <SelectContent side="top">
                          {[10, 20, 50, 100].map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      of {paginatedResponse.pagination.total} users
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!paginatedResponse.pagination.hasPrevPage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous Page</span>
                    </Button>
                    <div className="flex items-center justify-center text-sm font-medium">
                      Page {currentPage} of {paginatedResponse.pagination.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!paginatedResponse.pagination.hasNextPage}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next Page</span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center">
                <p>No users found.</p>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setResetPasswordDialog({ isOpen: false, userId: null, tempPassword: null });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Reset</DialogTitle>
            <DialogDescription>
              The user's password has been reset successfully. Please share the temporary password with the user.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 p-3 bg-gray-100 rounded-md font-mono text-center">
            {resetPasswordDialog.tempPassword}
          </div>
          <DialogFooter>
            <Button onClick={() => setResetPasswordDialog({ isOpen: false, userId: null, tempPassword: null })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={userDetailsDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setUserDetailsDialog({ isOpen: false, user: null });
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about the user.
            </DialogDescription>
          </DialogHeader>
          
          {userDetailsDialog.user && (
            <div className="space-y-6">
              {/* User basic info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                      {userDetailsDialog.user.firstName.charAt(0)}{userDetailsDialog.user.lastName.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">{userDetailsDialog.user.firstName} {userDetailsDialog.user.lastName}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="mr-1 h-3 w-3" />
                        {userDetailsDialog.user.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <Badge variant="outline" className={userDetailsDialog.user.isActive ? 
                        "bg-green-50 text-green-700 border-green-200" : 
                        "bg-red-50 text-red-700 border-red-200"}>
                        {userDetailsDialog.user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Country</p>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3 text-gray-400" />
                        <span>{getCountryName(userDetailsDialog.user.country)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Registered</p>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3 text-gray-400" />
                        <span>{formatFullDate(userDetailsDialog.user.createdAt)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Occupation</p>
                      <div className="flex items-center">
                        <Briefcase className="mr-1 h-3 w-3 text-gray-400" />
                        <span>{userDetailsDialog.user.occupation || "—"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Subscription info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  {userDetailsDialog.user.subscription ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {userDetailsDialog.user.subscription.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-500">Start Date</p>
                        <span>{formatFullDate(userDetailsDialog.user.subscription.startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-500">End Date</p>
                        <span>{formatFullDate(userDetailsDialog.user.subscription.endDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-500">Plan ID</p>
                        <span>{userDetailsDialog.user.subscription.planId}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No active subscription</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* User activity */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center justify-center mb-1 text-blue-600">
                        <BookmarkIcon className="h-4 w-4" />
                      </div>
                      <p className="text-2xl font-semibold">{userDetailsDialog.user._count?.bookmarks || 0}</p>
                      <p className="text-xs text-gray-500">Bookmarks</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center justify-center mb-1 text-purple-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-2xl font-semibold">{userDetailsDialog.user._count?.history || 0}</p>
                      <p className="text-xs text-gray-500">History</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center justify-center mb-1 text-green-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <p className="text-2xl font-semibold">{userDetailsDialog.user._count?.catalogs || 0}</p>
                      <p className="text-xs text-gray-500">Catalogs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setUserDetailsDialog({ isOpen: false, user: null })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog open={bulkActionOpen} onOpenChange={setBulkActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Apply actions to {selectedUsers.length} selected users.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Status Actions</h4>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleBulkStatusChange(true)}
                  className="flex-1"
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Activate All
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleBulkStatusChange(false)}
                  className="flex-1"
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Deactivate All
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
