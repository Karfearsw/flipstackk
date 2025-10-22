'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Calendar, 
  User, 
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Edit
} from 'lucide-react';
import Link from 'next/link';
import { TaskStatus, TaskPriority } from '@prisma/client';

const priorityColors = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800'
};

const statusColors = {
  PENDING: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
};

interface TaskDetailPageProps {
  params: {
    id: string;
  };
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    assignedTo: '',
    dueDate: ''
  });

  // Fetch task details
  const { data: task, isLoading, refetch } = trpc.tasks.getById.useQuery({
    id: params.id
  });

  // Fetch users for assignment
  const { data: users } = trpc.auth.getUsers.useQuery();

  // Update task mutation
  const updateTaskMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      console.error('Error updating task:', error);
    }
  });

  // Delete task mutation
  const deleteTaskMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      router.push('/tasks');
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
    }
  });

  // Initialize form data when task is loaded
  useState(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ''
      });
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!task) return;

    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority,
        assignedTo: formData.assignedTo || undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await deleteTaskMutation.mutateAsync({ id: task.id });
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate: Date | string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && task?.status !== TaskStatus.COMPLETED;
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      case TaskStatus.IN_PROGRESS:
        return <AlertTriangle className="h-4 w-4" />;
      case TaskStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4" />;
      case TaskStatus.CANCELLED:
        return <Trash2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <MainLayout 
        navigationTitle="Task Details"
        customBackPath="/tasks"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Tasks', href: '/tasks' },
          { label: 'Task Details' }
        ]}
      >
        <div className="text-center py-8">Loading task details...</div>
      </MainLayout>
    );
  }

  if (!task) {
    return (
      <MainLayout 
        navigationTitle="Task Details"
        customBackPath="/tasks"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Tasks', href: '/tasks' },
          { label: 'Task Details' }
        ]}
      >
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Task Not Found</h2>
          <p className="text-gray-600 mb-4">The task you're looking for doesn't exist.</p>
          <Link href="/tasks">
            <Button>Back to Tasks</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      navigationTitle={task.title}
      customBackPath="/tasks"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Tasks', href: '/tasks' },
        { label: 'Task Details' }
      ]}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/tasks">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tasks
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Details</h1>
            <p className="text-gray-600 mt-1">
              Created {formatDate(task.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
                disabled={deleteTaskMutation.isLoading}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleSave}
                disabled={updateTaskMutation.isLoading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {updateTaskMutation.isLoading ? 'Saving...' : 'Save'}
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Task Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(task.status)}
                Task Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">Title</Label>
                {isEditing ? (
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <h2 className="text-xl font-semibold mt-1">{task.title}</h2>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-gray-700 mt-1">
                    {task.description || 'No description provided'}
                  </p>
                )}
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  {isEditing ? (
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md mt-1"
                    >
                      <option value={TaskStatus.PENDING}>Pending</option>
                      <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                      <option value={TaskStatus.COMPLETED}>Completed</option>
                      <option value={TaskStatus.CANCELLED}>Cancelled</option>
                    </select>
                  ) : (
                    <div className="mt-1">
                      <Badge className={statusColors[task.status]}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  {isEditing ? (
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md mt-1"
                    >
                      <option value={TaskPriority.LOW}>Low</option>
                      <option value={TaskPriority.MEDIUM}>Medium</option>
                      <option value={TaskPriority.HIGH}>High</option>
                      <option value={TaskPriority.URGENT}>Urgent</option>
                    </select>
                  ) : (
                    <div className="mt-1">
                      <Badge className={priorityColors[task.priority]}>
                        {task.priority}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Assignment */}
              <div>
                <Label htmlFor="assignedTo">Assigned To</Label>
                {isEditing ? (
                  <select
                    id="assignedTo"
                    value={formData.assignedTo}
                    onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md mt-1"
                  >
                    <option value="">Unassigned</option>
                    {users?.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-1">
                    {task.assignedToUser ? (
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {task.assignedToUser.username} ({task.assignedToUser.email})
                      </span>
                    ) : (
                      <span className="text-gray-500">Unassigned</span>
                    )}
                  </p>
                )}
              </div>

              {/* Due Date */}
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                {isEditing ? (
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className={`mt-1 flex items-center gap-2 ${
                    isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''
                  }`}>
                    <Calendar className="h-4 w-4" />
                    {task.dueDate ? (
                      <>
                        {formatDate(task.dueDate)}
                        {isOverdue(task.dueDate) && (
                          <Badge className="bg-red-100 text-red-800 ml-2">
                            OVERDUE
                          </Badge>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-500">No due date set</span>
                    )}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Related Lead */}
          {task.lead && (
            <Card>
              <CardHeader>
                <CardTitle>Related Lead</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label>Property</Label>
                    <p className="font-medium">
                      {task.lead.property?.address || 'Unknown Property'}
                    </p>
                  </div>
                  
                  <div>
                    <Label>Contact</Label>
                    <p>{task.lead.firstName} {task.lead.lastName}</p>
                    <p className="text-sm text-gray-600">{task.lead.phone}</p>
                    <p className="text-sm text-gray-600">{task.lead.email}</p>
                  </div>
                  
                  <div>
                    <Label>Status</Label>
                    <Badge className="mt-1">
                      {task.lead.status}
                    </Badge>
                  </div>
                  
                  <Link href={`/leads/${task.lead.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Lead Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {task.status === TaskStatus.PENDING && (
                <Button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, status: TaskStatus.IN_PROGRESS }));
                    setIsEditing(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Start Task
                </Button>
              )}
              
              {task.status === TaskStatus.IN_PROGRESS && (
                <Button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, status: TaskStatus.COMPLETED }));
                    setIsEditing(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Mark Complete
                </Button>
              )}
              
              <Link href={`/tasks/new?leadId=${task.leadId}`}>
                <Button variant="outline" size="sm" className="w-full">
                  Create Follow-up Task
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Task Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Created {formatDate(task.createdAt)}</span>
                </div>
                
                {task.updatedAt && task.updatedAt !== task.createdAt && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Updated {formatDate(task.updatedAt)}</span>
                  </div>
                )}
                
                {task.status === TaskStatus.COMPLETED && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Completed</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}