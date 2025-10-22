'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '@/lib/trpc-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Calendar, User, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { TaskPriority } from '@prisma/client';

function NewTaskForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');
  const buyerId = searchParams.get('buyerId');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    leadId: leadId || '',
    assignedTo: '',
    priority: TaskPriority.MEDIUM,
    dueDate: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch lead details if leadId is provided
  const { data: lead } = trpc.leads.getById.useQuery(
    { id: leadId! },
    { enabled: !!leadId }
  );

  // Fetch buyer details if buyerId is provided
  const { data: buyer } = trpc.buyers.getById.useQuery(
    { id: buyerId! },
    { enabled: !!buyerId }
  );

  // Fetch users for assignment
  const { data: users } = trpc.auth.getUsers.useQuery();

  const createTaskMutation = trpc.tasks.create.useMutation({
    onSuccess: (data) => {
      router.push(`/tasks/${data.id}`);
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    }
  });

  // Pre-fill form based on context
  useEffect(() => {
    if (lead) {
      setFormData(prev => ({
        ...prev,
        title: `Follow up on ${lead.property?.address || 'lead'}`,
        description: `Follow up with lead for property at ${lead.property?.address || 'unknown address'}`,
        leadId: lead.id
      }));
    }
  }, [lead]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.leadId.trim()) {
      newErrors.leadId = 'Lead is required';
    }

    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createTaskMutation.mutateAsync({
        title: formData.title,
        description: formData.description || undefined,
        leadId: formData.leadId,
        assignedTo: formData.assignedTo || undefined,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  const getDefaultDueDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return formatDateForInput(tomorrow);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/tasks">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
          <p className="text-gray-600 mt-1">
            {lead && `For lead: ${lead.property?.address || 'Unknown Property'}`}
            {buyer && `For buyer: ${buyer.firstName} ${buyer.lastName}`}
          </p>
        </div>
      </div>

      {/* Context Information */}
      {(lead || buyer) && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Task Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lead && (
              <div className="space-y-2">
                <p><strong>Lead:</strong> {lead.property?.address || 'Unknown Property'}</p>
                <p><strong>Contact:</strong> {lead.firstName} {lead.lastName}</p>
                <p><strong>Status:</strong> {lead.status}</p>
                <p><strong>Phone:</strong> {lead.phone}</p>
                <p><strong>Email:</strong> {lead.email}</p>
              </div>
            )}
            {buyer && (
              <div className="space-y-2">
                <p><strong>Buyer:</strong> {buyer.firstName} {buyer.lastName}</p>
                <p><strong>Phone:</strong> {buyer.phone}</p>
                <p><strong>Email:</strong> {buyer.email}</p>
                <p><strong>Cash Buyer:</strong> {buyer.cashBuyer ? 'Yes' : 'No'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Task Form */}
      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter task title..."
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter task description..."
                rows={4}
              />
            </div>

            {/* Lead Selection */}
            <div>
              <Label htmlFor="leadId">Related Lead *</Label>
              <select
                id="leadId"
                value={formData.leadId}
                onChange={(e) => handleInputChange('leadId', e.target.value)}
                className={`w-full p-2 border rounded-md ${errors.leadId ? 'border-red-500' : 'border-gray-300'}`}
                disabled={!!leadId} // Disable if leadId is pre-selected
              >
                <option value="">Select a lead...</option>
                {/* Note: We would need to fetch leads here in a real implementation */}
                {lead && (
                  <option value={lead.id}>
                    {lead.property?.address || 'Unknown Property'} - {lead.firstName} {lead.lastName}
                  </option>
                )}
              </select>
              {errors.leadId && (
                <p className="text-red-500 text-sm mt-1">{errors.leadId}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
                <option value={TaskPriority.URGENT}>Urgent</option>
              </select>
            </div>

            {/* Assigned To */}
            <div>
              <Label htmlFor="assignedTo">Assign To</Label>
              <select
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Assign to me (default)</option>
                {users?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={formData.dueDate || getDefaultDueDate()}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className={errors.dueDate ? 'border-red-500' : ''}
              />
              {errors.dueDate && (
                <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={createTaskMutation.isLoading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {createTaskMutation.isLoading ? 'Creating...' : 'Create Task'}
              </Button>
              
              <Link href="/tasks">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Task Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  title: 'Contact lead within 1 hour',
                  description: 'Initial contact with new lead to qualify and gather information',
                  priority: TaskPriority.HIGH,
                  dueDate: formatDateForInput(new Date(Date.now() + 60 * 60 * 1000))
                }));
              }}
              className="text-left h-auto p-4"
            >
              <div>
                <div className="font-medium">Contact New Lead</div>
                <div className="text-sm text-gray-500">High priority, due in 1 hour</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  title: 'Schedule property visit',
                  description: 'Arrange property inspection and evaluation',
                  priority: TaskPriority.MEDIUM,
                  dueDate: formatDateForInput(new Date(Date.now() + 24 * 60 * 60 * 1000))
                }));
              }}
              className="text-left h-auto p-4"
            >
              <div>
                <div className="font-medium">Schedule Visit</div>
                <div className="text-sm text-gray-500">Medium priority, due in 24 hours</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  title: 'Follow up with lead in 3 days',
                  description: 'Check in with lead and maintain engagement',
                  priority: TaskPriority.LOW,
                  dueDate: formatDateForInput(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
                }));
              }}
              className="text-left h-auto p-4"
            >
              <div>
                <div className="font-medium">Follow Up</div>
                <div className="text-sm text-gray-500">Low priority, due in 3 days</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  title: 'Prepare closing documents',
                  description: 'Gather and prepare all necessary closing documentation',
                  priority: TaskPriority.HIGH,
                  dueDate: formatDateForInput(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
                }));
              }}
              className="text-left h-auto p-4"
            >
              <div>
                <div className="font-medium">Prepare Closing</div>
                <div className="text-sm text-gray-500">High priority, due in 3 days</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewTaskPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewTaskForm />
    </Suspense>
  );
}