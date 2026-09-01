'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Plus, CheckCircle, XCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FieldGroup, FieldLabel } from '@/components/ui/field'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { label: 'Users', href: '/admin/users', icon: '👥' },
  { label: 'Companies', href: '/admin/companies', icon: '🏢' },
  { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
]

const companiesData = [
  { id: 1, name: 'Tech Corp', website: 'techcorp.com', package: '12 LPA', activeJobs: 5, status: 'verified' },
  { id: 2, name: 'Finance Solutions', website: 'finance.com', package: '8 LPA', activeJobs: 3, status: 'verified' },
  { id: 3, name: 'Cloud Systems', website: 'cloud.com', package: '10 LPA', activeJobs: 4, status: 'verified' },
  { id: 4, name: 'AI Innovations', website: 'aiinnovations.com', package: '14 LPA', activeJobs: 2, status: 'pending' },
  { id: 5, name: 'Design Studio', website: 'designstudio.com', package: '7 LPA', activeJobs: 1, status: 'verified' },
  { id: 6, name: 'Mobile Apps Inc', website: 'mobileapps.com', package: '9 LPA', activeJobs: 3, status: 'verified' },
]

const getStatusColor = (status: string) => {
  return status === 'verified'
    ? 'bg-green-100 text-green-700 border-green-300'
    : 'bg-yellow-100 text-yellow-700 border-yellow-300'
}

export default function CompaniesPage() {
  const [search, setSearch] = useState('')
  const [companies, setCompanies] = useState(companiesData)
  const [newCompany, setNewCompany] = useState({ name: '', website: '', package: '' })
  const [open, setOpen] = useState(false)

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(search.toLowerCase()) ||
    company.website.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCompany.name && newCompany.website && newCompany.package) {
      setCompanies([
        ...companies,
        {
          id: companies.length + 1,
          name: newCompany.name,
          website: newCompany.website,
          package: newCompany.package,
          activeJobs: 0,
          status: 'pending',
        },
      ])
      setNewCompany({ name: '', website: '', package: '' })
      setOpen(false)
    }
  }

  const updateStatus = (id: number, newStatus: string) => {
    setCompanies(prev =>
      prev.map(company => company.id === id ? { ...company, status: newStatus } : company)
    )
  }

  return (
    <DashboardLayout navItems={navItems} title="Company Management" userInitial="A">
      <div className="space-y-6">
        {/* Header with Search and Add Button */}
        <div className="flex gap-4 flex-col md:flex-row items-center justify-between">
          <div className="flex-1 relative w-full md:w-auto">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Company</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCompany} className="space-y-4">
                <FieldGroup>
                  <FieldLabel htmlFor="name">Company Name *</FieldLabel>
                  <Input
                    id="name"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    required
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel htmlFor="website">Website *</FieldLabel>
                  <Input
                    id="website"
                    value={newCompany.website}
                    onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                    required
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel htmlFor="package">Package (LPA) *</FieldLabel>
                  <Input
                    id="package"
                    value={newCompany.package}
                    onChange={(e) => setNewCompany({ ...newCompany, package: e.target.value })}
                    required
                  />
                </FieldGroup>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
                    Add Company
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Companies Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>
              {filteredCompanies.length} {filteredCompanies.length === 1 ? 'Company' : 'Companies'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Active Jobs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id} className="hover:bg-orange-50">
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell className="text-sm">{company.website}</TableCell>
                      <TableCell className="font-semibold text-green-600">{company.package}</TableCell>
                      <TableCell>{company.activeJobs}</TableCell>
                      <TableCell>
                        <Badge className={`capitalize border ${getStatusColor(company.status)}`}>
                          {company.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {company.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600 hover:bg-green-50"
                                onClick={() => updateStatus(company.id, 'verified')}
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => setCompanies(prev => prev.filter(c => c.id !== company.id))}
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredCompanies.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No companies found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
