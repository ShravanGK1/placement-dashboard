'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, MoreVertical } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { label: 'Users', href: '/admin/users', icon: '👥' },
  { label: 'Companies', href: '/admin/companies', icon: '🏢' },
  { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
]

const usersData = [
  { id: 1, name: 'Rahul Kumar', email: 'rahul@example.com', role: 'student', status: 'active', joinDate: '2024-01-15' },
  { id: 2, name: 'Tech Corp HR', email: 'hr@techcorp.com', role: 'recruiter', status: 'active', joinDate: '2024-01-10' },
  { id: 3, name: 'Priya Singh', email: 'priya@example.com', role: 'student', status: 'active', joinDate: '2024-01-18' },
  { id: 4, name: 'Finance Solutions', email: 'hiring@finance.com', role: 'recruiter', status: 'active', joinDate: '2024-02-01' },
  { id: 5, name: 'Arjun Patel', email: 'arjun@example.com', role: 'student', status: 'inactive', joinDate: '2024-01-20' },
  { id: 6, name: 'Sneha Sharma', email: 'sneha@example.com', role: 'student', status: 'active', joinDate: '2024-02-05' },
  { id: 7, name: 'Cloud Systems', email: 'careers@cloud.com', role: 'recruiter', status: 'active', joinDate: '2024-02-10' },
  { id: 8, name: 'Admin User', email: 'admin@placement.com', role: 'admin', status: 'active', joinDate: '2023-12-01' },
]

const getRoleColor = (role: string) => {
  switch (role) {
    case 'student':
      return 'bg-blue-100 text-blue-700 border-blue-300'
    case 'recruiter':
      return 'bg-purple-100 text-purple-700 border-purple-300'
    case 'admin':
      return 'bg-orange-100 text-orange-700 border-orange-300'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getStatusColor = (status: string) => {
  return status === 'active'
    ? 'bg-green-100 text-green-700 border-green-300'
    : 'bg-red-100 text-red-700 border-red-300'
}

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [users, setUsers] = useState(usersData)

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const updateUserRole = (id: number, newRole: string) => {
    setUsers(prev =>
      prev.map(user => user.id === id ? { ...user, role: newRole } : user)
    )
  }

  const updateUserStatus = (id: number, newStatus: string) => {
    setUsers(prev =>
      prev.map(user => user.id === id ? { ...user, status: newStatus } : user)
    )
  }

  return (
    <DashboardLayout navItems={navItems} title="User Management" userInitial="A">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="recruiter">Recruiter</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>
              {filteredUsers.length} {filteredUsers.length === 1 ? 'User' : 'Users'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-orange-50">
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={`capitalize border ${getRoleColor(user.role)}`}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`capitalize border ${getStatusColor(user.status)}`}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-xs">
                              Change Role:
                            </DropdownMenuItem>
                            {['student', 'recruiter', 'admin'].map(role => (
                              <DropdownMenuItem
                                key={role}
                                onClick={() => updateUserRole(user.id, role)}
                                className="text-xs pl-8"
                              >
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem className="border-t text-xs">
                              Change Status:
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateUserStatus(user.id, 'active')}
                              className="text-xs pl-8"
                            >
                              Active
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateUserStatus(user.id, 'inactive')}
                              className="text-xs pl-8"
                            >
                              Inactive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No users found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
