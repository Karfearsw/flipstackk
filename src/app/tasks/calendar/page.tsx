"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, AlertTriangle } from "lucide-react";
import { TaskStatus, TaskPriority } from "@prisma/client";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isPast, startOfWeek, endOfWeek } from "date-fns";

const priorityColors = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-red-100 text-red-800", 
  HIGH: "bg-black text-white",
  URGENT: "bg-red-500 text-white"
};

const statusColors = {
  TODO: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-red-100 text-red-800",
  COMPLETED: "bg-black text-white",
  CANCELLED: "bg-gray-800 text-white"
};

export default function TaskCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get tasks for the current month
  const { data: tasks = [], isLoading } = trpc.tasks.getAll.useQuery({
    startDate: startOfMonth(currentDate),
    endDate: endOfMonth(currentDate)
  });

  // Get overdue tasks
  const { data: overdueTasks = [] } = trpc.tasks.getOverdueTasks.useQuery();

  // Get today's tasks
  const { data: todayTasks = [] } = trpc.tasks.getTasksDueToday.useQuery();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    );
  };

  const getCalendarDays = () => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Calendar className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Task Calendar</h1>
        </div>
        <Link href="/tasks/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Overdue Tasks</p>
                <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Due Today</p>
                <p className="text-2xl font-bold text-orange-600">{todayTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {format(currentDate, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {getCalendarDays().map(date => {
                  const dayTasks = getTasksForDate(date);
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const isSelected = selectedDate && isSameDay(date, selectedDate);
                  const hasOverdue = dayTasks.some(task => 
                    task.status !== TaskStatus.COMPLETED && 
                    task.dueDate && 
                    isPast(new Date(task.dueDate)) && 
                    !isToday(new Date(task.dueDate))
                  );

                  return (
                    <div
                      key={date.toISOString()}
                      className={`
                        min-h-[80px] p-1 border cursor-pointer transition-colors
                        ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                        ${isToday(date) ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}
                        ${isSelected ? 'bg-blue-100 border-blue-300' : ''}
                        hover:bg-gray-50
                      `}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className={`
                        text-sm font-medium mb-1
                        ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                        ${isToday(date) ? 'text-blue-600' : ''}
                      `}>
                        {format(date, 'd')}
                      </div>
                      
                      <div className="space-y-1">
                        {dayTasks.slice(0, 2).map(task => (
                          <div
                            key={task.id}
                            className={`
                              text-xs p-1 rounded truncate
                              ${hasOverdue && task.status !== TaskStatus.COMPLETED ? 'bg-red-100 text-red-800' : priorityColors[task.priority]}
                            `}
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayTasks.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Tasks */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-3">
                  {selectedDateTasks.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No tasks for this date</p>
                  ) : (
                    selectedDateTasks.map(task => {
                      const isOverdue = task.status !== TaskStatus.COMPLETED && 
                                      task.dueDate && 
                                      isPast(new Date(task.dueDate)) && 
                                      !isToday(new Date(task.dueDate));

                      return (
                        <Link key={task.id} href={`/tasks/${task.id}`}>
                          <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm">{task.title}</h4>
                              {isOverdue && (
                                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${statusColors[task.status]}`}
                              >
                                {task.status.replace('_', ' ')}
                              </Badge>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${priorityColors[task.priority]}`}
                              >
                                {task.priority}
                              </Badge>
                            </div>

                            {task.description && (
                              <p className="text-xs text-gray-600 truncate">
                                {task.description}
                              </p>
                            )}

                            {task.assignedTo && (
                              <p className="text-xs text-gray-500 mt-1">
                                Assigned to: {task.assignedTo.firstName} {task.assignedTo.lastName}
                              </p>
                            )}
                          </div>
                        </Link>
                      );
                    })
                  )}
                  
                  <Link href={`/tasks/new?date=${format(selectedDate, 'yyyy-MM-dd')}`}>
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task for {format(selectedDate, 'MMM d')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Click on a date to view tasks
                </p>
              )}
            </CardContent>
          </Card>

          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg text-red-600 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Overdue Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overdueTasks.slice(0, 5).map(task => (
                    <Link key={task.id} href={`/tasks/${task.id}`}>
                      <div className="p-2 border border-red-200 rounded bg-red-50 hover:bg-red-100 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-red-800">
                            {task.title}
                          </span>
                          <span className="text-xs text-red-600">
                            {task.dueDate && format(new Date(task.dueDate), 'MMM d')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {overdueTasks.length > 5 && (
                    <Link href="/tasks?filter=overdue">
                      <Button variant="outline" size="sm" className="w-full">
                        View All Overdue ({overdueTasks.length})
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}