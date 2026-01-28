import React, { useState } from 'react';
import { Upload, Database, CheckCircle2, Clock, FileSpreadsheet, Download, MoreVertical } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/common/Toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileUpload } from '@/components/common/FileUpload';
import { EmptyState } from '@/components/common/EmptyState';
import { MaterialIndexVersion, UploadedFile } from '@/lib/types';
import { mockMaterialIndexVersions } from '@/lib/mockData';
import { formatDate, formatFileSize, generateId } from '@/lib/utils';

export function MaterialIndexPage() {
  const { user } = useAuth();
  const { success } = useToast();

  const [versions, setVersions] = useState<MaterialIndexVersion[]>(mockMaterialIndexVersions);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const activeVersion = versions.find((v) => v.isActive);

  const handleSetActive = (versionId: string) => {
    setVersions((prev) =>
      prev.map((v) => ({
        ...v,
        isActive: v.id === versionId,
      }))
    );
    success('Material Index version activated');
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0 || !uploadFiles.every((f) => f.status === 'complete')) return;

    setIsUploading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newVersion: MaterialIndexVersion = {
      id: generateId(),
      versionNumber: `v${(parseFloat(versions[0]?.versionNumber.replace('v', '') || '0') + 0.1).toFixed(1)}`,
      name: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()} Material Standards`,
      isActive: false,
      files: uploadFiles,
      uploadedBy: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
      uploadedAt: new Date(),
      itemCount: Math.floor(Math.random() * 500) + 1000,
    };

    setVersions((prev) => [newVersion, ...prev]);
    setUploadFiles([]);
    setIsUploading(false);
    setUploadModalOpen(false);
    success('Material Index uploaded successfully');
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Material Index</h1>
          <p className="text-neutral-500 mt-1">
            Manage the baseline of approved materials used in conformance checks
          </p>
        </div>
        <Button onClick={() => setUploadModalOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload New Version
        </Button>
      </div>

      {/* Active version card */}
      {activeVersion && (
        <Card className="border-success-200 bg-success-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success-100 rounded-lg">
                  <Database className="h-6 w-6 text-success" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{activeVersion.name}</CardTitle>
                    <Badge variant="success" size="sm">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <CardDescription className="mt-0.5">
                    {activeVersion.versionNumber} · {activeVersion.itemCount.toLocaleString()} materials
                  </CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
              <span>Uploaded by {activeVersion.uploadedBy}</span>
              <span>·</span>
              <span>{formatDate(activeVersion.uploadedAt)}</span>
              <span>·</span>
              <span>{activeVersion.files.length} file{activeVersion.files.length !== 1 ? 's' : ''}</span>
            </div>
            {activeVersion.files.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeVersion.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white rounded border border-neutral-200"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-success" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-neutral-400">({formatFileSize(file.size)})</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Version history */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Version History</h2>
        {versions.length === 0 ? (
          <EmptyState
            icon={<Database className="h-8 w-8" />}
            title="No Material Index versions"
            description="Upload your first Material Index to start running conformance checks"
            action={{
              label: 'Upload Version',
              onClick: () => setUploadModalOpen(true),
            }}
          />
        ) : (
          <div className="space-y-3">
            {versions.map((version) => (
              <Card key={version.id} className={version.isActive ? 'border-success-200' : ''}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${version.isActive ? 'bg-success-100' : 'bg-neutral-100'}`}>
                        <Database className={`h-5 w-5 ${version.isActive ? 'text-success' : 'text-neutral-500'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-neutral-900">{version.name}</h3>
                          <span className="text-sm text-neutral-400">{version.versionNumber}</span>
                          {version.isActive && (
                            <Badge variant="success" size="sm">Active</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-neutral-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(version.uploadedAt)}</span>
                          <span>·</span>
                          <span>{version.uploadedBy}</span>
                          <span>·</span>
                          <span>{version.itemCount.toLocaleString()} materials</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!version.isActive && (
                          <DropdownMenuItem onClick={() => handleSetActive(version.id)}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Set as Active
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upload modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload New Material Index Version</DialogTitle>
            <DialogDescription>
              Upload Excel or PDF files containing the updated material baseline.
              The new version will not be active until you explicitly set it.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <FileUpload
              files={uploadFiles}
              onFilesChange={setUploadFiles}
              acceptedFormats={['pdf', 'xls', 'xlsx']}
              description="PDF or Excel files with material specifications"
            />
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setUploadFiles([]);
                setUploadModalOpen(false);
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              loading={isUploading}
              disabled={uploadFiles.length === 0 || !uploadFiles.every((f) => f.status === 'complete')}
            >
              Upload Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
