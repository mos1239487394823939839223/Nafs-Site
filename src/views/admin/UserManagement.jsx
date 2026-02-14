import { useState } from 'react'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input, { Select } from '../../components/ui/Input'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'
import {
    Users,
    UserPlus,
    Search,
    Filter,
    Mail,
    CheckCircle,
    Clock,
    XCircle,
    Stethoscope,
    User
} from 'lucide-react'

import { useClinic } from '../../contexts/ClinicContext'

export default function UserManagement() {
    const toast = useToast()
    const { users, registerUser } = useClinic()
    const [activeTab, setActiveTab] = useState('doctors')
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddForm, setShowAddForm] = useState(false)

    // Derived Data from Context
    const doctors = users.filter(u => u.role === 'doctor').map(u => ({
        id: u.email,
        name: u.name,
        specialty: u.specialty || 'General',
        email: u.email,
        status: 'active',
        sessions: Math.floor(Math.random() * 100)
    }))

    const patients = users.filter(u => u.role === 'patient').map(u => ({
        id: u.email,
        name: u.name,
        email: u.email,
        lastVisit: '2026-01-20',
        status: 'active'
    }))

    const staff = users.filter(u => u.role === 'staff').map(u => ({
        id: u.email,
        email: u.email,
        role: u.name === 'Support Agent' ? 'Support Agent' : 'Manager',
        status: 'accepted',
        date: '2026-01-20'
    }))

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'doctor', // doctor or staff
        specialty: '',
        permissions: 'support-agent'
    })

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setShowAddForm(false)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleAddUser = (e) => {
        e.preventDefault()

        const newUser = {
            name: formData.name || formData.email.split('@')[0],
            email: formData.email,
            password: 'password', // Default password for new members
            role: formData.role,
            specialty: formData.specialty,
            permissions: formData.permissions
        }

        registerUser(newUser)
        toast.success(`${formData.role === 'doctor' ? 'Doctor' : 'Staff Member'} added successfully`)

        setShowAddForm(false)
        setFormData({ name: '', email: '', role: 'doctor', specialty: '', permissions: 'support-agent' })
    }

    const filteredDoctors = doctors.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredStaff = staff.filter(s =>
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-text-heading">User Management</h2>
                    <p className="text-text-muted mt-1">Manage doctors, patients, and staff members</p>
                </div>
                {!showAddForm && (activeTab === 'doctors' || activeTab === 'staff') && (
                    <Button
                        className="w-full sm:w-auto"
                        onClick={() => {
                            setFormData(prev => ({ ...prev, role: activeTab === 'doctors' ? 'doctor' : 'staff' }))
                            setShowAddForm(true)
                        }}
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {activeTab === 'doctors' ? 'Add Doctor' : 'Invite Staff'}
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border overflow-x-auto no-scrollbar">
                <button
                    onClick={() => handleTabChange('doctors')}
                    className={`px-4 md:px-6 py-3 font-medium transition-colors relative whitespace-nowrap ${activeTab === 'doctors' ? 'text-primary' : 'text-text-muted hover:text-text'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        Doctors
                    </div>
                    {activeTab === 'doctors' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                </button>
                <button
                    onClick={() => handleTabChange('patients')}
                    className={`px-4 md:px-6 py-3 font-medium transition-colors relative whitespace-nowrap ${activeTab === 'patients' ? 'text-primary' : 'text-text-muted hover:text-text'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Patients
                    </div>
                    {activeTab === 'patients' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                </button>
                <button
                    onClick={() => handleTabChange('staff')}
                    className={`px-4 md:px-6 py-3 font-medium transition-colors relative whitespace-nowrap ${activeTab === 'staff' ? 'text-primary' : 'text-text-muted hover:text-text'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Staff
                    </div>
                    {activeTab === 'staff' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                </button>
            </div>

            {showAddForm ? (
                <Card>
                    <CardHeader>
                        <CardTitle>{formData.role === 'doctor' ? 'Add New Doctor' : 'Invite Staff Member'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddUser} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {formData.role === 'doctor' && (
                                    <Input
                                        label="Full Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Dr. Ahmed Hassan"
                                        required
                                    />
                                )}
                                <Input
                                    label="Email Address"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="name@clinc.com"
                                    required
                                />
                                {formData.role === 'doctor' ? (
                                    <Input
                                        label="Specialty"
                                        name="specialty"
                                        value={formData.specialty}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Cardiology"
                                        required
                                    />
                                ) : (
                                    <Select
                                        label="Permission Level"
                                        name="permissions"
                                        value={formData.permissions}
                                        onChange={handleInputChange}
                                    >
                                        <option value="view-only">View Only</option>
                                        <option value="support-agent">Support Agent</option>
                                        <option value="manager">Manager</option>
                                    </Select>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <Button type="submit">
                                    {formData.role === 'doctor' ? 'Create Account' : 'Send Invitation'}
                                </Button>
                                <Button variant="ghost" type="button" onClick={() => setShowAddForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {/* Search and Filters */}
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background-paper border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                        <Button variant="ghost" className="border border-border bg-background-paper">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                    </div>

                    {/* Data Table */}
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {activeTab === 'doctors' && (
                                            <>
                                                <TableHead>Doctor Name</TableHead>
                                                <TableHead>Specialty</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Sessions</TableHead>
                                                <TableHead>Status</TableHead>
                                            </>
                                        )}
                                        {activeTab === 'patients' && (
                                            <>
                                                <TableHead>Patient Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Last Visit</TableHead>
                                                <TableHead>Status</TableHead>
                                            </>
                                        )}
                                        {activeTab === 'staff' && (
                                            <>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Date Added</TableHead>
                                            </>
                                        )}
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeTab === 'doctors' && filteredDoctors.map((doctor) => (
                                        <TableRow key={doctor.id}>
                                            <TableCell className="font-medium text-text-heading">{doctor.name}</TableCell>
                                            <TableCell>{doctor.specialty}</TableCell>
                                            <TableCell>{doctor.email}</TableCell>
                                            <TableCell>{doctor.sessions}</TableCell>
                                            <TableCell>
                                                <Badge variant={doctor.status === 'active' ? 'success' : 'secondary'}>
                                                    {doctor.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {activeTab === 'patients' && filteredPatients.map((patient) => (
                                        <TableRow key={patient.id}>
                                            <TableCell className="font-medium text-text-heading">{patient.name}</TableCell>
                                            <TableCell>{patient.email}</TableCell>
                                            <TableCell>{patient.lastVisit}</TableCell>
                                            <TableCell>
                                                <Badge variant={patient.status === 'active' ? 'success' : 'secondary'}>
                                                    {patient.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm">View</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {activeTab === 'staff' && filteredStaff.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-text-muted" />
                                                    <span className="font-medium">{s.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{s.role}</TableCell>
                                            <TableCell>
                                                {s.status === 'accepted' ? (
                                                    <Badge variant="success">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Accepted
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="warning">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        Pending
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{s.date}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm">Manage</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
