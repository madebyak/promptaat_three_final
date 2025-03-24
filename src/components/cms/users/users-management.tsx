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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  Calendar, 
  MapPin, 
  Briefcase,
  RefreshCw,
  Download,
  Check,
  X,
  Filter,
  BookmarkIcon,
  AlertCircle
} from "lucide-react";
import { 
  fetchUsers, 
  updateUserStatus, 
  resetUserPassword,
  type UserData as ApiUserData
} from "@/lib/api/cms/users";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscriptionManagementPanel } from "./subscription-management-panel";

// Define local UserData type that matches the component's expectations
type UserData = ApiUserData;

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
  const [bulkActionsDialogOpen, setBulkActionsDialogOpen] = useState(false);
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
  
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch users with pagination and search
  const { 
    data: paginatedResponse, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ["cms-users", debouncedSearchQuery, currentPage, pageSize, statusFilter, subscriptionFilter],
    queryFn: () => fetchUsers({ 
      search: debouncedSearchQuery, 
      page: currentPage, 
      pageSize,
      statusFilter,
      subscriptionFilter
    }),
  });

  // Stats for user counts
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    subscribed: 0
  });

  // Update stats when data changes
  useEffect(() => {
    if (paginatedResponse?.stats) {
      setStats(paginatedResponse.stats);
    }
  }, [paginatedResponse]);

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
    } catch {
      toast({
        title: "Error",
        description: "Failed to update user status",
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
    } catch {
      toast({
        title: "Error",
        description: "Failed to reset user password",
        variant: "destructive",
      });
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string, userEmail: string) => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/cms/users/${userId}/delete`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete user");
      }

      // Show success notification
      toast({
        title: "User deleted",
        description: `User ${userEmail} has been permanently deleted.`,
      });
      
      // Refresh the user list
      refetch();
      
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Error deleting user",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: "activate" | "deactivate" | "delete") => {
    if (selectedUsers.length === 0) return;
    
    setLoading(true);
    
    try {
      const response = await fetch("/api/cms/users/bulk-actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          userIds: selectedUsers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to perform bulk action");
      }

      // Show success notification
      const actionName = action === "activate" ? "activated" : action === "deactivate" ? "deactivated" : "deleted";
      
      toast({
        title: `${actionName.charAt(0).toUpperCase() + actionName.slice(1)} ${selectedUsers.length} users`,
        description: `Successfully ${actionName} ${selectedUsers.length} users.`,
      });
      
      // Clear selection and refresh data
      setSelectedUsers([]);
      refetch();
      
      // Close the dialog
      setBulkActionsDialogOpen(false);
      
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      toast({
        variant: "destructive",
        title: `Error performing bulk ${action}`,
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const formatDate = (dateString: string | Date) => {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Get badge color based on user status
  const getUserStatusBadgeVariant = (isActive: boolean): BadgeProps["variant"] => {
    return isActive ? "outline" : "destructive";
  };

  // Get badge color based on subscription status
  const getSubscriptionBadgeVariant = (status: string | undefined): BadgeProps["variant"] => {
    if (!status) return "outline";
    
    switch (status.toLowerCase()) {
      case "active":
      case "trialing":
        return "outline";
      case "canceled":
      case "incomplete":
      case "incomplete_expired":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Format user's name
  const formatName = (user: UserData) => {
    return `${user.firstName} ${user.lastName}`;
  };

  // Handle viewing user details
  const handleViewUserDetails = (user: UserData) => {
    setUserDetailsDialog({
      isOpen: true,
      user
    });
  };

  // Close user details dialog
  const closeUserDetailsDialog = () => {
    setUserDetailsDialog({
      isOpen: false,
      user: null
    });
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
    } catch {
      toast({
        title: "Export failed",
        description: "Failed to export users",
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

  return (
    <div className="space-y-6">
      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            An error occurred while fetching users
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-500">{stats.inactive}</div>
              <div className="text-sm text-muted-foreground">Inactive Users</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-500">{stats.subscribed}</div>
              <div className="text-sm text-muted-foreground">Subscribed Users</div>
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
                  onClick={() => setBulkActionsDialogOpen(true)}
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
                          {formatName(user)}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.country || "—"}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={getUserStatusBadgeVariant(user.isActive)} 
                            className="w-fit"
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.subscription ? (
                            <div className="flex flex-col">
                              <Badge 
                                variant={getSubscriptionBadgeVariant(user.subscription.status)} 
                                className="w-fit mb-1"
                              >
                                {user.subscription.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(user.subscription.startDate)} - {formatDate(user.subscription.endDate)}
                              </span>
                            </div>
                          ) : (
                            <Badge variant="outline">No subscription</Badge>
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
                                    <X className="mr-2 h-4 w-4" />
                                    <span>Deactivate</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="mr-2 h-4 w-4" />
                                    <span>Activate</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                <span>Reset Password</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewUserDetails(user)}>
                                <Filter className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setDeleteConfirmDialogOpen(true);
                                  setCurrentUser(user);
                                }}
                              >
                                Delete permanently
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
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">Don&apos;t see the user?</span>
                            <Button 
                              variant="link" 
                              className="h-auto p-0 text-xs" 
                              onClick={() => {
                                setCurrentPage(1);
                                setSearchQuery("");
                                setStatusFilter("all");
                                setSubscriptionFilter("all");
                              }}
                            >
                              Reset filters
                            </Button>
                          </div>
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
      <Dialog open={userDetailsDialog.isOpen} onOpenChange={(open) => !open && closeUserDetailsDialog()}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {userDetailsDialog.user && (
            <>
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>
                  Detailed information about {formatName(userDetailsDialog.user)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </h3>
                    <p className="text-sm">{userDetailsDialog.user.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Joined
                    </h3>
                    <p className="text-sm">{formatDate(userDetailsDialog.user.createdAt)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Country
                    </h3>
                    <p className="text-sm">{userDetailsDialog.user.country || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Briefcase className="h-4 w-4" /> Occupation
                    </h3>
                    <p className="text-sm">{userDetailsDialog.user.occupation || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <BookmarkIcon className="h-4 w-4" /> Bookmarks
                    </h3>
                    <p className="text-sm">{userDetailsDialog.user._count?.bookmarks || 0}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">History Items</h3>
                    <p className="text-sm">{userDetailsDialog.user._count?.history || 0}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Custom Catalogs</h3>
                    <p className="text-sm">{userDetailsDialog.user._count?.catalogs || 0}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Account Status</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={getUserStatusBadgeVariant(userDetailsDialog.user?.isActive)} 
                        className="mr-2"
                      >
                        {userDetailsDialog.user?.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleUserStatus(userDetailsDialog.user?.id || "", !userDetailsDialog.user?.isActive)}
                      >
                        {userDetailsDialog.user?.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <Tabs defaultValue="subscription" className="mt-4">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="subscription">Subscription Management</TabsTrigger>
                  <TabsTrigger value="actions">User Actions</TabsTrigger>
                </TabsList>
                <TabsContent value="subscription" className="space-y-4">
                  <h3 className="text-sm font-medium">Subscription Management</h3>
                  <SubscriptionManagementPanel 
                    user={userDetailsDialog.user as UserData} 
                    onSubscriptionUpdated={() => {
                      // Refresh user data after subscription update
                      refetch();
                      toast({
                        title: "User data refreshed",
                        description: "The subscription changes have been applied.",
                      });
                    }}
                  />
                </TabsContent>
                <TabsContent value="actions" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Reset Password</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        This will generate a new temporary password for the user.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetPassword(userDetailsDialog.user?.id || "")}
                      >
                        Reset Password
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog open={bulkActionsDialogOpen} onOpenChange={setBulkActionsDialogOpen}>
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
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => handleBulkAction("activate")}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                  Activate Users
                </Button>
                <Button 
                  onClick={() => handleBulkAction("deactivate")}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                  Deactivate Users
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Danger Zone</h4>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Caution</AlertTitle>
                <AlertDescription>
                  Permanent deletion cannot be undone. All user data will be permanently removed.
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => {
                  // Show a confirm dialog before proceeding
                  if (window.confirm(`Are you sure you want to permanently delete ${selectedUsers.length} users? This action cannot be undone.`)) {
                    handleBulkAction("delete");
                  }
                }}
                disabled={loading}
                variant="destructive"
                className="w-full"
              >
                {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Delete Users Permanently
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkActionsDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialogOpen} onOpenChange={setDeleteConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Permanent Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete {currentUser?.email}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                All user data including prompts, subscriptions, and activity will be permanently removed.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (currentUser) {
                  handleDeleteUser(currentUser.id, currentUser.email);
                  setDeleteConfirmDialogOpen(false);
                }
              }}
              disabled={loading}
            >
              {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
