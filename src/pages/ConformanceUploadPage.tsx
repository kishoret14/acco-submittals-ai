import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Play, Database, Info, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUpload } from '@/components/common/FileUpload';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/components/common/Toast';
import { UploadedFile } from '@/lib/types';
import { mockProjects, mockMaterialIndexVersions } from '@/lib/mockData';
import { cn } from '@/lib/utils';

export function ConformanceUploadPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const project = mockProjects.find((p) => p.id === projectId);
  const activeMaterialIndex = mockMaterialIndexVersions.find((v) => v.isActive);

  const [submittalFiles, setSubmittalFiles] = useState<UploadedFile[]>([]);
  const [specificationFiles, setSpecificationFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');

  const canRunConformance =
    submittalFiles.length > 0 &&
    submittalFiles.every((f) => f.status === 'complete') &&
    specificationFiles.length > 0 &&
    specificationFiles.every((f) => f.status === 'complete');

  const handleRunConformance = async () => {
    if (!canRunConformance) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    // Simulate processing stages
    const stages = [
      { progress: 10, status: 'Uploading documents...' },
      { progress: 25, status: 'Extracting submittal items...' },
      { progress: 40, status: 'Parsing project specifications...' },
      { progress: 55, status: 'Loading Material Index...' },
      { progress: 70, status: 'Running AI conformance analysis...' },
      { progress: 85, status: 'Matching materials against specifications...' },
      { progress: 95, status: 'Generating conformance report...' },
      { progress: 100, status: 'Complete!' },
    ];

    for (const stage of stages) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProcessingProgress(stage.progress);
      setProcessingStatus(stage.status);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    success('Conformance check complete! Redirecting to results...');

    // Navigate to the results page (using mock run ID)
    setTimeout(() => {
      navigate(`/projects/${projectId}/conformance/run-1`);
    }, 1000);
  };

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-neutral-900">Project not found</h2>
        <p className="text-neutral-500 mt-2">The project you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/projects')} className="mt-4">
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-neutral-500">
          <Link to="/projects" className="hover:text-primary">
            Projects
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link to={`/projects/${projectId}`} className="hover:text-primary truncate max-w-[200px]">
            {project.name}
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-neutral-900 font-medium">New Conformance Check</span>
        </nav>

        {/* Page header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">New Conformance Check</h1>
            <p className="text-neutral-500 mt-1">
              Upload your project documents to run an AI-powered conformance analysis
            </p>
          </div>
        </div>

        {/* Processing state */}
        {isProcessing ? (
          <Card>
            <CardContent className="py-12">
              <div className="max-w-md mx-auto text-center space-y-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 mx-auto">
                  {processingProgress < 100 ? (
                    <div className="animate-spin">
                      <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </div>
                  ) : (
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900 mb-2">
                    {processingProgress < 100 ? 'Processing Documents' : 'Analysis Complete'}
                  </h2>
                  <p className="text-neutral-500">{processingStatus}</p>
                </div>
                <div className="space-y-2">
                  <Progress value={processingProgress} className="h-2" />
                  <p className="text-sm text-neutral-400">{processingProgress}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Upload sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Submittal files */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Submittal / Matrix Index</CardTitle>
                  <CardDescription>
                    Upload the project submittals or material matrix
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    files={submittalFiles}
                    onFilesChange={setSubmittalFiles}
                    acceptedFormats={['pdf', 'xls', 'xlsx']}
                    description="PDF or Excel files containing submittal materials"
                  />
                </CardContent>
              </Card>

              {/* Specification files */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Project Specification</CardTitle>
                  <CardDescription>
                    Upload the project specification documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    files={specificationFiles}
                    onFilesChange={setSpecificationFiles}
                    acceptedFormats={['pdf', 'xls', 'xlsx']}
                    description="PDF or Excel files containing project specifications"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Material Index info */}
            <Card className="bg-neutral-50 border-neutral-200">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-accent-100 rounded-md">
                    <Database className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-neutral-900">Material Index</h3>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-neutral-400 hover:text-neutral-600">
                            <Info className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            The admin-managed Material Index is automatically included in all conformance checks.
                            It contains ACCO's baseline of approved materials.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {activeMaterialIndex ? (
                      <p className="text-sm text-neutral-500 mt-1">
                        <span className="font-medium">{activeMaterialIndex.name}</span>
                        <span className="mx-2">·</span>
                        <span>{activeMaterialIndex.versionNumber}</span>
                        <span className="mx-2">·</span>
                        <span>{activeMaterialIndex.itemCount.toLocaleString()} materials</span>
                      </p>
                    ) : (
                      <p className="text-sm text-warning-700 mt-1">
                        No active Material Index. Contact an administrator.
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-700">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Auto-included
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action bar */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button
                onClick={handleRunConformance}
                disabled={!canRunConformance}
                className="min-w-[160px]"
              >
                <Play className="mr-2 h-4 w-4" />
                Run Conformance
              </Button>
            </div>

            {!canRunConformance && (submittalFiles.length > 0 || specificationFiles.length > 0) && (
              <Alert variant="info">
                <AlertDescription>
                  Upload at least one file in each section and wait for uploads to complete before running the conformance check.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
