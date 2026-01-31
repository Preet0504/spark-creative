import { useState } from 'react';
import {
  CourseMaterial,
  useCourseMaterialMutations,
} from '@/hooks/useCourseMaterials';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  FileText,
  Link as LinkIcon,
  File,
  Download,
  Trash2,
  ExternalLink,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MaterialsListProps {
  materials: CourseMaterial[];
  isLoading?: boolean;
  canManage?: boolean;
}

const MaterialsList = ({
  materials,
  isLoading,
  canManage = false,
}: MaterialsListProps) => {
  const { deleteMaterial, getSignedUrl } = useCourseMaterialMutations();
  const [deleteTarget, setDeleteTarget] = useState<CourseMaterial | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (material: CourseMaterial) => {
    if (!material.file_url) return;

    setDownloading(material.id);
    try {
      const signedUrl = await getSignedUrl(material.file_url);
      
      // Open in new tab or trigger download
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = material.file_name || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMaterial.mutateAsync(deleteTarget);
    setDeleteTarget(null);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'file':
        return <File className="w-5 h-5 text-primary" />;
      case 'link':
        return <LinkIcon className="w-5 h-5 text-primary" />;
      case 'text':
        return <FileText className="w-5 h-5 text-primary" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold text-foreground mb-2">No materials yet</h3>
        <p className="text-muted-foreground text-sm">
          {canManage
            ? 'Add your first course material to get started.'
            : 'No materials have been added to this section yet.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {materials.map((material) => (
          <Card key={material.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getIcon(material.type)}</div>
                  <div>
                    <CardTitle className="text-base">{material.title}</CardTitle>
                    {material.description && (
                      <CardDescription className="mt-1">
                        {material.description}
                      </CardDescription>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {material.type === 'file' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(material)}
                      disabled={downloading === material.id}
                    >
                      {downloading === material.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </Button>
                  )}

                  {material.type === 'link' && material.link_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(material.link_url!, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}

                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(material)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            {material.type === 'text' && material.content && (
              <CardContent>
                <div className="bg-secondary/30 rounded-lg p-4 text-sm whitespace-pre-wrap">
                  {material.content}
                </div>
              </CardContent>
            )}

            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {material.file_name && (
                  <span className="bg-secondary/50 px-2 py-1 rounded">
                    {material.file_name}
                  </span>
                )}
                <span>
                  Added {formatDistanceToNow(new Date(material.created_at), { addSuffix: true })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Material</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MaterialsList;
