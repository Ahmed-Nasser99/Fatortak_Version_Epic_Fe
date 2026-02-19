import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Layout, 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  Calendar, 
  User, 
  FileText,
  Clock,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useProject } from '../hooks/useProjects';
import { useInvoices } from '../hooks/useInvoices';
import { useExpenses } from '../hooks/useExpenses';
import { useJournalEntries } from '../hooks/useAccounting';
import { ProjectStatus, JournalEntryReferenceType } from '../types/api';
import { formatDate, formatNumber } from '@/Helpers/localization';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: projectResponse, isLoading: projectLoading } = useProject(id!);
  const project = projectResponse?.data;

  // Data for tabs
  const { data: invoicesResponse, isLoading: invoicesLoading } = useInvoices(
    { pageNumber: 1, pageSize: 100 },
    { projectId: id }
  );
  
  const { data: expensesResponse, isLoading: expensesLoading } = useExpenses(
    { pageNumber: 1, pageSize: 100 },
    { projectId: id }
  );

  const { data: advancesResponse, isLoading: advancesLoading } = useJournalEntries(
    { pageNumber: 1, pageSize: 100 },
    { projectId: id, referenceType: JournalEntryReferenceType.Payment }
  );

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold">Project Not Found</h2>
        <Button variant="link" onClick={() => navigate('/projects')}>Back to Projects</Button>
      </div>
    );
  }

  const invoices = invoicesResponse?.data?.data || [];
  const expenses = expensesResponse?.data?.data || [];
  const advances = advancesResponse?.data?.data || [];

  // Financial Stats
  const invoicedAmount = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.total || 0), 0);
  const totalAdvances = advances.reduce((sum, adv) => sum + (adv.totalDebit || 0), 0);
  const totalCosts = totalExpenses + totalAdvances;
  const netProfit = invoicedAmount - totalCosts;
  const profitMargin = invoicedAmount > 0 ? (netProfit / invoicedAmount) * 100 : 0;

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Active: return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case ProjectStatus.Completed: return <Badge className="bg-blue-100 text-blue-700">Completed</Badge>;
      case ProjectStatus.OnHold: return <Badge className="bg-yellow-100 text-yellow-700">On Hold</Badge>;
      case ProjectStatus.Cancelled: return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-700">Not Started</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              {getStatusBadge(project.status)}
            </div>
            <p className="text-gray-500">{project.customerName || 'No Client Assigned'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(`/projects/new-with-contract?edit=${project.id}`)}>
            Edit Project
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Layout className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" /> Payments
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Expenses
          </TabsTrigger>
          <TabsTrigger value="advances" className="flex items-center gap-2">
            <Clock className="w-4 h-4" /> Advances
          </TabsTrigger>
          <TabsTrigger value="profitability" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Profitability
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <div className="mt-6">
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Project Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-sm text-gray-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Start Date
                      </span>
                      <p className="font-medium">{formatDate(project.createdAt)}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-gray-500 flex items-center gap-2">
                        <User className="w-4 h-4" /> Client
                      </span>
                      <p className="font-medium">{project.customerName || '---'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-gray-500">Description</span>
                    <p className="text-gray-700">{project.description || 'No description provided.'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Contract Value</span>
                    <span className="font-bold">{formatNumber(project.contractValue)} EGP</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Total Invoiced</span>
                    <span className="font-bold text-indigo-600">{formatNumber(invoicedAmount)} EGP</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-bold">
                      {project.contractValue > 0 ? ((invoicedAmount / project.contractValue) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Invoices & Payments</CardTitle>
                    <CardDescription>All billing documents associated with this project</CardDescription>
                  </div>
                  <Badge variant="outline">{invoices.length} Invoices</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                      <tr>
                        <th className="py-3 px-4">Invoice #</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {invoices.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500 italic">No invoices found for this project.</td>
                        </tr>
                      ) : (
                        invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-indigo-600">{inv.invoiceNumber}</td>
                            <td className="py-3 px-4">{formatDate(inv.issueDate)}</td>
                            <td className="py-3 px-4 font-bold">{formatNumber(inv.total)} EGP</td>
                            <td className="py-3 px-4">
                              <Badge variant={inv.status === 'Paid' ? 'outline' : 'secondary'}>{inv.status}</Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button variant="ghost" size="sm" onClick={() => navigate(`/invoice/${inv.id}`)}>View</Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Project Expenses</CardTitle>
                    <CardDescription>Direct costs recorded for materials, labor, etc.</CardDescription>
                  </div>
                  <Badge variant="outline">{expenses.length} Expenses</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Notes</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {expenses.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-500 italic">No expenses recorded for this project.</td>
                        </tr>
                      ) : (
                        expenses.map((exp) => (
                          <tr key={exp.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4">{formatDate(exp.date)}</td>
                            <td className="py-3 px-4"><Badge variant="outline">{exp.categoryName}</Badge></td>
                            <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{exp.notes || '---'}</td>
                            <td className="py-3 px-4 text-right font-bold text-red-600">{formatNumber(exp.total)} EGP</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advances">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Advances & Custody Used</CardTitle>
                    <CardDescription>Employee advances or payments associated with this project</CardDescription>
                  </div>
                  <Badge variant="outline">{advances.length} Entries</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                      <tr>
                        <th className="py-3 px-4">#Number</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {advances.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-500 italic">No advances found for this project.</td>
                        </tr>
                      ) : (
                        advances.map((adv) => (
                          <tr key={adv.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 font-mono text-xs">{adv.entryNumber}</td>
                            <td className="py-3 px-4">{formatDate(adv.date)}</td>
                            <td className="py-3 px-4 text-gray-500">{adv.description || '---'}</td>
                            <td className="py-3 px-4 text-right font-bold text-orange-600">{formatNumber(adv.totalDebit)} EGP</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profitability">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profitability Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl">
                      <div>
                        <p className="text-sm text-green-700 font-medium">Total Revenue (Invoiced)</p>
                        <h3 className="text-xl font-bold text-green-900">{formatNumber(invoicedAmount)} EGP</h3>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-200" />
                    </div>

                    <div className="flex justify-between items-center bg-red-50 p-4 rounded-xl">
                      <div>
                        <p className="text-sm text-red-700 font-medium">Total Project Costs</p>
                        <h3 className="text-xl font-bold text-red-900">{formatNumber(totalCosts)} EGP</h3>
                        <p className="text-[10px] text-red-400 mt-1">Expenses + Advances</p>
                      </div>
                      <Briefcase className="w-8 h-8 text-red-200" />
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center p-2">
                        <span className="text-gray-600 font-bold">Net Profit</span>
                        <span className={`text-2xl font-black ${netProfit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                          {formatNumber(netProfit)} EGP
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2">
                        <span className="text-gray-500">Margin</span>
                        <span className={`text-lg font-bold ${profitMargin >= 0 ? 'text-indigo-400' : 'text-red-400'}`}>
                          {profitMargin.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-[300px]">
                  <div className="w-full space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Direct Expenses ({((totalExpenses / (totalCosts || 1)) * 100).toFixed(0)}%)</span>
                        <span>{formatNumber(totalExpenses)} EGP</span>
                      </div>
                      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full" style={{ width: `${(totalExpenses / (totalCosts || 1)) * 100}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Advances Used ({((totalAdvances / (totalCosts || 1)) * 100).toFixed(0)}%)</span>
                        <span>{formatNumber(totalAdvances)} EGP</span>
                      </div>
                      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full" style={{ width: `${(totalAdvances / (totalCosts || 1)) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-8 text-xs text-center text-gray-400 max-w-[200px]">
                    This breakdown help you understand where your project budget is going.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ProjectDetails;
