"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  CheckCircle, 
  Users, 
  TrendingUp, 
  Clock, 
  Database, 
  Smartphone,
  BarChart3,
  FileText,
  Star,
  ArrowRight,
  Menu,
  X
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("professional");

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-3xl font-bold text-red-600 font-[var(--font-orbitron)] tracking-wide">
                Flipstack
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-red-600 transition-colors font-semibold">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-700 hover:text-red-600 transition-colors font-semibold">
                Pricing
              </Link>
              <Link href="#testimonials" className="text-gray-700 hover:text-red-600 transition-colors font-semibold">
                Testimonials
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-red-600 transition-colors font-semibold">
                Log In
              </Link>
              <button 
                onClick={() => {
                  // Scroll to demo section or open demo modal
                  const demoSection = document.getElementById('features');
                  if (demoSection) {
                    demoSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors font-semibold mr-3"
              >
                Book a Demo
              </button>
              <Link 
                href="/signup" 
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-black hover:text-red-600"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <Link href="#features" className="text-black hover:text-red-600 transition-colors font-semibold">
                  Features
                </Link>
                <Link href="#pricing" className="text-black hover:text-red-600 transition-colors font-semibold">
                  Pricing
                </Link>
                <Link href="#testimonials" className="text-black hover:text-red-600 transition-colors font-semibold">
                  Testimonials
                </Link>
                <Link href="/login" className="text-black hover:text-red-600 transition-colors font-semibold">
                  Log In
                </Link>
                <button 
                  onClick={() => {
                    // Scroll to demo section or open demo modal
                    const demoSection = document.getElementById('features');
                    if (demoSection) {
                      demoSection.scrollIntoView({ behavior: 'smooth' });
                    }
                    setMobileMenuOpen(false);
                  }}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors font-semibold text-center"
                >
                  Book a Demo
                </button>
                <Link 
                  href="/signup" 
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold text-center"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Streamline Your Real Estate Deals from Lead to Close
              </h1>
              <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                The all-in-one CRM built specifically for real estate wholesalers to manage leads, buyers, and deals in one powerful platform
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/signup" 
                  className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-all duration-200 font-semibold text-lg hover:scale-105 transform"
                >
                  Start Free 4-Day Trial
                </Link>
                <button 
               onClick={() => {
                 // Scroll to demo section or open demo modal
                 const demoSection = document.getElementById('features');
                 if (demoSection) {
                   demoSection.scrollIntoView({ behavior: 'smooth' });
                 }
               }}
               className="border-2 border-black text-black px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-lg"
             >
               See Flipstack in Action
             </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                No credit card required • 4-day free trial • Cancel anytime
              </p>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-black text-white p-4 rounded-lg mb-4">
                  <h3 className="font-semibold">Dashboard Overview</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm">Active Leads</span>
                    <span className="font-bold text-red-600">247</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm">Deals Closed</span>
                    <span className="font-bold text-black">18</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm">Revenue This Month</span>
                    <span className="font-bold text-red-600">$127,500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Real Estate Professionals Choose Flipstack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your wholesaling business with tools designed specifically for real estate professionals
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Database size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Centralized Deal Management
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Track every deal from acquisition to disposition in one unified platform. Never lose track of opportunities again.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-red-50 hover:bg-red-100 transition-colors">
              <div className="bg-red-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Time-Saving Automation
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Reduce manual tasks by 40% with smart workflows, automated follow-ups, and intelligent task management.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Revenue Optimization
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Increase deal closure rates by 25% with data-driven insights, buyer matching, and performance analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Scale Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools designed specifically for real estate wholesaling professionals
            </p>
          </div>

          {/* Feature 1 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Lead Pipeline Management
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Visual deal tracking from first contact to closing. Organize leads by status, priority, and potential value. Never miss a follow-up with automated reminders and task assignments.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3" size={20} />
                  <span>Visual pipeline with drag-and-drop functionality</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3" size={20} />
                  <span>Automated follow-up reminders</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3" size={20} />
                  <span>Lead scoring and prioritization</span>
                </li>
              </ul>
              <button className="mt-6 text-red-700 font-semibold hover:text-red-800 flex items-center">
                Learn More <ArrowRight className="ml-2" size={16} />
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="bg-gradient-to-r from-black to-gray-800 text-white p-4 rounded-lg mb-6">
                <h4 className="font-semibold">Lead Pipeline</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 border-l-4 border-red-400 rounded">
                  <div>
                    <p className="font-semibold">123 Main St</p>
                    <p className="text-sm text-gray-600">New Lead</p>
                  </div>
                  <span className="text-red-600 font-bold">$45K</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 border-l-4 border-black rounded">
                  <div>
                    <p className="font-semibold">456 Oak Ave</p>
                    <p className="text-sm text-gray-600">Under Contract</p>
                  </div>
                  <span className="text-black font-bold">$62K</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-100 border-l-4 border-gray-600 rounded">
                  <div>
                    <p className="font-semibold">789 Pine St</p>
                    <p className="text-sm text-gray-600">Closed</p>
                  </div>
                  <span className="text-gray-600 font-bold">$38K</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1 bg-white rounded-2xl shadow-xl p-8">
              <div className="bg-gradient-to-r from-black to-gray-800 text-white p-4 rounded-lg mb-6">
                <h4 className="font-semibold">Buyer Database</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <Users className="text-black mr-3" size={20} />
                    <div>
                      <p className="font-semibold">John Smith</p>
                      <p className="text-sm text-gray-600">Cash Buyer</p>
                    </div>
                  </div>
                  <span className="text-red-600 font-bold">Active</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <Users className="text-black mr-3" size={20} />
                    <div>
                      <p className="font-semibold">Sarah Johnson</p>
                      <p className="text-sm text-gray-600">Fix &amp; Flip</p>
                    </div>
                  </div>
                  <span className="text-red-600 font-bold">Active</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <Users className="text-black mr-3" size={20} />
                    <div>
                      <p className="font-semibold">Mike Davis</p>
                      <p className="text-sm text-gray-600">Rental Investor</p>
                    </div>
                  </div>
                  <span className="text-black font-bold">Interested</span>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Comprehensive Buyer Database
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Build and maintain relationships with qualified buyers. Track preferences, investment criteria, and deal history to match properties with the right investors quickly.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3" size={20} />
                  <span>Detailed buyer profiles with investment preferences</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3" size={20} />
                  <span>Automated property matching</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3" size={20} />
                  <span>Communication history tracking</span>
                </li>
              </ul>
              <button className="mt-6 text-red-700 font-semibold hover:text-red-800 flex items-center">
                Learn More <ArrowRight className="ml-2" size={16} />
              </button>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Performance Analytics
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Make data-driven decisions with comprehensive analytics. Track conversion rates, deal velocity, and revenue trends to optimize your business performance.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3" size={20} />
                  <span>Real-time performance dashboards</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3" size={20} />
                  <span>Revenue forecasting and trends</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3" size={20} />
                  <span>Custom report generation</span>
                </li>
              </ul>
              <button className="mt-6 text-red-700 font-semibold hover:text-red-800 flex items-center">
                Learn More <ArrowRight className="ml-2" size={16} />
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="bg-gradient-to-r from-black to-gray-800 text-white p-4 rounded-lg mb-6">
                <h4 className="font-semibold">Analytics Dashboard</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 rounded">
                  <div className="flex items-center">
                    <BarChart3 className="text-red-600 mr-3" size={20} />
                    <span>Conversion Rate</span>
                  </div>
                  <span className="text-red-600 font-bold">23.5%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <TrendingUp className="text-black mr-3" size={20} />
                    <span>Avg Deal Size</span>
                  </div>
                  <span className="text-black font-bold">$47,200</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-100 rounded">
                  <div className="flex items-center">
                    <Clock className="text-gray-800 mr-3" size={20} />
                    <span>Avg Close Time</span>
                  </div>
                  <span className="text-gray-800 font-bold">18 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Choose the Perfect Plan for Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transparent pricing with no hidden fees. Start with a 4-day free trial on any plan.
            </p>
          </div>

          {/* Mobile Plan Selector */}
          <div className="md:hidden mb-8">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedPlan("basic")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedPlan === "basic" 
                    ? "bg-white text-red-700 shadow-sm" 
                    : "text-gray-600"
                }`}
              >
                Basic
              </button>
              <button
                onClick={() => setSelectedPlan("professional")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedPlan === "professional" 
                    ? "bg-white text-red-700 shadow-sm" 
                    : "text-gray-600"
                }`}
              >
                Professional
              </button>
              <button
                onClick={() => setSelectedPlan("enterprise")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedPlan === "enterprise" 
                    ? "bg-white text-red-700 shadow-sm" 
                    : "text-gray-600"
                }`}
              >
                Enterprise
              </button>
            </div>
          </div>

          {/* Desktop Pricing Cards */}
          <div className="hidden md:grid md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-red-300 transition-colors">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                <p className="text-gray-600 mb-6">Perfect for solo investors</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">$49</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <Link 
                  href="/signup?plan=basic" 
                  className="w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-semibold block text-center"
                >
                  Start Free Trial
                </Link>
              </div>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                  <span>Lead management (up to 100 leads)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                  <span>Basic buyer database</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                  <span>Task management</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                  <span>Email templates</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                  <span>Mobile access</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                  <span>Email support</span>
                </li>
              </ul>
            </div>

            {/* Professional Plan */}
            <div className="bg-white border-2 border-red-500 rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                <p className="text-gray-600 mb-6">For growing businesses</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">$99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <Link 
                  href="/signup?plan=professional" 
                  className="w-full bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition-colors font-semibold block text-center"
                >
                  Try Professional Free
                </Link>
              </div>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                  <span>Everything in Basic, plus:</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                  <span>Unlimited leads</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                  <span>Advanced buyer matching</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                  <span>Document management</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                  <span>Team collaboration (up to 5 users)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                  <span>Deal analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                  <span>Popular tool integrations</span>
                </li>
              </ul>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-red-300 transition-colors">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-600 mb-6">For established operations</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">$199</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <button className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors font-semibold">
                  Contact Sales
                </button>
              </div>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                  <span>Everything in Professional, plus:</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                  <span>Unlimited users</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                  <span>White-label options</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                  <span>Dedicated account manager</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile Pricing Card */}
          <div className="md:hidden">
            {selectedPlan === "basic" && (
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                  <p className="text-gray-600 mb-6">Perfect for solo investors</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">$49</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <Link 
                    href="/signup?plan=basic" 
                    className="w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-semibold block text-center"
                  >
                    Start Free Trial
                  </Link>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center">
                    <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                    <span>Lead management (up to 100 leads)</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                    <span>Basic buyer database</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                    <span>Task management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                    <span>Email templates</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                    <span>Mobile access</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                    <span>Email support</span>
                  </li>
                </ul>
              </div>
            )}

            {selectedPlan === "professional" && (
              <div className="bg-white border-2 border-red-500 rounded-2xl p-8 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                  <p className="text-gray-600 mb-6">For growing businesses</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">$99</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <Link 
                    href="/signup?plan=professional" 
                    className="w-full bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition-colors font-semibold block text-center"
                  >
                    Try Professional Free
                  </Link>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center">
                    <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                    <span>Everything in Basic, plus:</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                    <span>Unlimited leads</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                    <span>Advanced buyer matching</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                    <span>Document management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                    <span>Team collaboration (up to 5 users)</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                    <span>Deal analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                    <span>Popular tool integrations</span>
                  </li>
                </ul>
              </div>
            )}

            {selectedPlan === "enterprise" && (
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                  <p className="text-gray-600 mb-6">For established operations</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">$199</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <button className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors font-semibold">
                    Contact Sales
                  </button>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center">
                    <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                    <span>Everything in Professional, plus:</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                    <span>Unlimited users</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                    <span>White-label options</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                    <span>Dedicated account manager</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Real Estate Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how Flipstack is helping wholesalers close more deals and grow their businesses
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-red-500 fill-current" size={20} />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "Flipstack transformed our wholesaling business. We've increased our deal flow by 40% and reduced our admin time by half. The buyer matching feature alone has saved us countless hours."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-red-700 font-bold">MJ</span>
                </div>
                <div>
                  <p className="font-semibold text-black">Michael Johnson</p>
                  <p className="text-gray-600 text-sm">Founder, Johnson Properties</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-red-500 fill-current" size={20} />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "The analytics dashboard gives us insights we never had before. We can now predict which leads are most likely to close and focus our efforts accordingly. ROI has improved significantly."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-black font-bold">SC</span>
                </div>
                <div>
                  <p className="font-semibold text-black">Sarah Chen</p>
                  <p className="text-gray-600 text-sm">CEO, Rapid Realty Solutions</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-red-500 fill-current" size={20} />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "As a team of 8, collaboration was always a challenge. Flipstack's team features keep everyone on the same page. Our deal velocity has increased by 60% since implementation."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-red-700 font-bold">DR</span>
                </div>
                <div>
                  <p className="font-semibold text-black">David Rodriguez</p>
                  <p className="text-gray-600 text-sm">Partner, Elite Wholesale Group</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics - Statistics Section with SEO optimization */}
          {/* TODO: Future enhancement - Replace static statistics with live data from API endpoints */}
          {/* Consider implementing real-time data fetching for: active users, deals processed, conversion rates, and system uptime */}
          <div className="grid md:grid-cols-4 gap-8 text-center" role="region" aria-label="Company Statistics">
            <div itemScope itemType="https://schema.org/Statistic">
              <div className="text-4xl font-bold text-red-600 mb-2" aria-label="500 plus active users" itemProp="value">500+</div>
              <p className="text-gray-600" itemProp="name">Active Users</p>
            </div>
            <div itemScope itemType="https://schema.org/Statistic">
              <div className="text-4xl font-bold text-green-600 mb-2" aria-label="50 million dollars plus in deals processed" itemProp="value">$50M+</div>
              <p className="text-gray-600" itemProp="name">Deals Processed</p>
            </div>
            <div itemScope itemType="https://schema.org/Statistic">
              <div className="text-4xl font-bold text-red-600 mb-2" aria-label="25 percent average conversion increase" itemProp="value">25%</div>
              <p className="text-gray-600" itemProp="name">Avg. Conversion Increase</p>
            </div>
            <div itemScope itemType="https://schema.org/Statistic">
              <div className="text-4xl font-bold text-black mb-2" aria-label="99.9 percent uptime" itemProp="value">99.9%</div>
              <p className="text-gray-600" itemProp="name">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Real Estate Business?
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Join hundreds of successful real estate professionals who trust Flipstack to manage their deals and grow their businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link 
               href="/signup" 
               className="bg-red-500 text-white px-8 py-4 rounded-lg hover:bg-red-600 transition-all duration-200 font-semibold text-lg hover:scale-105 transform"
             >
               Start Free 4-Day Trial
             </Link>
             <button 
               onClick={() => {
                 // Scroll to demo section or open demo modal
                 const demoSection = document.getElementById('features');
                 if (demoSection) {
                   demoSection.scrollIntoView({ behavior: 'smooth' });
                 }
               }}
               className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-black transition-colors font-semibold text-lg"
             >
               Schedule a Demo
             </button>
           </div>
          <p className="text-gray-400 mt-6">
            No credit card required • Full access to all features • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="text-2xl font-bold text-white mb-4 block">
                Flipstack
              </Link>
              <p className="text-gray-400 leading-relaxed">
                The all-in-one CRM built specifically for real estate wholesalers to manage leads, buyers, and deals.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/signup" className="text-gray-400 hover:text-white transition-colors">Free Trial</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">API Reference</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2024 Flipstack. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}